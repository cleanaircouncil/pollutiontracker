import { runScrape } from "../../scripts/echo.js";

export default async (req) => {
  const { next_run } = await req.json();

  await runScrape();
  console.log("Received event! Next invocation at:", next_run);
};

export const config = {
  schedule: "@daily",
};
