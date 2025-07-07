import Airtable from "airtable";
import fs from "fs";
import "dotenv/config";
import fetchEPADataForUrl from "./echo.js";

const base = new Airtable({
  apiKey: process.env.AIRTABLE_TOKEN
}).base(process.env.AIRTABLE_BASE_ID)


const data = {
  facilities: [

  ]
}


async function resolveAttachments(facility) {
  const resolvers = ( facility.attachments || [] ).map( recordId => new Promise((res, rej) => {
    base("Attachments").find(recordId, async (error, record) => {
      if( error ){
        console.error(error);
        rej(error);
        return;
      }

      // console.log( record.fields )
      const group = {
        heading: record.fields.Heading,
        attachments: record.fields.Attachments
      }

      console.log(` 📎 Resolved attachments ${group.heading} (${group.attachments.length})`);

      // if( facility.id === "recvmdfxyMfIy3NZO" )
      //   console.log( "second", record.fields )

      res(group);
    })
  }))

  return await Promise.all(resolvers);
}

async function recordToFacility(record) {
  const facility = {}
  facility.id = record.id;

  Object.entries( record.fields ).forEach( ([key, value]) => {
    const newKey = key.toLowerCase().trim().replace(/\s+/g, "_");
    facility[newKey] = value;
  })

  console.log( `🏭 ${facility.company_name.trim()}`);

  if( facility.epa_link ) {
    console.log(`  🔗 Getting permit data from EPA...`);
    const permits = await fetchEPADataForUrl(facility.epa_link);
    facility.permits = permits; 
  }
  
  facility.attachments = await resolveAttachments(facility);
  facility.zip = facility.address.split(' ').at(-1).trim();

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


    // console.log( data );

    fetchNextPage();
  }, async function done(error) {
    if(error) {
      console.error(error);
    }  

    data.facilities.sort((a, b) => a.company_name.toLowerCase() < b.company_name.toLowerCase() ? -1 : 1 )

    console.log( "💾 Writing data.json...")
    fs.writeFileSync("./site/data/data.json", JSON.stringify( data, null, 2 ));
    console.log("✅ Done!")
  })


  