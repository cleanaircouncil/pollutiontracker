import fs from "fs";
import esbuild from "esbuild";
import prettify from "html-prettify";
import { exec } from "child_process";

let options = {
  path: "./dev"
}

export function setOptions( overrides ) {
  options = {...options, ...overrides };
}

export async function clean() {
  if (fs.existsSync(options.path)) {
    fs.rmSync(options.path, {
      recursive: true
    });
  }

  fs.mkdirSync(options.path);
  return { success: true };
}

export async function assets() {
  fs.cpSync('./src/assets', `${options.path}/assets`, { recursive: true });
  return { success: true };
}

async function old() {
  const Page = (await import ("../src/index.js")).default;
  const page = await Page();
  fs.writeFileSync(`${ options.path }/index.html`, prettify(page) );
  return { success: true }
}

export async function pages() {
  try {
    await exec(`node --input-type=module --eval "import prettify from 'html-prettify'; import('./src/index.js').then(async m => process.stdout.write( prettify(await m.default())))" > ${options.path}/index.html `)
  } catch (e) {
    return { success: false, error: e };
  }
}


export async function client() {
  try {
    await esbuild.build({
      entryPoints: [`./src/client.js`],
      bundle: true,
      sourcemap: true,
      outdir: options.path,
    })

  } catch (e) {
    return { success: false, error: e };
  }
}

export async function css() {
  try {
    await esbuild.build({
      entryPoints: [`./src/styles.css`],
      bundle: true,
      outdir: options.path,
    })

  } catch (e) {
    return { success: false, error: e };
  }
}

export async function all() {
  await clean();
  await assets();
  await pages();
  await client();
  await css();
}

export async function build() {
  console.time('✅ Built in');

  await all();

  console.timeEnd('✅ Built in');
}