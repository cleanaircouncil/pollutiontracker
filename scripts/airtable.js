import "dotenv/config";
import apify from "./apify.js";

export function jsonify(record) {
  const kvp = Object.entries( record.fields )
  kvp.forEach( pair => pair[0] = pair[0].toLowerCase().trim().replace(/\s+/g, "_") );
  const fields = Object.fromEntries(kvp);
  return fields;
}

export const Bases = {
  FACILITIES: 'Facilities',
  ATTACHMENTS: 'Attachments',
  ECHO: "tblz5YLpy4iRDNa7X",
  DEP: 'DEP Violations'
}

const airtableAPI = apify("https://api.airtable.com/v0/appfvu7sPuEmPaoBn", { 
  'Authorization': `Bearer ${process.env.AIRTABLE_TOKEN}`,
  'Content-Type': 'application/json'
})

export default airtableAPI;