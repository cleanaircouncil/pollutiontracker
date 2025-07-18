export default function html(strings, ...values) {
  const htmlString = strings.reduce( (result, string, i) => {
    const value = values[i];
    
    result += string;

    if( value == null ) {
      result += "";
    } else if( Array.isArray(value) ) {
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
       //  } else if ( typeof val === "function" ) {
          //set up a listener when this is added?
          //addEventListener(key, val);
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

export function renderHTML( htmlString ) {
  const template = document.createElement("template");
  template.innerHTML = htmlString;
  return template.content.cloneNode(true);
}

export function slugify(string) {
  return string.toLowerCase().trim().replace(/\s+/g, "-")
}

export function css(strings, ...values) {
  return strings;
}