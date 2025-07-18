import html from "./utils/html.js";

import App, { head as headApp } from "./modules/app/index.js";
import { head as headMap } from "./modules/map/index.js";


export default async function Page() {
  return html`
    <html>
      <head>
        ${ headApp }
        ${ headMap }

        <link rel="stylesheet" href="./styles.css" />
        <script type="module" src="./client.js"></script>
      </head>

      <body>
        ${ await App() }
      </body>

    </html>
  `
}
