// Runs the streak tests again in time zones either side of UTC. A streak counts
// the learner's local days, and Jest cannot change the zone once it is running,
// so each zone is its own run.
const { execFileSync } = require('child_process');

const ZONES = ['America/Los_Angeles', 'Asia/Tokyo', 'Europe/Berlin'];

for (const zone of ZONES) {
  execFileSync('npx', ['jest', 'src/__tests__/progress.test.ts', '--silent'], {
    stdio: 'inherit',
    env: { ...process.env, TZ: zone },
  });
}
