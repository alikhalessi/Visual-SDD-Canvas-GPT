import {test,expect} from '@playwright/test';
import {createSpecification} from '../lib/spec-core.ts';
import {localStakeholderKey} from '../lib/stakeholder-view-core.ts';
import {localVibeHistoryKey} from '../lib/vibe-ingestor-core.ts';

const brief='An athlete must be able to revoke coach access to the dashboard. The system should queue weekly reports and check permissions when delivering a report.';
const original=createSpecification(brief,'2026-11-21T09:00:00.000Z');
const sourceKey='visual-sdd-specification-v1';
const reviewKey=localStakeholderKey(original,null),historyKey=localVibeHistoryKey(original,null);
const unrelatedKey=localVibeHistoryKey(original,'unrelated-project');
const panel=page=>page.locator('.vibe-import');
const rule=(page,index)=>panel(page).locator('.vibe-candidate').nth(index).getByRole('checkbox').first();
function scheduledRow(page){return panel(page).locator('.vibe-path').filter({has:page.locator('input[value="Check delayed, queued or scheduled processing after the primary action."]')});}
const commit=page=>panel(page).getByRole('button',{name:'Review changes & commit draft'});
async function stored(page){return page.evaluate(keys=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)])),[sourceKey,reviewKey,historyKey,unrelatedKey]);}
async function preview(page){
 await page.goto('/');
 await panel(page).locator('summary').click();
 await panel(page).getByLabel('Prototype behavior / feature brief').fill(brief);
 await panel(page).getByRole('button',{name:'Preview candidates',exact:true}).click();
 await expect(panel(page).locator('.vibe-candidate')).toHaveCount(2);
}
async function accept(page){
 const dialog=page.waitForEvent('dialog');
 const click=commit(page).click();
 const confirmation=await dialog;
 expect(confirmation.message()).toContain('1 OPEN edge flag(s)');
 await confirmation.accept();await click;
}
test.beforeEach(async({page})=>{
 // Fresh isolated browser contexts; never reuse the owner's cookies or local data.
 // Local-only tests stub session reads, but preview runs exercise the real guest endpoint.
 if(!process.env.E2E_BASE_URL)await page.route('**/api/auth/**',route=>route.fulfill({json:{session:null,user:null}}));
 await page.addInitScript(({sourceKey,original,unrelatedKey})=>{
  if(localStorage.getItem('s09-test-seeded'))return;
  localStorage.setItem('s09-test-seeded','yes');
  localStorage.setItem(sourceKey,JSON.stringify(original));
  localStorage.setItem('visual-sdd-idea',JSON.stringify({id:'idea-test',title:'Athlete access',description:original.sourceIdea,status:'draft'}));
  localStorage.setItem(unrelatedKey,'unrelated history sentinel');
 },{sourceKey,original,unrelatedKey});
});

test('scheduled path commits as an open flag, survives reload and exports exact provenance',async({page},testInfo)=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await preview(page);
 for(const checkbox of await panel(page).getByRole('checkbox').all())await expect(checkbox).not.toBeChecked();
 await expect(commit(page)).toBeDisabled();
 const summary=panel(page).getByRole('note',{name:'Import change summary'});
 await expect(summary).toContainText('Existing requirements retained: 1. With rule text: 0. Empty placeholders retained: 1 (REQ-001).');
 await rule(page,0).check();await rule(page,1).check();
 await panel(page).locator('.vibe-candidate').first().getByRole('checkbox').nth(1).check();
 await scheduledRow(page).getByRole('checkbox').check();
 await expect(summary).toContainText('Total requirements after import: 3.');
 await expect(summary).toContainText('Potential paths becoming OPEN flags: 1.');
 // Native confirmation is a real gate: cancellation preserves all three stored records.
 const before=await stored(page);
 page.once('dialog',dialog=>dialog.dismiss());await commit(page).click();
 expect(await stored(page)).toEqual(before);
 await expect(rule(page,1)).toBeChecked();
 await accept(page);
 await expect(page.locator('.business-summary')).toContainText('r2');
 await page.reload();
 await expect(page.locator('.business-summary')).toContainText('r2');
 const values=await stored(page),spec=JSON.parse(values[sourceKey]),review=JSON.parse(values[reviewKey]);
 expect(spec.requirements.map(x=>x.id)).toEqual(['REQ-001','REQ-002','REQ-003']);
 expect(spec.requirements[0]).toEqual(original.requirements[0]);expect(spec.approval.status).toBe('draft');
 expect(review.rules.every(x=>x.decision.status==='draft')).toBe(true);
 const report=review.rules.find(x=>x.requirementId==='REQ-003');
 expect(report.workflows).toEqual([]);expect(report.edges).toHaveLength(1);
 expect(report.edges[0]).toMatchObject({status:'open',evidenceExampleId:null,reviewNote:''});
 expect(review.rules.flatMap(x=>x.workflows).map(x=>x.kind)).toEqual(['interactive']);
 expect(values[unrelatedKey]).toBe('unrelated history sentinel');
 const downloadEvent=page.waitForEvent('download');
 await page.getByText('Details & exports',{exact:true}).click();
 await page.getByRole('button',{name:'Export import provenance',exact:true}).click();
 const download=await downloadEvent;expect(download.suggestedFilename()).toBe('vibe-import-provenance.json');
 const chunks=[];for await(const chunk of await download.createReadStream())chunks.push(chunk);
 const exported=JSON.parse(Buffer.concat(chunks).toString());
 expect(exported).toEqual(JSON.parse(values[historyKey]));
 expect(exported.receipts[0].paths).toHaveLength(1);
 expect(exported.receipts[0].paths[0]).toMatchObject({requirementId:'REQ-003',kind:'background',edgeId:report.edges[0].id,disposition:'open-edge-flag'});
 const path=exported.receipts[0].paths[0];expect(brief.slice(path.source.start,path.source.end)).toBe(path.source.quote);
 await page.locator('.business-rule-card').filter({hasText:spec.requirements.find(r=>r.id==='REQ-003').statement}).click();
 await expect(page.getByRole('button',{name:'Approve reviewed behaviour',exact:true})).toBeDisabled();
 await expect(page.locator('.business-detail')).toContainText('Uncovered / needs review');
 expect(errors).toEqual([]);
 await testInfo.attach('scheduled-path-provenance',{body:JSON.stringify(exported,null,2),contentType:'application/json'});
 await testInfo.attach('scheduled-path-result',{body:await page.screenshot({fullPage:true}),contentType:'image/png'});
});

test('selected scheduled path with unselected parent is rejected before confirmation or writes',async({page})=>{
 await preview(page);await rule(page,0).check();await scheduledRow(page).getByRole('checkbox').check();
 const before=await stored(page);let dialogs=0;page.on('dialog',dialog=>{dialogs++;dialog.dismiss();});
 await commit(page).click();
 await expect(panel(page).getByRole('status')).toContainText('A selected path has no selected source rule.');
 expect(dialogs).toBe(0);expect(await stored(page)).toEqual(before);
 await expect(rule(page,0)).toBeChecked();
});

test('review edits invalidate a pending import preview',async({page})=>{
 await preview(page);await rule(page,1).check();await scheduledRow(page).getByRole('checkbox').check();
 await page.getByLabel('Why is this behaviour acceptable (or what still needs work)?').fill('Preserve this new stakeholder note.');
 await page.getByRole('button',{name:'Save review rationale',exact:true}).click();
 await expect(page.locator('.business-detail').getByRole('status')).toContainText('Rationale recorded');
 const before=await stored(page);let dialogs=0;page.on('dialog',dialog=>{dialogs++;dialog.dismiss();});
 await commit(page).click();
 await expect(panel(page).getByRole('status')).toContainText('The Specification or review changed since preview.');
 expect(dialogs).toBe(0);expect(await stored(page)).toEqual(before);
});

for(const [name,key] of [['review',reviewKey],['provenance',historyKey],['source',sourceKey]]){
 test(`a failed ${name} write rolls back every import record`,async({page})=>{
  await preview(page);await rule(page,1).check();await scheduledRow(page).getByRole('checkbox').check();
  const before=await stored(page);
  await page.evaluate(key=>{
   const original=Storage.prototype.setItem;let failed=false;
   Storage.prototype.setItem=function(k,value){
    if(k===key&&!failed){failed=true;throw new DOMException('Injected write failure','QuotaExceededError');}
    return original.call(this,k,value);
   };
  },key);
  await accept(page);
  await expect(panel(page).getByRole('status')).toContainText('Existing records restored.');
  expect(await stored(page)).toEqual(before);
  await expect(page.locator('.business-summary')).toContainText('r1');
 });
}

test('keyboard selection works and the import panel fits a narrow viewport',async({page})=>{
 await preview(page);
 await rule(page,1).focus();await page.keyboard.press('Space');await expect(rule(page,1)).toBeChecked();
 await scheduledRow(page).getByRole('checkbox').focus();await page.keyboard.press('Space');
 await expect(scheduledRow(page).getByRole('checkbox')).toBeChecked();
 await commit(page).focus();await expect(commit(page)).toBeFocused();
 const bounds=await panel(page).evaluate(element=>({width:element.scrollWidth,client:element.clientWidth}));
 expect(bounds.width).toBeLessThanOrEqual(bounds.client+1);
});
