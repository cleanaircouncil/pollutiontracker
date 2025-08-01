import parse from "node-html-parser";
import airtableAPI, { Bases, jsonify } from "./airtable.js";

export default async function fetchDEPDataForURL(dep_link) {
  try {
    const response = await fetch(dep_link);
    const page = await response.text();
    const html = parse.parse(page);
    const table = html.getElementById("ContentPlaceHolder2_gvSiteInpections");
    const rows = [...table.querySelectorAll("tr")];
    const inspections = rows.map( (row) => ({
      Name: row.childNodes[1].innerText.trim(),
      Date: row.childNodes[2].innerText.trim().replace(/(\d\d)\/(\d\d)\/(\d\d\d\d)/, "$3-$1-$2"),
      Type: row.childNodes[3].innerText.trim(),
      Results: row.childNodes[4].innerText.trim()
    }) )

    const violations = inspections.filter( inspection => inspection.Results.indexOf("View") >= 0 );

    const numYears = 10;
    const cutoffDate = `${ new Date().getFullYear() - numYears }-01-01`;
    const recentViolations = violations.filter( violation => violation.Date >= cutoffDate );
    
    if( !recentViolations.length > 0 )
      return undefined;

    return [{
      Name: dep_link.split("=").at(-1).trim(),
      "Violation Count": recentViolations.length,
      Since: recentViolations.at(-1).Date
    }]

    return violations;
  } catch(e) {
    console.log(e);
    return undefined;
  }
}


async function updateTable(record) {
  const facility = jsonify(record);
  
  console.log( `🏭 ${facility.company_name.trim()}`);

  if( !facility.dep_link ) 
    return;

  console.log(`  🔗 Getting facility data from DEP...`);
  const depData = await fetchDEPDataForURL(facility.dep_link);

  if( !depData?.length )
    return;

  const records = depData.map( fields => ({fields: {Facility:[record.id], ...fields}}) );

  

  console.log(`  ⬆️  Pushing ${records.length} record(s) to airtable...`);

  await airtableAPI.patch( Bases.DEP, {
    performUpsert: {
      fieldsToMergeOn: [ "Name" ]
    },

    records
  })

  await new Promise((res) => setTimeout(res, (Math.random() * 4000 + 1000)));
}



export async function runScrape() {
  const result = await airtableAPI.get( Bases.FACILITIES );
  for( const record of result.records ) {
    try {
      await updateTable(record);
    } catch(e) {
      console.log( e );
    }
  }
}