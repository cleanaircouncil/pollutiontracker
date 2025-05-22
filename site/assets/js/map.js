export default function Map({}) {
  return html`
    <figure id="map" class="js-map"></figure>
  `
}

export function client(document) {
  const map = document.querySelector(".js-map");
}