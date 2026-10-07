import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { randomUUID, createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import sanitizeHtml from 'sanitize-html';
import { sections } from './sections.mjs';
import { renderSection } from './rendering.mjs';
const exec = promisify(execFile);
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
export function createPublisher({ root, files = Object.values(sections).map(s => `src/content/${s.file}`), deploy, getRuns, fetchLive = fetch, log = console.info } = {}) {
  let state = { phase: 'idle', busy: false, elapsedMs: 0 }, task;
  const run = async (command, args) => (await exec(command, args, {
    cwd: root, timeout: 45000, maxBuffer: 2 * 1024 * 1024,
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
  })).stdout.trim();
  const git = (...args) => run('git', args);
  const phase = (name, message) => {
    state = { ...state, phase: name, message };
    log(JSON.stringify({ event: 'writer-publish', id: state.id, phase: name, elapsedMs: Date.now() - state.startedAt }));
  };
  const status = () => ({ ...state, elapsedMs: state.startedAt ? Date.now() - state.startedAt : 0 });
  async function deployPages(job) {
    const deadline = Date.now() + 10 * 60 * 1000;
    let workflow;
    while (Date.now() < deadline) {
      const runs = getRuns ? await getRuns(job.commit) : JSON.parse(await run('gh', ['run', 'list', '--workflow', 'deploy.yml', '--commit', job.commit, '--limit', '5', '--json', 'status,conclusion,url']));
      workflow = runs[0];
      if (workflow?.status === 'completed') break;
      await pause(3000);
    }
    if (workflow?.status !== 'completed') throw new Error('Deployment is taking longer than expected. Your changes were pushed; try Publish again to check.');
    if (workflow.conclusion !== 'success') throw new Error('GitHub could not deploy these changes. Your edits are saved locally; check the deployment and retry.');
    state.workflowUrl = workflow.url;
    phase('verifying', 'Checking the live website…');
    const normalize = html => sanitizeHtml(html, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
      allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, a: ['href', 'title', 'target', 'rel'], img: ['src', 'alt', 'title'] },
    }).replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();
    const expected = Object.entries(sections).map(([id, section]) => normalize(renderSection(id, job.snapshot[`src/content/${section.file}`])));
    for (let attempt = 0; attempt < 20; attempt++) {
      const response = await fetchLive(`https://aayush.world/?publish=${job.commit}`, { cache: 'no-store', signal: AbortSignal.timeout(15000) });
      if (response.ok) {
        const actual = normalize(await response.text());
        if (expected.every(text => actual.includes(text))) return;
      }
      await pause(3000);
    }
    throw new Error('Deployment finished, but the updated page could not be verified yet. Try Publish again to check.');
  }
  async function publish(revisions) {
    try {
      phase('checking', 'Preparing your saved changes…');
      if (await git('branch', '--show-current') !== 'main') throw new Error('Open the main branch before publishing. Your edits are saved locally.');
      if (!deploy && !getRuns && !/^(?:git@github\.com:|https:\/\/github\.com\/)AayushKucheria\/aayushkucheria\.github\.io(?:\.git)?$/i.test(await git('remote', 'get-url', 'origin')))
        throw new Error('The Git remote does not point to your website repository. Check origin before publishing.');
      await git('rev-parse', '--verify', 'origin/main');
      const ahead = (await git('rev-list', 'origin/main..HEAD')).split('\n').filter(Boolean);
      for (const commit of ahead) {
        const changed = (await git('diff-tree', '--no-commit-id', '--name-only', '-r', commit)).split('\n').filter(Boolean);
        const parents = (await git('rev-list', '--parents', '-n', '1', commit)).split(' ');
        if (parents.length > 2 || changed.some(file => !files.includes(file))) throw new Error('There are unpublished code changes. Publish those separately before using the content button.');
      }
      for (const file of files) {
        const text = await readFile(join(root, file), 'utf8');
        if (revisions[file] && createHash('sha256').update(text).digest('hex') !== revisions[file]) throw new Error('Content changed in another editor. Reload the source before publishing.');
      }
      const changed = await git('diff', 'HEAD', '--name-only', '--', ...files);
      if (changed) {
        phase('committing', 'Preparing your saved changes…');
        await git('commit', '--only', '-m', 'update website content', '--', ...files);
      }
      const commit = await git('rev-parse', 'HEAD');
      state.commit = commit;
      const snapshot = Object.fromEntries(await Promise.all(files.map(async file => [file, (await exec('git', ['show', `${commit}:${file}`], { cwd: root, maxBuffer: 2 * 1024 * 1024 })).stdout])));
      for (const [file, text] of Object.entries(snapshot)) {
        if (revisions[file] && createHash('sha256').update(text).digest('hex') !== revisions[file])
          throw new Error('Content changed while preparing the publish. Your commit is kept locally; reload the source before publishing.');
      }
      phase('pushing', 'Sending your changes…');
      try { await git('push', 'origin', 'HEAD:main'); }
      catch { throw new Error('Could not send changes to GitHub. Check your connection and Git access, then try Publish again. Your local commit is kept.'); }
      phase('deploying', 'Deploying the website… Usually about half a minute.');
      await (deploy || deployPages)({ commit, snapshot, phase });
      phase('live', 'Live on aayush.world');
      state.url = 'https://aayush.world';
    } catch (error) {
      phase('failed', error.message.startsWith('Command failed:') ? 'Publishing could not continue. Check local Git and GitHub CLI access, then retry. Your edits are kept.' : error.message);
    } finally { state.busy = false; }
    return status();
  }
  return {
    status,
    start(revisions = {}) {
      if (state.busy) return status();
      state = { id: randomUUID(), phase: 'checking', busy: true, startedAt: Date.now(), message: 'Preparing your saved changes…' };
      task = publish(revisions);
      return status();
    },
    wait: () => task,
  };
}
