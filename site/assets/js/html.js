export function html(strings, ...values) {
  return strings.reduce( (result, string, i) => {
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
}

export function render( htmlString, domNode ) {
  const fragment = new DocumentFragment();
  const template = document.createElement("template");
  template.innerHTML = html`${ htmlString }`;
  fragment.append( template.content.cloneNode(true) );
  domNode.append(fragment);
}

const template = document.createElement("template");

export function dom(strings, ...values) {
  const htmlString = html(strings, ...values);  
  template.innerHTML = htmlString;
  return template.content.cloneNode(true);
}