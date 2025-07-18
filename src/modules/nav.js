import html, { css } from "../utils/html.js"

export default function Nav() {
  return html`
    <nav id="nav">
      <a class="nav-button active"><i class="fa fa-location-dot"></i> Explore Permits</a>
      <a class="nav-button"><i class="fa fa-certificate"></i> About The Tracker</a>
      <a class="nav-button"><i class="fa fa-hand"></i> Get Involved</a>
    </nav>
  `
}


export const styles = css`


#nav {
  background: var(--color-black);
  color: var(--color-white);

  grid-area: nav;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: .5rem;
}

.nav-button {
  text-align: center;
  cursor: pointer;
  transition: color .2s ease-in-out, background-color .2s ease-in-out;
}

.nav-button i {
  display: block;
  font-size: 1.5rem;
  padding: .25rem;
  margin: .25rem;
  width: 8rem;
  margin: .25rem auto;
  border-radius: var(--radius);
  transition: color .2s ease-in-out, background-color .2s ease-in-out;
}

.nav-button.active i {
  background: var(--color-accent);
  
  
}

.nav-button:hover i {
  background: var(--color-highlight);
  color: var(--color-white);
}


@media screen and (min-width:900px) {
  #nav {
    background: var(--color-black);
    color: var(--color-white);
    display: flex;
    align-items: center;
    gap: min(2vw, 3rem);
    padding-left: 1rem;
  }

  .nav-button {
    padding: .25rem 1rem;
    display: flex;
    gap: .5rem;
    line-height: 1.5rem;
    white-space: nowrap;
    border-radius: 2rem;
  }


  .nav-button i {
    display: inline-block;
    font-size: 1.5rem;
    padding: unset;
    margin: unset;
    width: auto;
  }

  .nav-button:hover i {
    background: unset;
    color: unset;
  }

  .nav-button.active {
    background: var(--color-accent);
  }

  .nav-button:hover, .nav-button.active:hover {
    background: var(--color-highlight);
    color: var(--color-white);
  }
}

`