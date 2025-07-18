export default function Map() {
  return html`
    <figure id="map"></figure>
  `;
}


export const head = html`
  <script src='https://unpkg.com/maplibre-gl@latest/dist/maplibre-gl.js'></script>
  <link href='https://unpkg.com/maplibre-gl@latest/dist/maplibre-gl.css' rel='stylesheet' />
`

export const styles = css`{

}`

export function client(init){

}