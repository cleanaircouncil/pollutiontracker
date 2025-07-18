import fs from "fs";
import dependencyTree from "dependency-tree";
import App from "../src/modules/app.js";
import prettify from "html-prettify";

function camelCase(str) {
  // Using replace method with regEx
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index == 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
}

const pruneComponents = async (path) => {
  console.log('🧵 Importing modules...');
  console.time('✅ Imported modules in');

  const isValidModule = path => path.match(/(\/modules\/)/);
  const extractModulesFromPath = path => path.match(/(src\/modules\/([^\/]*))\/([^\/]*)\//);
  const getModulesFromMatches = ([_, path, folder, module]) => ({ type: module.toLowerCase(), path: `./${path}`, folder, module });

  const dependencies = dependencyTree.toList({
    filename: "./src/modules/app.js",
    directory: "./src",
    filter: path => path.indexOf('node_modules') === -1
  })
    .filter(isValidModule)
    .sort()

  const modules = [];

  for (const dependency of dependencies ) {
    
    try {
      const module = await import(dependency);
      const name = camelCase( dependency.split("/").at(-1).replace(".js", "") );
      modules.push( {name, module} );
      const keys = {
        default: "HTML",
        head: "META",
        styles: "CSS",
        client: "JS",
      }
      const imports = Object.entries(keys).map( ([key, name]) => module[key] && name ).filter( x => x );
      console.log( `  🪡 ${name} (${imports.join(', ')})` );
    } catch(e) {
      console.log( "errors in", dependency, ", couldn't import" )
    }
  }


  const clients = modules.filter( ({module}) => module.client )
  const clientJS = clients.map( ({name, module}) => module.client.toString().replace(/^function client/, `function ${name}`))

  const bundleJS = `${ clientJS.join("\n\n") }

document.addEventListener("DOMContentLoaded", () => {
  ${ clients.map( ({name}) => `${name}();` ).join("\n  ") }
})`


  try{
    fs.mkdirSync('./dev', { recursive: true } );
  } catch(e) {}
  

  const headHTML = modules.filter( ({module}) => module.head ).map( ({module}) => module.head ).join("\n");
  const templateHTML = fs.readFileSync(`./src/index.html`).toString();

  const appHTML = await App();


  const indexHTML = templateHTML.replace(/__HEAD__/, headHTML).replace(/__APP__/, appHTML);


  const styles = modules.filter( ({module}) => module.styles )
  const stylesCSS = styles.map(({name, module}) => `/* ------ ${ name.toUpperCase() } ------ */\n\n${ module.styles }`).join('\n\n');

  fs.writeFileSync(`./dev/bundle.js`, bundleJS);
  fs.writeFileSync(`./dev/styles.css`, stylesCSS);
  fs.writeFileSync(`./dev/index.html`, prettify(indexHTML));
  
  console.timeEnd('✅ Imported modules in');
}

(async () => {
  await pruneComponents();
})();