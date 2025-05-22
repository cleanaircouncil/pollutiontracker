import html, { slugify } from "./html.js";


export default function Permit({ permit }) {
  return html`
    <div id="${ slugify(permit.company_name) }" class="card permit js-permit">
      <div class="card-content">
        <p class="title is-4"><a href="#${slugify(permit.company_name)} ">${ permit.company_name }</a></p>
        <p class="subtitle is-6">${ permit.description }</p>

        <div class="content">
          <strong>${ permit.address }</strong><br/>

          ${ permit.status }
        </div>
      </div>
    </div>
  `
}


// <div class="card permit js-permit" x-data='${ JSON.stringify(permit) }'>
// <div class="card-content">
//   <p class="title is-4" x-text="company_name">${ permit.company_name }</p>
//   <p class="subtitle is-6" x-text="description">${ permit.description }</p>

//   <div class="content">
//     <strong>${ permit.address }</strong><br/>

//     ${ permit.status }
//   </div>
// </div>
// </div>
// `