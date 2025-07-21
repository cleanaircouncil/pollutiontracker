import airtableAPI, { Bases, jsonify } from "./airtable.js";

const kinds = {
  CAA: "Air",
  CWA: "Water",
  RCRA: "Waste",
  EPCRA: "Chemical",
  CERCLA: "Hazardous",
  TSCA: "Toxins"
}

export const EchoStatus = {
  VALID: "Valid",
  VIOLATION: "Violation",
  TERMINATED: "Terminated"
}

const epaCall = ( id ) => `https://echodata.epa.gov/echo/dfr_rest_services.get_dfr?p_id=${id}&p_echo=Y`

const getStatus = (status) => {
  if( ["Terminated Permit"].includes(status) )
    return EchoStatus.TERMINATED;
  else if( ["High Priority Violation", "Violation w/in 1 Year", "Violation Identified"].includes(status) )
    return EchoStatus.VIOLATION;
  else
    return EchoStatus.VALID;
}


async function fetchEPADataForUrl(url) {
  try {
    const id = url.replace(/.*fid=(\d*).*/, "$1");
    const request = epaCall(id);
    const response = await fetch(request);
    const json = await response.json();

    if( json?.Results?.Error ) 
      throw new Error( JSON.stringify(json?.Results?.Error, null, 2) )

    const permits = json?.Results?.EnforcementComplianceSummaries?.Summaries?.map( summary => ({
      Name: `${id}--${summary.Statute}`,
      Statute: summary.Statute,
      Status: getStatus( summary.CurrentStatus ),
      Penalties: summary.TotalPenalties ? parseFloat(summary.TotalPenalties.replace(/[^\d]*/g, '')) : 0,
      "Status Text": summary.CurrentStatus || "In Compliance",
      "Last Inspection": summary.LastInspection,
      "Last Scraped": new Date().toLocaleDateString("en-US")
    }))

    return permits || null;
  } catch(e) {
    console.log( e )
    return undefined;
  }
}


async function updateEchoTable(record) {
  const facility = jsonify(record);
  
  console.log( `🏭 ${facility.company_name.trim()}`);

  if( !facility.epa_link ) 
    return;

  console.log(`  🔗 Getting permit data from EPA...`);
  const epaData = await fetchEPADataForUrl(facility.epa_link);
  if( !epaData?.length )
    return;

  const records = epaData.map( fields => ({fields: {Facility:[record.id], ...fields}}) );

  

  console.log(`  ⬆️  Pushing ${records.length} record(s) to airtable...`);

  await airtableAPI.patch( Bases.ECHO, {
    performUpsert: {
      fieldsToMergeOn: [ "Name" ]
    },

    records
  })

  await new Promise((res) => setTimeout(res, (Math.random() * 4000 + 1000)));
}

(async() => {
  const result = await airtableAPI.get( Bases.FACILITIES );
  for( const record of result.records ) {
    try {
      await updateEchoTable(record);
    } catch(e) {
      console.log( e );
    }
  }
})()