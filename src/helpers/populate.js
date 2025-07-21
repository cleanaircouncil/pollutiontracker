// Populate a DOM element with data, using [data-populate]
// See a full list of options at https://github.com/phillymedia/interactive-template/wiki/Populate
export const populateWithData = (el, data) => {
  const populateableNodes = [...el.querySelectorAll("[data-populate]")]

  if (el.dataset.populate) {
    populateableNodes.unshift(el);
  }

  const contextNodes = populateableNodes.filter( node => {
    const context = node.closest("[data-populate-context]");
    return !context || context == el;
  });

  for (const node of contextNodes) {
    const lines = node.dataset.populate.trim().split(/\s*,\s*/);
    const pairs = lines.map((line) => line.split(/\s*:\s*/));

    for (const [key, target] of pairs) {
      const keys = key.split(".");
      const value = keys.reduce((value, key) => value?.[key], data);
      const isUnset = value == null || value == undefined;
      const targets = target?.split(/\s+/) || ["innerHTML"];

      for (const target of targets) {
        if (target.startsWith(".")) {
          node.classList.toggle(target.substring(1), isUnset ? false : value);
        }
        
        if( isUnset )
          continue;

        if (target == "innerHTML") {
          node.innerHTML = value;
        } else if (target.startsWith("@")) {
          node.setAttribute(target.substring(1), value);
        } else if (target.startsWith("--")) {
          node.style.setProperty(target, value);
        }
      }
    }
  }
};