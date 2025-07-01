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

async function recordToFacility(record) {
  const facility = {}
  facility.id = record.id;


  Object.entries( record.fields ).forEach( ([key, value]) => {
    const newKey = key.toLowerCase().trim().replace(/\s+/g, "_");
    facility[newKey] = value;
  })
  
  facility.zip = facility.address.split(' ').at(-1);

  if( facility.epa_link ) {
    const permits = await fetchEPADataForUrl(facility.epa_link);
    // console.log( permits );
    facility.permits = permits; 
  }

  const attachments = [];

  for( const recordId of facility.attachments || [] ) {
    base("Attachments").find(recordId, async (error, record) => {
      if( error ){
        console.error(error);
        return;
      }

      // console.log( record.fields )
      const group = {
        heading: record.fields.Heading,
        attachments: record.fields.Attachments
      }
      attachments.push(group);
    })
  }

  facility.attachments = attachments;
  
  return facility;
}

base('Permits')
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

    fs.writeFileSync("./site/data/data.json", JSON.stringify( data, null, 2 ));
  })


  