import browserSync from "browser-sync";
import * as build from "./build.js";

build.setOptions({
  environment: "dev",
  path: "./dev",
  remote: "assets"
})
build.all();

const bs = browserSync.create();

bs.init({
  server: "./dev",
  port: 8080,
  open: false,
  ui: false
});

bs.watch('./src/**/*', async (event, file) => {
  // browsersync has detected a src file has changed

  if (event == 'change') {
    // get file extention of file
    const fileExt = file.split('/').at(-1);

    const compilersByExtension = {
      "client.js": "client",
      "styles.css": "css",
      "index.js": "pages"
    }

    const compilerToChoose = compilersByExtension[fileExt] || "all";
    const compiler = build[compilerToChoose];

    try {

      console.time(`🏭 Recompiled ${compilerToChoose} in`);
      const result = await compiler();
      console.timeEnd(`🏭 Recompiled ${compilerToChoose} in`);
      
      const filesToLoad = fileExt == "styles.css" ? "styles.css" : "index.html";
      bs.reload(filesToLoad);
    } catch (e) {
      compile.handleError(fileExt, e);
    }
  }
});
