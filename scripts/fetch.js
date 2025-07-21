import Airtable from "airtable";
import fs from "fs";
import "dotenv/config";
import { slugify } from "../site/assets/js/html.js";
import { marked } from "marked";

import dep from "../src/data/dep-data.json" with { type: 'json' };
import airtableAPI, { Bases, jsonify } from "./airtable.js";

const base = new Airtable({
  apiKey: process.env.AIRTABLE_TOKEN
}).base(process.env.AIRTABLE_BASE_ID)


const data = {
  facilities: [

  ]
}


export const EchoStatus = {
  VALID: "Valid",
  VIOLATION: "Violation",
  TERMINATED: "Terminated"
}



async function resolveAttachments(facility) {
  const resolvers = ( facility.attachments || [] ).map( recordId => new Promise((res, rej) => {
    base("Attachments").find(recordId, async (error, record) => {
      if( error ){
        console.error(error);
        rej(error);
        return;
      }

      const group = {
        heading: record.fields.Heading,
        attachments: record.fields.Attachments
      }

      console.log(` 📎 Resolved attachments ${group.heading} (${group.attachments.length})`);

      res(group);
    })
  }))

  return await Promise.all(resolvers);
}


function getDEPViolations( facility ) {
  const info = dep.violations.find( violation => violation.id == facility.id );
  if( !info || !info.violations)
    return undefined;

  const numYears = 10
  const cutoffDate = `${ new Date().getFullYear() - numYears }-01-01`;
  const recentViolations = info.violations.filter( violation => violation.date >= cutoffDate );
  
  if( !recentViolations.length > 0 )
    return undefined;

  return {
    count: recentViolations.length,
    since: recentViolations.at(-1).date
  }
}


async function getECHOData( ids ) {
  const results = [];
  for( const id of ids ) {
    const data = await airtableAPI.get( `${Bases.ECHO}/${id}` )
    const json = jsonify(data);
    delete json.name;
    delete json.facility;

    results.push( json );
  }
  
  return results;
}

async function recordToFacility(record) {
  const facility = jsonify(record);
  facility.id = record.id;

  
  console.log( `🏭 ${facility.company_name.trim()}`);

  facility.slug = slugify(facility.company_name);

  if( facility.echo_compliance ) {
    console.log(`  🔗 Linking compliance data from EPA...`);
    const permits = await getECHOData( facility.echo_compliance );
    facility.permits = permits; 
  }

  if( facility.clean_air_notes ) {
    facility.clean_air_notes = marked.parse(facility.clean_air_notes);
    console.log(`  ✏️  Rendering Clean Air to HTML...`);
  }

    if( facility.notes ) {
    facility.notes = marked.parse(facility.notes);
    console.log(`  ✏️  Rendering Notes to HTML...`);
  }
  
  facility.attachments = await resolveAttachments(facility);
  facility.zip = facility.address.split(' ').at(-1).trim();
  facility.alert = facility.permits?.length > 0 && facility.permits.some( permit => permit.status == EchoStatus.VIOLATION );
  
  if( facility.permits?.length > 0 ) {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    });

    const totalPenalties = facility.permits.reduce( (sum, permit) => sum + permit.penalties, 0 );
    facility.totalPenalties = formatter.format( totalPenalties );
  }

  const violations = getDEPViolations( facility );
  if( violations ) {
    console.log(`   ☢️  Collating violation info...`);
    facility.violations = violations;
  }
  
  delete facility['attachments_(old)'];

  return facility;
}


console.log( "✈️  Querying Airtable...")

base('Facilities')
  .select()
  .eachPage( async function page (records, fetchNextPage) {
    for( const record of records ) {
      const facility = await recordToFacility(record);
      data.facilities.push( facility );
    }

    fetchNextPage();
  }, async function done(error) {
    if(error) {
      console.error(error);
    }  

    data.facilities.sort((a, b) => a.company_name.toLowerCase() < b.company_name.toLowerCase() ? -1 : 1 )

    console.log( "💾 Writing data.json...")
    fs.writeFileSync("./src/data/data.json", JSON.stringify( data, null, 2 ));
    console.log("✅ Done!")
  })


  