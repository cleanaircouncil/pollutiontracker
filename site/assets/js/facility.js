
import html, { slugify } from "./html.js";

export default function Facility({ facility }) {
  const id = slugify(facility.company_name);
  console.log( facility.attachments )
  return html`
    <div id="${id}" class="facility-card stack js-facility" data-id="${ facility.id }">
      <header class="facility-card__heading">
        <h3><a class="js-facility-link" href="#${id}">${ facility.company_name }</a></h3>
        <p class="text-detail"><strong>${ facility.description }</strong></p>
        <p class="text-detail"><i class="fa fa-location-dot color-gray-dark"></i> ${ facility.address }</p>
      </header>
      
      <div class="facility-card__permits stack-tight">
        <h4 class="is-targeted">Current Permits and Compliance</h4>

      ${ facility.permits && html`
        <div class="grid-three gap-tight">
          ${ facility.permits.map( permit => Permit({ permit }))}
        </div>  
        <div class="text facility-card__echo-link is-targeted">
          <a class="text-detail" target="_blank" href="${facility.epa_link}">
            More info at ECHO <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      `}


      </div>
      
      <div class="text is-targeted">
        ${ facility.attachments?.map( group => AttachmentGroup({ group })) }
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

  const abbr = {
    "CAA": "Clean Air Act",
    "CWA": "Clean Water Act",
    "RCRA": "Recovery Waste C Act",
  }

  const icon = icons[permit.type];

  return html`
    <figure class="permit permit--${permit.type.toLowerCase()} permit--${permit.status}">
      <header class="text-detail">
        <strong><i class="fa ${icon}"></i> ${permit.type}</strong>
        (<abbr title="${abbr[permit.statue]}">${permit.statute}</abbr>)
      </header>
      
      <div class="is-targeted">
        <strong>${permit.status_text}</strong><br/>
        ${ permit.last_inspection && html`<em>as of ${permit.last_inspection}</em>` }
      </div>
    </figure>
  `
}

export function AttachmentGroup({ group }) {
  return html`
    <div class="text">
      <header>
        <h4>${ group.heading }</h4>
      </header>
      <ul>
      ${ group.attachments.map( attachment => AttachmentThumbnail({url: attachment.url, filename: attachment.filename, thumbnail: attachment.thumbnails.small })) }
      </ul>
    </div>
  `
}

export function AttachmentThumbnail({ url, filename, thumbnail }) {
  return html`
    <li><a href="${url}">
      ${ filename }
    </a></li>`
}

//<img src="${thumbnail.url}" width="${thumbnail.width}" height="${thumbnail.height}"></img>