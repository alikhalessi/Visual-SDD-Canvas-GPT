import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {EVALUATION_KEY} from '../lib/evaluation-core.ts';
const legacyKeys=['visual-sdd-specification-v1','visual-sdd-idea','visual-sdd-stakeholder-v1-owner-sentinel'];
async function stored(page){return page.evaluate(key=>localStorage.getItem(key),EVALUATION_KEY);}
async function start(page,index=0){
 await page.goto('/evaluate');await page.getByLabel('Allocation slot',{exact:true}).fill(String(index));
 await expect(page.getByRole('button',{name:'Start rehearsal',exact:true})).toBeDisabled();
 await page.getByRole('checkbox',{name:/This is a local rehearsal/}).check();await page.getByRole('button',{name:'Start rehearsal',exact:true}).click();
 await expect(page.getByRole('heading',{name:/^Review 1:/})).toBeVisible();
}
async function fillReview(page){
 for(const [i,id] of ['REQ-001','REQ-002'].entries()){
  await page.getByLabel('Judgement for '+id,{exact:true}).selectOption(i?'mismatch':'no-mismatch');
  await page.getByText('Select evidence for '+id,{exact:false}).click();
  await page.getByRole('checkbox',{name:id+' evidence '+(i?'OBS-003':'OBS-001'),exact:true}).check();
  await page.getByLabel('Rationale for '+id,{exact:true}).fill('The selected observation records the behavior relevant to this business rule.');
 }
 await page.getByRole('button',{name:'Submit review and continue',exact:true}).click();await expect(page.getByRole('heading',{name:'Independent prediction check',exact:true})).toBeVisible();
 await expect(page.getByRole('region',{name:'Frozen scenario specification',exact:true})).toHaveCount(0);
}
async function predict(page){
 for(const fieldset of await page.locator('form fieldset').all())await fieldset.getByRole('radio').first().check();
 await page.getByRole('button',{name:'Submit prediction check',exact:true}).click();
}
async function downloaded(page,label){const event=page.waitForEvent('download');await page.getByRole('button',{name:label,exact:true}).click();const d=await event,chunks=[];for await(const c of await d.createReadStream())chunks.push(c);return Buffer.concat(chunks).toString('utf8');}
test.beforeEach(async({page})=>{
 await page.addInitScript(keys=>{for(const key of keys)if(localStorage.getItem(key)===null)localStorage.setItem(key,'synthetic legacy sentinel');},legacyKeys);
});
for(const slot of [0,1,2,3])test(`allocation slot ${slot} completes both conditions and exports exact replayable records`,async({page},info)=>{
 const errors=[],apiRequests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(new URL(r.url()).pathname.startsWith('/api/'))apiRequests.push(r.url());});
 await start(page,slot);
 const first=JSON.parse(await stored(page)).trials[0];expect(first.condition).toBe(slot%2?'text':'visual');expect(first.scenarioId).toBe(slot<2?'A':'B');
 for(let i=0;i<2;i++){
  await expect(page.locator('[data-fact-id]')).toHaveCount(14);
  await fillReview(page);await predict(page);
  if(i===0)await page.getByRole('button',{name:'Start second review',exact:true}).click();
 }
 await expect(page.getByRole('heading',{name:'Rehearsal complete',exact:true})).toBeVisible();
 const raw=await downloaded(page,'Download rehearsal JSON'),session=JSON.parse(raw);
 expect(session).toEqual(JSON.parse(await stored(page)));expect(session.status).toBe('completed');expect(session.trials).toHaveLength(2);expect(new Set(session.trials.map(t=>t.condition)).size).toBe(2);
 for(const t of session.trials){expect(t.reviewElapsedMs).toBeGreaterThan(0);expect(t.predictionElapsedMs).toBeGreaterThan(0);expect(t.scenarioDigest).toMatch(/^[a-f0-9]{64}$/);expect(t.predictions).toHaveLength(2);}
 expect(raw).not.toMatch(/answerKey|correctAnswer|private-evaluation-reference/);
 const csv=await downloaded(page,'Download rehearsal CSV');expect(csv).toContain('scenario_digest');expect(csv).toContain(session.sessionId);
 expect(await page.evaluate(keys=>keys.map(k=>localStorage.getItem(k)),legacyKeys)).toEqual(legacyKeys.map(()=> 'synthetic legacy sentinel'));
 expect(apiRequests).toEqual([]);expect(errors).toEqual([]);
 await info.attach('completed-evaluation-slot-'+slot,{body:raw,contentType:'application/json'});
 if(slot===0){await info.attach('evaluation-complete',{body:await page.screenshot({fullPage:true}),contentType:'image/png'});await page.reload();await page.getByRole('button',{name:'Restore rehearsal',exact:true}).click();expect(JSON.parse(await downloaded(page,'Download rehearsal JSON'))).toEqual(session);}
});
test('visual and text DOM contain identical substantive facts and preserve open coverage',async({page},info)=>{
 await start(page,0);
 const visual=await page.locator('[data-fact-id]').evaluateAll(nodes=>nodes.map(n=>({id:n.dataset.factId,text:n.textContent})).sort((a,b)=>a.id.localeCompare(b.id)));
 expect(visual.some(f=>f.text.includes('Status: open'))).toBe(true);
 await info.attach('evaluation-visual',{body:await page.screenshot({fullPage:true}),contentType:'image/png'});
 page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Withdraw and clear rehearsal',exact:true}).click();
 await start(page,1);
 const text=await page.locator('[data-fact-id]').evaluateAll(nodes=>nodes.map(n=>({id:n.dataset.factId,text:n.textContent})).sort((a,b)=>a.id.localeCompare(b.id)));
 expect(text).toEqual(visual);await info.attach('evaluation-text',{body:await page.screenshot({fullPage:true}),contentType:'image/png'});
});
test('corrupt saved bytes are recoverable and never silently overwritten',async({page})=>{
 await page.addInitScript(key=>localStorage.setItem(key,'{broken-rehearsal'),EVALUATION_KEY);await page.goto('/evaluate');await expect(page.locator('.evaluation-shell').getByRole('alert')).toContainText('unreadable');
 expect(await downloaded(page,'Export original stored rehearsal')).toBe('{broken-rehearsal');expect(await stored(page)).toBe('{broken-rehearsal');await expect(page.getByRole('button',{name:'Start rehearsal',exact:true})).toHaveCount(0);
});
test('a failed save preserves the exact previous record and allows explicit retry',async({page})=>{
 await start(page);const before=await stored(page);
 await page.evaluate(key=>{const real=Storage.prototype.setItem;window.__restoreStorage=()=>Storage.prototype.setItem=real;Storage.prototype.setItem=function(k,v){if(k===key)throw Error('Synthetic storage failure');return real.call(this,k,v);};},EVALUATION_KEY);
 for(const id of ['REQ-001','REQ-002']){await page.getByText('Select evidence for '+id,{exact:false}).click();await page.getByRole('checkbox',{name:id+' evidence OBS-001',exact:true}).check();await page.getByLabel('Rationale for '+id,{exact:true}).fill('A synthetic rationale that remains visible after a failed write.');}
 await page.getByRole('button',{name:'Submit review and continue',exact:true}).click();await expect(page.locator('.evaluation-shell').getByRole('alert')).toContainText('Synthetic storage failure');expect(await stored(page)).toBe(before);
 await page.evaluate(()=>{window.__restoreStorage();const form=document.querySelector('form');for(let i=0;i<2;i++)form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));});await expect(page.getByRole('heading',{name:'Independent prediction check',exact:true})).toBeVisible();
});
test('another-tab write blocks stale submission without replacing either record',async({page})=>{
 await start(page);const changed=JSON.stringify({...JSON.parse(await stored(page)),external:'sentinel'});
 await page.evaluate(({key,value})=>localStorage.setItem(key,value),{key:EVALUATION_KEY,value:changed});
 for(const id of ['REQ-001','REQ-002']){await page.getByText('Select evidence for '+id,{exact:false}).click();await page.getByRole('checkbox',{name:id+' evidence OBS-001',exact:true}).check();await page.getByLabel('Rationale for '+id,{exact:true}).fill('An explicit finding referring to a synthetic observation.');}
 await page.getByRole('button',{name:'Submit review and continue',exact:true}).click();await expect(page.locator('.evaluation-shell').getByRole('alert')).toContainText('another tab');expect(await stored(page)).toBe(changed);
});
test('reload preserves interrupted history and withdrawal clears only evaluation data',async({page})=>{
 await start(page);const old=JSON.parse(await stored(page));await page.reload();await expect(page.getByRole('button',{name:'Restart interrupted trial',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Restart interrupted trial',exact:true}).click();await expect(page.getByRole('heading',{name:/^Review 1:/})).toBeVisible();const resumed=JSON.parse(await stored(page));expect(resumed.sessionId).toBe(old.sessionId);expect(resumed.trials.map(t=>t.status)).toEqual(['abandoned','review']);
 page.once('dialog',d=>d.dismiss());await page.getByRole('button',{name:'Withdraw and clear rehearsal',exact:true}).click();expect(await stored(page)).not.toBeNull();
 page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Withdraw and clear rehearsal',exact:true}).click();expect(await stored(page)).toBeNull();expect(await page.evaluate(keys=>keys.map(k=>localStorage.getItem(k)),legacyKeys)).toEqual(legacyKeys.map(()=> 'synthetic legacy sentinel'));
});
test('keyboard narrow layout and Chromium accessibility audit work in the visual review',async({page,browserName},info)=>{
 await page.setViewportSize({width:320,height:780});await start(page);
 await expect(page.getByRole('heading',{name:/^Review 1:/})).toBeFocused();await page.keyboard.press('Tab');
 expect(await page.evaluate(()=>document.activeElement?.tagName)).toBe('SELECT');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true);
 if(browserName==='chromium'){const report=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(report.violations).toEqual([]);await info.attach('evaluation-accessibility-report',{body:JSON.stringify(report,null,2),contentType:'application/json'});}
});
