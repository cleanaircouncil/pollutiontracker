import {default as Alpine} from "https://cdn.jsdelivr.net/npm/alpinejs@3.14.7/+esm";

const permitData = {
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


async function initData() {
  const response = await fetch("data/data.json");
  const data = await response.json();
  return data;
}

async function initMap() {
  const map = new maplibregl.Map({
    container: 'map', // container id
    style: 'https://api.maptiler.com/maps/0197e64b-47f4-71b6-9770-751526b1f31b/style.json?key=v64Bpd9Og2E4Zm916XUB', // style URL
    center: [-75.165222, 39.952583],
    attributionControl: false,
    zoom: 10 // starting zoom
  });

  map.setMaxPitch(0);
  map.setMinPitch(0);
  map.touchPitch.disable();
  map.dragRotate.disable();
  map.touchZoomRotate.disableRotation();

  return new Promise(res => {
    map.on('load', async() => {
      res(map);
    })
  })
}

async function initMarkers(map, data) {
 
  data.facilities.forEach((facility) => {
    // create a DOM element for the marker
    const el = document.createElement('div');
    el.classList.add("map-marker");
    el.classList.toggle("map-marker--alert", facility.alert);
    el.setAttribute("data-facility", facility.slug);

    const label = document.createElement("span");
    label.classList.add("map-marker__label")
    label.innerText = facility.company_name;

    el.append(label);

    el.addEventListener('click', () => {
      focusOnFacility(map, facility)
    });

    // add marker to map
    new maplibregl.Marker({element: el})
        .setLngLat([facility.longitude, facility.latitude])
        .addTo(map);
  });


  map.on( 'click', "symbols", (e) => {
    const facility = data.facilities?.find( datum => datum.id == e.features[0].properties.id)
    focusOnFacility(map, facility);
  })

  map.on( 'mouseenter', "symbols", (e) => {
    map.getCanvas().style.cursor = "pointer"
  } )

  map.on( 'mouseleave', "symbols", () => {
    map.getCanvas().style.cursor = ""
  } )
}


function initInteractivity(map, data) {
  const facilityEls = document.querySelectorAll(".js-facility");
  facilityEls.forEach( facilityEl => {
    const linkEl = facilityEl.querySelector(".js-facility-link");
    linkEl.addEventListener("click", () => {
      const facility = data.facilities?.find( datum => datum.id == facilityEl.dataset.id)
      focusOnFacility(map, facility);
    })
  })
}


function updateCurrentFacility(map, facility) {
  const currentEl = document.querySelector(`.map-marker.map-marker--current`);
  const markerEl = document.querySelector(`[data-facility="${facility.slug}"]`)
  
  currentEl?.classList.remove( "map-marker--current");
  markerEl.classList.add( "map-marker--current");

  window.location.hash = `#${facility.slug}`
}



function focusOnFacility(map, facility) {
  if(!facility) return;

  updateCurrentFacility(map, facility);
  map.flyTo({
    center: [facility.longitude, facility.latitude],
    zoom: 14
  })
}


const location = {
  updateHash(hash) {
    const url = new URL(window.location);
    url.hash = hash;
    history.pushState({}, "", url);
  },

  updateSearchParam(name, value) {
    const url = new URL(window.location);
    url.searchParams.set(name, value);
    history.replaceState({}, "", url);
  }
}


async function init() {
  const map = await initMap(); 
  const data = await initData();

  await initMarkers(map, data);
  initInteractivity(map, data);


  document.addEventListener("alpine:init", () => {
    Alpine.data("app", () => ({
      search: "",
      detail: null,
      attachment: null,
      get facilities() {
        const query = this.search.trim().toLowerCase().split(/\s+/);

        const result = data.facilities.filter( facility => {
          if( !query.length ) return true;
          const termMatch = term => facility.company_name.toLowerCase().includes( term ) || facility.address.toLowerCase().includes(term);
          const match = query.every( termMatch  );
          return match;
        })

        return result;
      }
    }))

    Alpine.bind("app", () => ({
      ["@search"]: function(e) {
        location.updateSearchParam("search", e.detail.value);
      },

      ["@lightbox"]: function(e) {
        this.attachment = e.detail.attachment;
      },

      ["@hashchange.window"]: function(e) {
        const slug = new URL( event.newURL ).hash.replace("#", "");
        const facility = data.facilities?.find( facility => facility.slug == slug );
        this.detail = facility;
        focusOnFacility(map, facility)
      }
    }))



    Alpine.store( "permits", {
      short: permit => permitData[permit.statute].short,
      long: permit => permitData[permit.statute].long,
      icon: permit => permitData[permit.statute].icon,
      classes: permit =>`permit--${ permitData[permit.statute].short.toLowerCase() } permit--${ permit.status }`
    })
  })


  Alpine.start();
}


document.addEventListener("DOMContentLoaded", init);