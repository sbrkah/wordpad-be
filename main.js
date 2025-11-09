import Generate from "./include/generate.js";

async function main() {
  Generate.Configure(8, 100, 78);

  await Generate.Run();
  Generate.saveDailySet();
}

main().catch(console.error);