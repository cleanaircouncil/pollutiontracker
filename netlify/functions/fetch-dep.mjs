async function fetchDep(triggerTitle) {
  const url = new URL(process.env.NETLIFY_REBUILD_HOOK);

  url.searchParams.append("trigger_title", triggerTitle);

  return await fetch(url.toString(), { method: "POST" });
}

export default async (req) => {
  const { next_run } = await req.json();

  await fetchDep("Echo fetch");
  console.log("Received event! Next invocation at:", next_run);
};

export const config = {
  schedule: "@weekly",
};
