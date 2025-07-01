import html, { slugify } from "./html.js";

export default function Viewer({ url }) {
  return html`
    <iframe id="viewer" src="${url}">
    </iframe>
  `
}