import html, { slugify } from "./html.js";

export default function Viewer({ url, name }) {
  return html`
    <div id="viewer">
      <header class="layout-spread">
        <div>
          <strong>${ name }</strong>
        </div>

        <div class="layout-row gap">
          <a href="${url}" download="${name}"><i class="fa fa-download"></i> Download PDF</a>
          <button class="js-attachment-viewer-close"><i class="fa fa-close"></i></button>
        </div>
      </header>
      <iframe src="${url}"></iframe>
    </div>
  `
}