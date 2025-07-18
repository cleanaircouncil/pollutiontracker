export default function FacilityCard({ facility }) {
  return html`
    <article class="facility-card stack" :id="facility.slug">
      <div>
      <template x-if="facility.permit_status">
        <span class="permit-status" x-text="facility.permit_status"></span>
      </template>

      <h3>
        <a class="facility-card__link" href="#${facility.slug}">${ facility.company_name }</a>
      </h3>

      <p class="text-detail"><strong>${ facility-description }</strong></p>
      <p class="text-detail">
        <i class="fa fa-location-dot color-gray-dark"></i> ${ facility.address }
      </p>
    </div>
    

    <template x-if="facility.permits?.length > 0">
      <footer class="grid-three gap-tight">
        <template x-for="permit in facility.permits">
          <figure class="permit" :class="$store.permits.classes(permit)">
            <header>
              <small>
                <strong><i class="fa" :class="$store.permits.icon(permit)"></i> <span
                    x-text="$store.permits.short(permit)"></span></strong>
                (<abbr :title="$store.permits.long(permit)" x-text="permit.statute"></abbr>)
              </small>
            </header>
          </figure>
        </template>
      </footer>
    </template>


  </article>
  `
}