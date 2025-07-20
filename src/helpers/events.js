export function dispatch(name, detail) {
  window.dispatchEvent( new CustomEvent(name, { detail }))
}

export function listen(name, receiver) {
  window.addEventListener(name, receiver);
}