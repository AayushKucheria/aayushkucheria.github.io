/**
 * Build, start preview, run splash regression tests, then exit.
 * Run: node scripts/run-splash-tests.mjs
 */
import { spawn } from 'child_process';
import { createConnection } from 'net';

const PORT = 4322;
const BASE = `http://localhost:${PORT}/`;

function run(cmd, args, env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', env: { ...process.env, ...env }, shell: true });
    child.on('close', code => (code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(' ')} exited ${code}`))));
  });
}

function waitForPort(port, timeoutMs = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      const sock = createConnection({ port, host: '127.0.0.1' }, () => {
        sock.end();
        resolve();
      });
      sock.on('error', () => {
        if (Date.now() - start > timeoutMs) reject(new Error(`port ${port} not ready`));
        else setTimeout(tick, 200);
      });
    };
    tick();
  });
}

console.log('Building site…');
await run('npm', ['run', 'build']);

console.log(`Starting preview on :${PORT}…`);
const preview = spawn('npx', ['astro', 'preview', '--port', String(PORT)], {
  stdio: 'ignore',
  detached: true,
  shell: true,
});

let exitCode = 0;
try {
  await waitForPort(PORT);
  process.env.SPLASH_TEST_URL = BASE;

  console.log('\n--- layout tests ---');
  await run('node', ['scripts/test-splashes.mjs'], { SPLASH_TEST_URL: BASE });

  console.log('\n--- visibility tests ---');
  await run('node', ['scripts/test-splash-visibility.mjs'], { SPLASH_TEST_URL: BASE });

  console.log('\n--- storage tests ---');
  await run('node', ['scripts/test-splash-storage.mjs'], { SPLASH_TEST_URL: BASE });

  console.log('\n--- corners tests ---');
  await run('node', ['scripts/test-corners.mjs'], { SPLASH_TEST_URL: BASE });
} catch (err) {
  console.error(err.message);
  exitCode = 1;
} finally {
  process.kill(-preview.pid, 'SIGTERM');
}

process.exit(exitCode);
