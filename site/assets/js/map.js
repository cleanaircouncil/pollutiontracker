

export default function Map({ data }) {

}


function initMap() {
  const map = new maplibregl.Map({
    container: 'map', // container id
    style: 'https://api.maptiler.com/maps/streets-v2/style.json?key=v64Bpd9Og2E4Zm916XUB', // style URL
    center: [-75.165222, 39.952583],
    zoom: 9, // starting zoom
    attributionControl: false
  });

  return map;
}

function initMarkers(map, data) {
  data.permits?.forEach( permit => {
    const marker = new maplibregl.Marker();
    marker.setLngLat( [permit.longitude, permit.latitude] );
    marker.addTo(map);
  })
}

export function client(document) {
  const map = document.querySelector(".js-map");
  initMap()
}

export function focusOn( data ) {
  
}