
export function updateHash(hash) {
  const url = new URL(window.location);
  url.hash = hash;
  history.pushState({}, "", url);
}

export function updateSearchParam(name, value) {
  const url = new URL(window.location);
  url.searchParams.set(name, value);
  history.replaceState({}, "", url);
}