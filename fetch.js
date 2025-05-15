import Airtable from "airtable";
import fs from "fs";

const AIRTABLE_BASE_ID = "appfvu7sPuEmPaoBn";
const AIRTABLE_TOKEN = "patHAZ5Il0KGV0bfk.4fb8e86a41fe5af65ea25345c3a3950dd7b7dd4b85d96b03b50ab37a68b38ea9";

const base = new Airtable({
  apiKey: AIRTABLE_TOKEN
}).base(AIRTABLE_BASE_ID)


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

    fs.writeFileSync("./data/data.json", JSON.stringify( data, null, 2 ));
  })


  