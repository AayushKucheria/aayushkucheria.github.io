import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const exec = promisify(execFile);
import { createPublisher } from '../src/editor/publish.mjs';
import { sections } from '../src/editor/sections.mjs';
import { renderSection } from '../src/editor/rendering.mjs';
async function fixture(fn) {
 const dir=await mkdtemp(join(tmpdir(),'site-publish-')), root=join(dir,'site'), remote=join(dir,'remote.git');
 const git=async(...args)=>(await exec('git',args,{cwd:root})).stdout.trim();
 try {
  await mkdir(join(root,'src/content'),{recursive:true});
  await exec('git',['init','--bare',remote]); await git('init','-b','main');
  await git('config','user.name','Publish test'); await git('config','user.email','test@example.com');
  for (const section of Object.values(sections)) await writeFile(join(root,'src/content',section.file), '- original'); await writeFile(join(root,'code.txt'),'original code');
  await git('add','.'); await git('commit','-m','initial'); await git('remote','add','origin',remote); await git('push','-u','origin','main');
  await fn({root,remote,git,files:['src/content/home.md']});
 } finally {await rm(dir,{recursive:true,force:true});}
}
test('Publish alone commits content and pushes it; staged code stays local',()=>fixture(async({root,remote,git,files})=>{
 assert.equal(typeof createPublisher,'function','A content publisher must exist');
 await writeFile(join(root,files[0]),'- edited'); await writeFile(join(root,'code.txt'),'staged code'); await git('add','code.txt');
 assert.equal(await git('rev-list','--count','origin/main'),'1','Saving files does not send them online');
 let deployed;
 const publisher=createPublisher({root,files,deploy:async job=>{deployed=job;},log:()=>{}});
 publisher.start(); await publisher.wait();
 assert.equal(publisher.status().phase,'live');
 assert.equal(await git('show','HEAD:code.txt'),'original code');
 assert.equal(await git('diff','--cached','--name-only'),'code.txt');
 assert.equal((await exec('git',['--git-dir',remote,'show','main:'+files[0]])).stdout,'- edited');
 assert.equal(deployed.snapshot[files[0]],'- edited');
}));
test('Failed push retains the commit and retry sends it without duplicate commits',()=>fixture(async({root,remote,git,files})=>{
 await writeFile(join(root,files[0]),'- edited');
 await git('remote','set-url','origin',join(root,'missing.git'));
 const publisher=createPublisher({root,files,deploy:async()=>{},log:()=>{}});
 publisher.start();await publisher.wait();assert.equal(publisher.status().phase,'failed');
 const commit=await git('rev-parse','HEAD');
 await git('remote','set-url','origin',remote);
 publisher.start();await publisher.wait();assert.equal(publisher.status().phase,'live');assert.equal(await git('rev-parse','HEAD'),commit);
}));
test('Wrong branch and unrelated unpublished commits cannot be sent',()=>fixture(async({root,git,files})=>{
 const publisher=createPublisher({root,files,deploy:async()=>{},log:()=>{}});
 await git('checkout','-b','other');publisher.start();await publisher.wait();assert.equal(publisher.status().phase,'failed');
 await git('checkout','main');await writeFile(join(root,'code.txt'),'new code');await git('add','code.txt');await git('commit','-m','unrelated');
 publisher.start();await publisher.wait();assert.equal(publisher.status().phase,'failed');assert.equal(await git('rev-list','--count','origin/main'),'1');
}));
test('Repeated Publish clicks share a job and deployment failure never reports Live',()=>fixture(async({root,git,files})=>{
 await writeFile(join(root,files[0]),'- edited');let finish;
 const publisher=createPublisher({root,files,deploy:()=>new Promise((_,reject)=>finish=reject),log:()=>{}});
 publisher.start();const job=publisher.status().id;publisher.start();assert.equal(publisher.status().id,job);
 while(!finish) await new Promise(r=>setTimeout(r,10));
 finish(new Error('Deployment failed'));await publisher.wait();assert.equal(publisher.status().phase,'failed');
 assert.equal(await git('rev-list','--count','HEAD'),'2');assert.equal(await readFile(join(root,files[0]),'utf8'),'- edited');
}));

test('Deployment success is verified against the live response before Live is reported',()=>fixture(async({root,git})=>{
 const files=Object.values(sections).map(s=>`src/content/${s.file}`);
 await writeFile(join(root,files[0]),'- unique deployed dummy');
 let fetches=0;
 const publisher=createPublisher({root,files,log:()=>{},getRuns:async()=>[{status:'completed',conclusion:'success',url:'https://example.com/run'}],fetchLive:async()=>{
   fetches++;
   const html=(await Promise.all(Object.entries(sections).map(async([id,section])=>renderSection(id,await readFile(join(root,'src/content',section.file),'utf8'))))).join('');
   return new Response(html);
 }});
 publisher.start();await publisher.wait();assert.equal(publisher.status().phase,'live');assert.equal(fetches,1);
}));
test('A failed Pages workflow does not report Live or fetch the public site',()=>fixture(async({root,git})=>{
 const files=Object.values(sections).map(s=>`src/content/${s.file}`);
 const publisher=createPublisher({root,files,log:()=>{},getRuns:async()=>[{status:'completed',conclusion:'failure'}],fetchLive:async()=>{assert.fail('Must not verify a failed deployment');}});
 publisher.start();await publisher.wait();assert.equal(publisher.status().phase,'failed');
}));

test('Live verification waits for changed hyperlink destinations, even when labels stay the same',()=>fixture(async({root})=>{
 const files=Object.values(sections).map(s=>`src/content/${s.file}`);
 await writeFile(join(root,'src/content/socials.md'),'- [GitHub](https://github.com/new-profile)');
 let fetches=0;
 const publisher=createPublisher({root,files,log:()=>{},getRuns:async()=>[{status:'completed',conclusion:'success'}],fetchLive:async()=>{
   fetches++;
   const html=(await Promise.all(Object.entries(sections).map(async([id,section])=>renderSection(id,await readFile(join(root,'src/content',section.file),'utf8'))))).join('');
   return new Response(fetches===1?html.replace('https://github.com/new-profile','https://github.com/old-profile'):html);
 }});
 publisher.start();await publisher.wait();assert.equal(publisher.status().phase,'live');assert.equal(fetches,2,'Old links must not be reported as published');
}));
