import Search from "./search.js"
// import Nav from "./nav.js"
import html, { css } from "../utils/html.js"

// import Search from "./search.js";
// import FacilityCard from "./facility-card.js";
// import Map from "./map.js";



export const head = html`
  <title>Pollution Tracker: Clean Air Council</title>
  
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300..800;1,300..800&display=swap"
    rel="stylesheet">
  <link rel="stylesheet" href="./assets/css/fontawesome/css/fontawesome.min.css" />
  <link rel="stylesheet" href="./assets/css/fontawesome/css/solid.min.css" />
`

export const styles = css`
  .app {
    background: red;
  }
`



export default async function App() {
  return html`
    <main id="app">
      <header id="header">
        <hgroup>
          <a href="https://cleanair.org"><img class="logo" src="./assets/img/cac-logo.png" alt="Clean Air Council Logo"/></a>
          <h1>Pollution Tracker</h1>
        </hgroup>
      </header>

      



      <aside id="results-holder">
        <div id="results">
          <div id="list" class="layout-controls-content" x-data="facilities">

          </div>
      </aside>

      
    </main>
  `
}