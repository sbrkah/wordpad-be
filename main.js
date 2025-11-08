import Generate from "./include/generate";

async function main() {
    await Generate.Run();
    Generate.saveDailySet();
}

main().catch(console.error);