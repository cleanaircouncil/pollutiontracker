import Facility from "./facility.js";
import Viewer from "./viewer.js";
import Map from "./map.js";
import { renderHTML } from "./html.js";

async function initData() {
  const response = await fetch("data/data.json");
  const data = await response.json();
  return data;
}

async function initMap() {
  const map = new maplibregl.Map({
    container: 'map', // container id
    style: 'https://api.maptiler.com/maps/streets-v2/style.json?key=v64Bpd9Og2E4Zm916XUB', // style URL
    center: [-75.165222, 39.952583],
    attributionControl: false,
    zoom: 9 // starting zoom
  });

  return new Promise(res => {
    map.on('load', async() => {
      res(map);
    })
  })
}

async function initMarkers(map, data) {
  const image = await map.loadImage('https://maplibre.org/maplibre-gl-js/docs/assets/custom_marker.png');
  map.addImage('custom-marker', image.data);

  map.addSource("facilities", {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: data.facilities?.map( facility => ({
        type: 'Feature',
        properties: {
          id: facility.id
        },
        geometry: {
          type: 'Point',
          coordinates: [facility.longitude, facility.latitude]
        }
      }))
    }
  })

  map.addLayer({
    id: 'symbols',
    type: 'symbol',
    source: 'facilities',
    layout: {
      'icon-image': 'custom-marker'
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

function focusOnFacility(map, facility) {
  map.flyTo({
    center: [facility.longitude, facility.latitude],
    zoom: 14
  })
}



async function init() {
  const map = await initMap(); 
  const data = await initData();

  const facilities = data.facilities?.map( facility => Facility({facility}) );

  const display = document.getElementById("results");

  display.append( ...facilities.map(renderHTML) );

  await initMarkers(map, data);
  initInteractivity(map, data);
}


document.addEventListener("DOMContentLoaded", init);