import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('home introduction retains its own content after SoloWare edits', async () => {
  const home = await readFile('src/content/home.md', 'utf8');
  const firstProject = await readFile('src/content/project-1.md', 'utf8');
  assert.match(home, /Hey, welcome to my corner\./);
  assert.notEqual(home.trim(), firstProject.trim(), 'Home must not be replaced by a project card');
});
