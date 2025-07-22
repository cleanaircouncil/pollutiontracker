import Airtable from "airtable";
import fs from "fs";
import "dotenv/config";
import { slugify } from "./html.js";
import { marked } from "marked";

// import dep from "../src/data/dep-data.json" with { type: 'json' };
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



// async function resolveAttachments(facility) {
//   const resolvers = ( facility.attachments || [] ).map( recordId => new Promise((res, rej) => {
//     base("Attachments").find(recordId, async (error, record) => {
//       if( error ){
//         console.error(error);
//         rej(error);
//         return;
//       }

//       const group = {
//         heading: record.fields.Heading,
//         attachments: record.fields.Attachments
//       }

//       console.log(` 📎 Resolved attachments ${group.heading} (${group.attachments.length})`);

//       res(group);
//     })
//   }))

//   return await Promise.all(resolvers);
// }


// function getDEPViolations( facility ) {
//   const info = dep.violations.find( violation => violation.id == facility.id );
//   if( !info || !info.violations)
//     return undefined;

//   const numYears = 10
//   const cutoffDate = `${ new Date().getFullYear() - numYears }-01-01`;
//   const recentViolations = info.violations.filter( violation => violation.date >= cutoffDate );
  
//   if( !recentViolations.length > 0 )
//     return undefined;

//   return {
//     count: recentViolations.length,
//     since: recentViolations.at(-1).date
//   }
// }

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

  facility.id = record.id;
  facility.slug = slugify(facility.company_name);

  
  if( facility.attachments ) {
    console.log(`  📎 Linking attachments from Airtable...`);
    const attachments = await getAttachments(facility.attachments || []);
    facility.attachments = attachments;
  }

  if( facility.echo_compliance ) {
    console.log(`  📋 Linking compliance data from EPA...`);
    const permits = await getECHOData( facility.echo_compliance );
    facility.permits = permits; 
  }

  if( facility.dep_violations ) {
    console.log(`   ☢️  Collating violation info...`);
    const violations = await getDEPData( facility.dep_violations );
    facility.violations = violations;
  }

  if( facility.clean_air_notes ) {
    facility.clean_air_notes = marked.parse(facility.clean_air_notes);
    console.log(`  ✏️  Rendering Clean Air Notes to HTML...`);
  }

  if( facility.notes ) {
    facility.notes = marked.parse(facility.notes);
    console.log(`  ✏️  Rendering Facility Notes to HTML...`);
  }
  
  

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

    delete facility.attachments_old;

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


  