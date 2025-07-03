
import html, { slugify } from "./html.js";

export default function Facility({ facility }) {
  return html`
    <div id="${ slugify(facility.company_name) }" class="card facility-card js-facility" data-id="${ facility.id }">
      <header>
        ${ facility.status }
        <p class="title is-4"><a class="js-facility-link" href="#${slugify(facility.company_name)}">${ facility.company_name }</a></p>
        <p class="subtitle is-6">${ facility.description }</p>
        <p>${ facility.address }</p>
      </header>

      <div>
        <h4>Current Permits and Compliance</h4>
        ${ facility.permits && html`
          <div class="grid">
            ${ facility.permits.map( permit => Permit({ permit }))}
          </div>  
          <div>
            <a href="${facility.epa_link}">More info at ECHO</a>
          </div>
        `}
      </div>

      <div>
        ${ facility.attachments && html`
          <div>
            ${ facility.attachments.map( group => AttachmentGroup({ group }))}
          </div>
        `}

      </div>
    </div>
  `
}


export function Permit({ permit }) {
  const icons = {
    "Air": "fa-fan",
    "Water": "fa-water",
    "Waste": "fa-arrows-spin"
  }

  const icon = icons[permit.type];
  console.log( permit.type, icon );

  return html`
    <figure class="cell box">
      <header>
        <strong><i class="fa ${icon}"></i> ${ permit.type }</strong> (${permit.statute})
      </header>

      <strong>${ permit.status_text }</strong>
      ${ permit.last_inspection && html`<em>as of ${permit.last_inspection}</em>` }
    </figure>
  `
}

export function AttachmentGroup({ group }) {
  return html`
    <p>
      <header>
        <h4>${ group.heading }</h4>
      </header>
      <ul>
      ${ group.attachments.map( attachment => AttachmentThumbnail({url: attachment.url, filename: attachment.filename, thumbnail: attachment.thumbnails.small })) }
      </ul>
    </p>
  `
}

export function AttachmentThumbnail({ url, filename, thumbnail }) {
  return html`
    <li><a href="${url}">
      ${ filename }
    </a></li>`
}

//<img src="${thumbnail.url}" width="${thumbnail.width}" height="${thumbnail.height}"></img>