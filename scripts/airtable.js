import "dotenv/config";
import apify from "./apify.js";


function toSnakeCase(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_-]/g, "")
}

export function jsonify(record) {
  const entries = Object.entries( record.fields )
  const fields = entries.map( ([key, value]) => [ toSnakeCase(key), value ] );
  const json = Object.fromEntries(fields);
  return json;
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