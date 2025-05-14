
const Airtable = require("airtable");
const BASE_ID = "appfvu7sPuEmPaoBn";
const TOKEN = "patH3spnoUNgDQFLV.c016d614feed7b609af380c732191170d5a70f24163fecf45f59ac77e74690ec";



function init() {
  const base = new Airtable({
    apiKey: TOKEN
  }).base(BASE_ID)
  
  const table = document.getElementById("records");
  base('Permits')
    .select()
    .eachPage( (records, fetchNextPage) => {
      records.forEach( record => {
        // const row = html`${ 
        //   Object.values(record.fields)
        //     .map( value, html`<td>${ value }</td>`)}
        // `

        table.innerHTML += JSON.stringify( record.fields );
      })

      fetchNextPage();
    })
}



document.addEventListener("DOMContentLoaded", init);

// https://airtable.com/appfvu7sPuEmPaoBn/tblPSkTDlDXgxvDf0/viw1BGFYPPHVoudgl?blocks=hide