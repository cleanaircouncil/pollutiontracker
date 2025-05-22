import { html, dom } from "./html.js";

export default function Permit({ permit }) {
  return dom`
    <div class="permit js-permit">
      <h2>${ permit.company_name }</h2>
      <h3>${ permit.description }</h3>
      <strong>${ permit.address }</strong><br/>
      <em>${ permit.latitude}, ${ permit.longitude }</em>
    </div>
  `
}

export function client(document) {
  const permits = document.querySelectorAll(".js-permit");
}

export function initPermit( permit ) {
  console.log(permit);
}