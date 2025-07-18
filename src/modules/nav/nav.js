import html, { css } from "../utils/html.js"

export default function Nav() {
  return html`
    <nav id="nav">
      <a class="nav-button active"><i class="fa fa-location-dot"></i> Explore Permits</a>
      <a class="nav-button"><i class="fa fa-certificate"></i> About The Tracker</a>
      <a class="nav-button"><i class="fa fa-hand"></i> Get Involved</a>
    </nav>
  `
}


