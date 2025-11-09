import Generate from "./include/generate.js";

async function main() {
  Generate.Configure(7, 256, 78);

  await Generate.Run();
  Generate.saveDailySet();
}

main().catch(console.error);