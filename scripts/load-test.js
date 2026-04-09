const autocannon = require("autocannon");

const baseUrl = process.env.PERF_BASE_URL || "http://localhost:3000";
const connections = Number(process.env.PERF_CONNECTIONS || 20);
const duration = Number(process.env.PERF_DURATION || 15);
const scenarioName = process.argv[2] || "search";

const scenarios = {
  search: {
    title: "Ayet Search Load Test",
    requests: [
      {
        method: "GET",
        path: "/api/search/ayahs?q=rahmet&limit=20",
      },
    ],
  },
  prayer: {
    title: "Prayer Times Load Test",
    requests: [
      {
        method: "GET",
        path: "/api/prayer-times/daily?lat=41.0082&lon=28.9784&date=2026-04-09",
      },
    ],
  },
  sync: {
    title: "Sync Pull Load Test",
    requests: [
      {
        method: "GET",
        path: "/api/sync/pull?deviceId=phase4_device_1&lastPulledAt=0",
      },
    ],
  },
  notifications: {
    title: "Notifications Silent Sync Load Test",
    requests: [
      {
        method: "POST",
        path: "/api/notifications/silent-sync",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          deviceIds: ["phase4_device_1"],
          reason: "perf-check",
          entityType: "ayah",
          entityId: "bb0211a2-6637-4faf-a9cb-510af82afd1f",
        }),
      },
    ],
  },
};

function runScenario(name) {
  const scenario = scenarios[name];
  if (!scenario) {
    console.error(`Bilinmeyen senaryo: ${name}`);
    process.exit(1);
  }

  console.log(`\n=== ${scenario.title} ===`);

  const instance = autocannon({
    url: baseUrl,
    connections,
    duration,
    requests: scenario.requests,
  });

  autocannon.track(instance, { renderProgressBar: true });

  return new Promise((resolve, reject) => {
    instance.on("done", resolve);
    instance.on("error", reject);
  });
}

async function main() {
  if (scenarioName === "all") {
    for (const name of Object.keys(scenarios)) {
      await runScenario(name);
    }
    return;
  }

  await runScenario(scenarioName);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
