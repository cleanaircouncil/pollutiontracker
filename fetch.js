import Airtable from "airtable";
import fs from "fs";
import "dotenv/config";

const base = new Airtable({
  apiKey: process.env.AIRTABLE_TOKEN
}).base(process.env.AIRTABLE_BASE_ID)


const data = {
  permits: [

  ]
}

function recordToPermit(record) {
  const permit = {}
  Object.entries( record.fields ).forEach( ([key, value]) => {
    const newKey = key.toLowerCase().trim().replace(/\s+/g, "_");
    permit[newKey] = value;
  })

  return permit;
}

base('Permits')
  .select()
  .eachPage( function page (records, fetchNextPage) {
    records.forEach( record => {
      data.permits.push( recordToPermit(record) )
    })

    console.log( data );

    fetchNextPage();
  }, function done(error) {
    if(error) {
      console.error(error);
    }  

    fs.writeFileSync("./site/data/data.json", JSON.stringify( data, null, 2 ));
  })


  