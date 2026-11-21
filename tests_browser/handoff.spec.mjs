import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readyFixture,TIME} from '../tests/fixtures/handoff.mjs';
import {flagEdgeCondition,localStakeholderKey} from '../lib/stakeholder-view-core.ts';
import {localPlanningKey} from '../lib/workflow-core.ts';
import {localHandoffHistoryKey} from '../lib/agent-handoff-core.ts';
const fixture=readyFixture(),historyKey=localHandoffHistoryKey(fixture.source,null);
async function seed(page,{openEdge=false,corruptHistory=false}={}){
 if(!process.env.E2E_BASE_URL)await page.route('**/api/auth/**',r=>r.fulfill({json:{session:null,user:null}}));
 const review=openEdge?flagEdgeCondition(fixture.review,'REQ-001','Check queued report delivery after the athlete revokes access.',TIME):fixture.review;
 await page.addInitScript(({source,review,plan,reviewKey,planKey,historyKey,corruptHistory})=>{
  if(localStorage.getItem('s10-seeded'))return;
  localStorage.setItem('s10-seeded','yes');
  localStorage.setItem('visual-sdd-specification-v1',JSON.stringify(source));
  localStorage.setItem('visual-sdd-idea',JSON.stringify({id:'qa',title:source.title,description:source.sourceIdea,status:'draft'}));
  localStorage.setItem(reviewKey,JSON.stringify(review));localStorage.setItem(planKey,JSON.stringify(plan));
  if(corruptHistory)localStorage.setItem(historyKey,'{unreadable-history');
 },{...fixture,review,reviewKey:localStakeholderKey(fixture.source,null),planKey:localPlanningKey(fixture.source,null),historyKey,corruptHistory});
 await page.goto('/');await page.getByRole('button',{name:'Review impact & agent handoff',exact:true}).click();
 await expect(page.getByRole('dialog')).toBeVisible();
 if(!corruptHistory)await expect(page.getByRole('dialog')).toContainText('Information parity: passed');
}
async function jsonDownload(page,name){const event=page.waitForEvent('download');await page.getByRole('button',{name,exact:true}).click();const d=await event;const chunks=[];for await(const chunk of await d.createReadStream())chunks.push(chunk);return JSON.parse(Buffer.concat(chunks).toString());}
test('draft handoff preserves an open timing flag and cannot approve or authorize execution',async({page},testInfo)=>{
 await seed(page,{openEdge:true});const dialog=page.getByRole('dialog');
 await expect(dialog).toContainText('not a confirmed workflow');
 await dialog.getByLabel('Reviewer name',{exact:true}).fill('QA reviewer');await dialog.getByLabel('Decision rationale',{exact:true}).fill('This draft still has an unanswered timing question.');await dialog.getByRole('combobox',{name:'Decision',exact:true}).selectOption('approved');
 await dialog.getByRole('checkbox').check();await expect(dialog.getByRole('button',{name:'Record snapshot decision',exact:true})).toBeDisabled();
 const m=await jsonDownload(page,'Export draft manifest');
 expect(m.canonical.review.rules[0].edges).toHaveLength(1);expect(m.canonical.review.rules[0].edges[0].status).toBe('open');expect(m.canonical.review.rules[0].workflows.map(w=>w.kind)).toEqual(['interactive']);expect(m.readiness.canImplement).toBe(false);expect(m.execution.authorized).toBe(false);
 await testInfo.attach('draft-handoff-manifest',{body:JSON.stringify(m,null,2),contentType:'application/json'});
});
test('explicit snapshot approval persists and a source edit stales it while retaining history',async({page},testInfo)=>{
 await seed(page);const dialog=page.getByRole('dialog');
 await dialog.getByLabel('Reviewer name',{exact:true}).fill('QA reviewer');await dialog.getByLabel('Decision rationale',{exact:true}).fill('I reviewed the complete rule, workflow and behavioural example.');await dialog.getByRole('combobox',{name:'Decision',exact:true}).selectOption('approved');await dialog.getByRole('checkbox').check();
 await dialog.getByRole('button',{name:'Record snapshot decision',exact:true}).click();await expect(dialog).toContainText('Handoff sign-off: current');
 const m=await jsonDownload(page,'Export manifest');expect(m.signOffHistory.records).toHaveLength(1);expect(m.signOffHistory.records[0].actor.provenance).toBe('browser-local-assertion');expect(m.execution.authorized).toBe(false);
 await page.reload();await page.getByRole('button',{name:'Review impact & agent handoff',exact:true}).click();await expect(page.getByRole('dialog')).toContainText('Handoff sign-off: current');
 await page.getByRole('button',{name:'Close handoff review',exact:true}).click();await page.getByRole('button',{name:'Open source specification',exact:true}).click();
 await page.getByRole('textbox',{name:/Measurable goal/}).fill('An updated outcome requires all connected reviewers to inspect the new revision.');
 await page.getByRole('button',{name:'Business Review Mode',exact:true}).click();await page.getByRole('button',{name:'Review impact & agent handoff',exact:true}).click();await expect(page.getByRole('dialog')).toContainText('Handoff sign-off: stale');
 expect(JSON.parse(await page.evaluate(k=>localStorage.getItem(k),historyKey)).records).toHaveLength(1);
 await testInfo.attach('handoff-signoff-and-staleness',{body:await page.screenshot({fullPage:true}),contentType:'image/png'});
});
test('unreadable sign-off history is preserved and exported without modification',async({page})=>{
 await seed(page,{corruptHistory:true});await expect(page.locator('.handoff-error')).toContainText('No stored record was changed');
 const event=page.waitForEvent('download');await page.getByRole('button',{name:'Export original sign-off history',exact:true}).click();const d=await event,chunks=[];for await(const c of await d.createReadStream())chunks.push(c);expect(Buffer.concat(chunks).toString()).toBe('{unreadable-history');expect(await page.evaluate(k=>localStorage.getItem(k),historyKey)).toBe('{unreadable-history');
 await expect(page.getByRole('button',{name:'Export draft manifest',exact:true})).toHaveCount(0);
});
test('another-tab source write stops stale export before any download',async({page})=>{
 await seed(page);let downloads=0;page.on('download',()=>downloads++);
 await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('visual-sdd-specification-v1'));s.goal='Another tab changed the current draft without changing this open dialog.';localStorage.setItem('visual-sdd-specification-v1',JSON.stringify(s));});
 await page.getByRole('button',{name:'Export draft manifest',exact:true}).click();await expect(page.locator('.handoff-error')).toContainText('changed in this browser');expect(downloads).toBe(0);
});
test('dialog keyboard focus narrow layout and Chromium accessibility audit',async({page,browserName},testInfo)=>{
 await seed(page,{openEdge:true});await page.setViewportSize({width:320,height:780});
 const bounds=await page.getByRole('dialog').evaluate(e=>({width:e.getBoundingClientRect().width,viewport:innerWidth}));expect(bounds.width).toBeLessThanOrEqual(bounds.viewport);
 expect(await page.evaluate(()=>!!document.activeElement?.closest('dialog'))).toBe(true);
 if(browserName==='chromium'){
  const result=await new AxeBuilder({page}).include('.handoff-dialog').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();await testInfo.attach('handoff-accessibility-report',{body:JSON.stringify(result,null,2),contentType:'application/json'});expect(result.violations.map(x=>({id:x.id,nodes:x.nodes.map(n=>n.target)}))).toEqual([]);
 }
 await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);await expect(page.getByRole('button',{name:'Review impact & agent handoff',exact:true})).toBeFocused();
});
test('a failed sign-off storage write leaves original history intact and permits an explicit retry',async({page})=>{
 await seed(page);await page.getByLabel('Reviewer name',{exact:true}).fill('QA reviewer');await page.getByLabel('Decision rationale',{exact:true}).fill('Changes are requested to clarify the intended workflow.');
 await page.evaluate(key=>{const set=Storage.prototype.setItem;let fail=true;Storage.prototype.setItem=function(k,v){if(k===key&&fail){fail=false;throw Error('Injected sign-off write failure');}return set.call(this,k,v);};},historyKey);
 await page.getByRole('button',{name:'Record snapshot decision',exact:true}).click();await expect(page.locator('.handoff-error')).toContainText('Injected sign-off write failure');expect(await page.evaluate(k=>localStorage.getItem(k),historyKey)).toBeNull();
 await page.getByRole('button',{name:'Record snapshot decision',exact:true}).click();await expect(page.getByRole('dialog')).toContainText('Handoff sign-off: changes_requested');expect(JSON.parse(await page.evaluate(k=>localStorage.getItem(k),historyKey)).records).toHaveLength(1);
});

test('engineering impact reads the same open business timing question',async({page})=>{
 await seed(page,{openEdge:true});await page.getByRole('button',{name:'Close handoff review',exact:true}).click();await page.getByRole('button',{name:'Engineering Cockpit',exact:true}).click();
 await page.getByRole('button',{name:/^(⌘ )?SDD Canvas$/}).click();await page.getByRole('button',{name:'Change impact',exact:true}).click();
 const findings=page.getByRole('region',{name:'Business consequences',exact:true});await expect(findings).toContainText('Check queued report delivery after the athlete revokes access.');await expect(findings).toContainText('not a confirmed workflow');
});
