export default function html(strings, ...values) {
  const htmlString = strings.reduce( (result, string, i) => {
    const value = values[i];
    
    result += string;

    if( Array.isArray(value) ) {
      result += value.join("");
    } else if (typeof value === "string") {
      result += value;
    } else if (typeof value === "number") {
      result += String(value);
    } else if (typeof value === "object") {
      result += Object.keys(value).map( key => {
        const val = value[key];
        if (val === true ) {
          return key;
        } else if( val ) {
          return `${key}="${val}"`
        } else {
          return "";
        }
      }).join(' ')
    }
      

    return result;
  }, "");

  return htmlString;
}

const template = document.createElement("template");

export function renderHTML( htmlString ) {
  template.innerHTML = htmlString;
  return template.content.cloneNode(true);
}

export function slugify(string) {
  return string.toLowerCase().trim().replace(/\s+/g, "-")
}
