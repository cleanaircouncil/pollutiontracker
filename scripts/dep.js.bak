import parse from "node-html-parser";
import Airtable from "airtable";
import fs from "fs";
import "dotenv/config";

//- cron: "0 0 * * MON";


const base = new Airtable({
  apiKey: process.env.AIRTABLE_TOKEN
}).base(process.env.AIRTABLE_BASE_ID)

const data = {
  violations: [

  ]
}


export default async function fetchDEPDataForURL(dep_link) {
  try {
    const response = await fetch(dep_link);
    const page = await response.text();
    const html = parse.parse(page);
    const table = html.getElementById("ContentPlaceHolder2_gvSiteInpections");
    const rows = [...table.querySelectorAll("tr")];
    const inspections = rows.map( (row) => ({
      id: row.childNodes[1].innerText.trim(),
      date: row.childNodes[2].innerText.trim().replace(/(\d\d)\/(\d\d)\/(\d\d\d\d)/, "$3-$1-$2"),
      type: row.childNodes[3].innerText.trim(),
      results: row.childNodes[4].innerText.trim()
    }) )

    const violations = inspections.filter( inspection => inspection.results.indexOf("View") >= 0 );

    return violations;
  } catch(e) {
    console.log(e);
    return undefined;
  }
}

async function recordToViolations(record) {
  const kvp = Object.entries( record.fields )
  kvp.forEach( pair => pair[0] = pair[0].toLowerCase().trim().replace(/\s+/g, "_") );
  const fields = Object.fromEntries(kvp);

  if( !fields.dep_link ) 
    return undefined;

  console.log( `🏭 ${fields.company_name.trim()}`);
  console.log(`  🔗 Getting permit data from DEP...`);

  return {
    id: record.id,
    dep_link: fields.dep_link,
    violations: await fetchDEPDataForURL(fields.dep_link)
  }
}

base('Facilities')
  .select()
  .eachPage( async function page (records, fetchNextPage) {
    for( const record of records ) {
      const violations = await recordToViolations(record);
      if( violations )
        data.violations.push( violations );
    }

    fetchNextPage();
  }, async function done(error) {
    if(error) {
      console.error(error);
    }  

    console.log( "💾 Writing dep-data.json...")
    fs.writeFileSync("./site/data/dep-data.json", JSON.stringify( data, null, 2 ));
    console.log("✅ Done!")
  })
