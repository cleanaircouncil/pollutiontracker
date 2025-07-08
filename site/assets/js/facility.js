
import html, { slugify } from "./html.js";
// import { Marked } from "./vendor/marked.umd.js";

export default function Facility({ facility }) {
  const id = slugify(facility.company_name);
  const imgUrl = facility.image?.[0]?.url || undefined
  // const md = window.markdownit;
  return html`
    <article id="${id}" class="facility-card stack js-facility" data-id="${ facility.id }" data-zip="${ facility.zip }" data-name="${facility.company_name}">
      <header class="facility-card__heading stack-tight">
        
        ${ imgUrl && html`
          <img class="is-targeted" src="${imgUrl}"/>
        `}

        <div>
          <h3><a class="js-facility-link" href="#${id}">${ facility.company_name }</a></h3>
          <p class="text-detail"><strong>${ facility.description }</strong></p>
          <p class="text-detail"><i class="fa fa-location-dot color-gray-dark"></i> ${ facility.address }</p>
        </div>
      </header>
      
      ${ facility.permits && html`
      <section class="facility-card__permits stack-tight">
        <h4 class="is-targeted">Current Permits and Compliance</h4>
        <div class="grid-three gap-tight">
          ${ facility.permits.map( permit => Permit({ permit }))}
        </div>  
        <div class="text facility-card__echo-link is-targeted">
          <a class="text-detail" target="_blank" href="${facility.epa_link}">
            More info at ECHO <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      </section>
      `}

      ${ facility.notes && html`
        <section class="facility-card__notes stack-tight is-targeted">
          <h4>Facility Notes</h4>
          <div class="text">
            ${ facility.notes }
          </div>
        </section>
      `}
      
      ${ facility.attachments.length > 0 && html`
      <section class="text is-targeted">
        ${ facility.attachments?.map( group => AttachmentGroup({ group })) }
      </section>
      `}
    </article>
  `
}

export function Permit({ permit }) {

  const info = {
    CAA: {
      short: "Air",
      long: "Clean Air Act",
      icon: "fa-fan",
    },
    CWA: {
      short: "Water",
      long: "Clean Water Act",
      icon: "fa-water"
    },
    RCRA: {
      short: "Waste",
      long: "Resource Conservation and Recovery Act",
      icon: "fa-arrows-spin",
    },
    EPCRA: {
      short: "Chemical",
      long: "Emergency Planning and Community Right-to-Know Act",
      icon: "fa-vial",
    },
    CERCLA: {
      short: "Hazardous",
      long: "Comprehensive Environmental Response, Compensation, and Liability Act (Superfund)",
      icon: "fa-triangle-exclamation",
    },
    TSCA: {
      short: "Toxins",
      long: "Toxic Substances Control Act",
      icon: "fa-skull-crossbones",
    }
  }

  const detail = info[permit.statute];

  return html`
    <figure class="permit permit--${detail.short.toLowerCase()} permit--${permit.status}">
      <header>
        <small>
        <strong><i class="fa ${detail.icon}"></i> ${detail.short}</strong>
        (<abbr title="${detail.long}">${permit.statute}</abbr>)
        </small>
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
    <li><small><a class="js-attachment-link" data-url="${url}" data-name="${filename}">
      ${ filename }
    </a></small></li>`
}

//<img src="${thumbnail.url}" width="${thumbnail.width}" height="${thumbnail.height}"></img>