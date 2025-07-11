import Facility from "./facility.js";
import { renderHTML, slugify } from "./html.js";
import Viewer from "./viewer.js";

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

  return new Promise(res => {
    map.on('load', async() => {
      res(map);
    })
  })
}

async function initMarkers(map, data) {
  const marker = await map.loadImage('assets/img/marker-dot.png');
  const currentMarker = await map.loadImage('assets/img/marker-current.png');
  map.addImage('custom-marker', marker.data);
  map.addImage('custom-marker-current', currentMarker.data);

  map.addSource("facilities", {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: data.facilities?.map( facility => ({
        type: 'Feature',
        properties: {
          id: facility.id,
          name: facility.company_name
        },
        geometry: {
          type: 'Point',
          coordinates: [facility.longitude, facility.latitude]
        }
      }))
    }
  });

  map.addSource("labels", {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: data.facilities?.map( facility => ({
        type: 'Feature',
        properties: {
          id: facility.id,
          name: facility.company_name
        },
        geometry: {
          type: 'Point',
          coordinates: [facility.longitude, facility.latitude]
        }
      }))
    }
  });


  map.addSource("current", {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  });

  map.addLayer({
    id: 'symbols',
    type: 'symbol',
    source: 'facilities',
    layout: {
      'icon-image': "custom-marker",
    }
  })

  map.addLayer({
    id: 'current',
    type: 'symbol',
    source: 'current',
    layout: {
      'icon-image': "custom-marker-current",
      "text-field": ['get', 'name'],
      'text-variable-anchor-offset': ['left', [1, 0], 'right', [-2, 0]],
      'text-justify': 'auto',
    }
  })

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
  map.getSource("current").setData({
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties: {
        id: facility.id,
        name: facility.company_name
      },
      geometry: {
        type: 'Point',
        coordinates: [facility.longitude, facility.latitude]
      }
    }]
  });


  window.location.hash = `#${slugify(facility.company_name)}`
}



function focusOnFacility(map, facility) {
  updateCurrentFacility(map, facility);
  map.flyTo({
    center: [facility.longitude, facility.latitude],
    zoom: 14
  })
}


function initSearch() {

  const params = (new URL(document.location)).searchParams;
  for( const [key, value] of params.entries() ){
    const inputs = document.querySelectorAll(`input[name="${key}"]`);
    for( const input of inputs ){
      input.value = value;
    }
  }


  const input = document.getElementById("query");
  input.addEventListener("input", () => {
    const cards = document.querySelectorAll(".js-facility");
    const query = input.value.trim();
    cards.forEach( card => {
      const zipMatch = card.dataset.zip.includes( query );
      const nameMatch = card.dataset.name.toLowerCase().includes( query.toLowerCase() );
      const match = zipMatch || nameMatch
      card.classList.toggle("is-hidden", !match);
    })
  })
}



function initClicks() {
  document.addEventListener("click", (event) => {
    console.log( event );
    if( event.target.matches(".js-attachment-viewer-close") ) {
      event.target.closest("#viewer").remove();
    } else if ( event.target.matches(".js-attachment-link")) {
      event.preventDefault();
      const holder = document.getElementById("viewer-holder");
      const { url, name } = event.target.dataset;
      const viewer = Viewer({ url, name });
      console.log( renderHTML(viewer) );
      holder.append( renderHTML(viewer) );
    }
  })
}

function initRouter( data ) {
  window.addEventListener("hashchange", event => {
    const hash = new URL( event.newURL ).hash.replace("#", "");
    const facility = data.facilities?.find( facility => slugify( facility.company_name ) == hash );
    const facilityComponent = Facility({ facility });
    const facilityContainer = document.getElementById("facility");
    
    facilityContainer.replaceChildren( renderHTML( facilityComponent ) );
  })
}


async function init() {
  const map = await initMap(); 
  const data = await initData();

  const facilities = data.facilities?.map( facility => Facility({facility}) );

  const display = document.getElementById("list");

  display.append( ...facilities.map(renderHTML) );

  await initMarkers(map, data);
  initInteractivity(map, data);
  initSearch();

  initClicks();
  initRouter( data );
}


document.addEventListener("DOMContentLoaded", init);