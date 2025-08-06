import Airtable from "airtable";
import fs from "fs";
import "dotenv/config";
import { slugify } from "./html.js";
import { marked } from "marked";

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

async function getAll( base, ids ) {
  const results = [];
  for( const id of ids ) {
    const data = await airtableAPI.get( `${base}/${id}` )
    results.push(data);
  }

  return results;
}


async function getDEPData( ids ) {
  const data = await getAll( Bases.DEP, ids );
  const results = data.map( datum => {
    const json = jsonify(datum);

    return json;
  })

  return results;
}

async function getECHOData( ids ) {
  const data = await getAll( Bases.ECHO, ids );
  const results = data.map( datum => {
    const json = jsonify(datum);
    delete json.name;
    delete json.facility;

    return json;
  })

  return results;
}


async function getAttachments( ids ) {
  const data = await getAll( Bases.ATTACHMENTS, ids );
  const results = data.map( datum => {
    return jsonify(datum);
  });

  return results;
}


async function recordToFacility(record) {
  const facility = jsonify(record);

  console.log( `🏭 ${facility.company_name.trim()}`);

  facility.slug = slugify(facility.company_name);
  
  if( facility.attachments ) {
    console.log(`  📎 Hydrating attachments from Airtable...`);
    const attachments = await getAttachments(facility.attachments || []);
    facility.attachments = attachments;
  }

  if( facility.echo_compliance ) {
    console.log(`  📋 Hydrating compliance data from EPA...`);
    const echo_compliance = await getECHOData( facility.echo_compliance );
    facility.echo_compliance = echo_compliance; 
  }

  if( facility.dep_violations ) {
    console.log(`  🚨 Hydrating violation info from DEP...`);
    const data = await getDEPData( facility.dep_violations );
    const dep_violations = {
      violation_count: data.at(0).violation_count,
      since: data.at(0).since
    }
    facility.dep_violations = dep_violations;
  }

  if( facility.clean_air_notes ) {
    facility.clean_air_notes = marked.parse(facility.clean_air_notes);
    console.log(`  ✏️  Rendering Clean Air Notes to HTML...`);
  }

  if( facility.notes ) {
    facility.notes = marked.parse(facility.notes);
    console.log(`  ✏️  Rendering Facility Notes to HTML...`);
  }
  
  if( facility.echo_compliance?.length > 0 && facility.echo_compliance.some( permit => permit.status == EchoStatus.VIOLATION ) )
    facility.alert = true;
  
  if( facility.echo_compliance?.length > 0 ) {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    });

    const totalPenalties = facility.echo_compliance.reduce( (sum, permit) => sum + permit.penalties, 0 );
    if (totalPenalties > 0 )
      facility.totalPenalties = formatter.format( totalPenalties );
  }

    delete facility.attachments_old;

  return facility;
}

function produceMapData( data ) {
  console.log("🗺️  Producing map data...")
  const result = {
    facilities: data.facilities.map( ({company_name, latitude, longitude, alert, slug})=> ({company_name, latitude, longitude, alert, slug }))
  }

  return result;
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


    const mapData = produceMapData(data);
    console.log( "💾 Writing map-data.json...")
    fs.writeFileSync("./src/data/map-data.json", JSON.stringify( mapData ));

    console.log("✅ Done!")
  })