import autocannon from "autocannon";
import assert from "node:assert/strict";

const API_URL = process.env.API_URL || "http://localhost:5000";
const CONNECTIONS = Number(process.env.CONNECTIONS || 20);
const DURATION = Number(process.env.DURATION || 15);
const MAX_AVG_LATENCY_MS = Number(process.env.MAX_AVG_LATENCY_MS || 300);
const MIN_AVG_REQ_PER_SEC = Number(process.env.MIN_AVG_REQ_PER_SEC || 50);

function runAutocannon(options) {
  return new Promise((resolve, reject) => {
    autocannon(options, (error, result) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(result);
    });
  });
}

const result = await runAutocannon({
  url: API_URL,
  connections: CONNECTIONS,
  duration: DURATION,
  requests: [
    {
      method: "GET",
      path: "/"
    }
  ]
});

const summary = {
  url: API_URL,
  connections: CONNECTIONS,
  duration: DURATION,
  requests: result.requests.total,
  averageReqPerSec: result.requests.average,
  averageLatencyMs: result.latency.average,
  p95LatencyMs: result.latency.p95,
  errors: result.errors,
  timeouts: result.timeouts,
  non2xx: result.non2xx
};

console.table(summary);

assert.equal(result.errors, 0, "Performance test should not produce request errors");
assert.equal(result.timeouts, 0, "Performance test should not produce timeouts");
assert.equal(result.non2xx, 0, "Performance test should not produce non-2xx responses");
assert.ok(
  result.latency.average <= MAX_AVG_LATENCY_MS,
  `Average latency should be <= ${MAX_AVG_LATENCY_MS}ms`
);
assert.ok(
  result.requests.average >= MIN_AVG_REQ_PER_SEC,
  `Average throughput should be >= ${MIN_AVG_REQ_PER_SEC} req/s`
);

console.log("Autocannon performance test passed");
