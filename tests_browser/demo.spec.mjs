import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {createDemoSample,DEMO_PROJECT_ID,DEMO_SOURCE_KEY,DEMO_MARKER,demoRecordKeys} from '../lib/demo-core.ts';
import {localStakeholderKey} from '../lib/stakeholder-view-core.ts';
const fixture=createDemoSample(),reviewKey=localStakeholderKey(fixture.source,DEMO_PROJECT_ID);
async function open(page){await page.goto('/');await expect(page.getByRole('heading',{name:'Withdraw coach access',exact:true})).toBeVisible();}
async function state(page){return page.evaluate(({source,review})=>({source:localStorage.getItem(source),review:localStorage.getItem(review)}),{source:DEMO_SOURCE_KEY,review:reviewKey});}
test('fresh public demo loads draft SetPilot with open queued-report questions and no account requests',async({page},info)=>{
 const calls=[],errors=[];page.on('request',r=>{if(new URL(r.url()).pathname.startsWith('/api/'))calls.push(r.url());});page.on('pageerror',e=>errors.push(e.message));
 await open(page);await expect(page.getByText('SetPilot sample demo',{exact:true})).toBeVisible();await expect(page.getByText('Source draft — separate source approval pending',{exact:false})).toBeVisible();
 const saved=await state(page);expect(JSON.parse(saved.source)).toEqual(fixture.source);expect(JSON.parse(saved.review)).toEqual(fixture.review);
 await expect(page.getByRole('button',{name:'Approve reviewed behaviour',exact:true})).toBeDisabled();await expect(page.locator('.business-edge').first()).toContainText('not a confirmed workflow');
 expect(calls).toEqual([]);expect(errors).toEqual([]);await info.attach('demo-source-and-review',{body:JSON.stringify(saved,null,2),contentType:'application/json'});
});
test('explicit edits survive reload and reset cancellation preserves them',async({page})=>{
 await open(page);const field=page.getByLabel('What must happen?',{exact:true});const changed=fixture.source.requirements[0].statement+' This is an explicit demo edit.';await field.fill(changed);await page.getByRole('button',{name:'Save rule wording',exact:true}).click();
 await page.reload();await expect(page.getByLabel('What must happen?',{exact:true})).toHaveValue(changed);const before=await state(page);
 page.once('dialog',d=>d.dismiss());await page.getByRole('button',{name:'Reset demo sample',exact:true}).click();expect(await state(page)).toEqual(before);
});
test('confirmed reset restores exact sample and removes only demo decisions and sidecars',async({page},info)=>{
 await open(page);await page.getByLabel('What must happen?',{exact:true}).fill('An explicitly changed rule that should be replaced by reset.');await page.getByRole('button',{name:'Save rule wording',exact:true}).click();
 await page.evaluate(({keys,source,marker,review})=>{for(const k of keys)if(![source,marker,review,'visual-sdd-idea'].includes(k))localStorage.setItem(k,'demo sidecar edits');localStorage.setItem('visual-sdd-evaluation-v1','evaluation sentinel');localStorage.setItem('unrelated-project','unrelated sentinel');},{keys:demoRecordKeys(fixture.source),source:DEMO_SOURCE_KEY,marker:DEMO_MARKER,review:reviewKey});
 page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Reset demo sample',exact:true}).click();await expect(page.getByLabel('What must happen?',{exact:true})).toHaveValue(fixture.source.requirements[0].statement);
 const saved=await state(page);expect(JSON.parse(saved.source)).toEqual(fixture.source);expect(JSON.parse(saved.review)).toEqual(fixture.review);
 expect(await page.evaluate(()=>[localStorage.getItem('visual-sdd-evaluation-v1'),localStorage.getItem('unrelated-project')])).toEqual(['evaluation sentinel','unrelated sentinel']);
 await info.attach('reset-restored-source-and-review',{body:JSON.stringify(saved,null,2),contentType:'application/json'});
});
test('failed reset restores prior bytes and reports the failure',async({page})=>{
 await open(page);const before=await state(page);await page.evaluate(key=>{const put=Storage.prototype.setItem;let fail=true;Storage.prototype.setItem=function(k,v){if(this===localStorage&&k===key&&fail){fail=false;throw Error('Simulated quota');}return put.call(this,k,v);};},DEMO_SOURCE_KEY);
 page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Reset demo sample',exact:true}).click();await expect(page.getByRole('alert')).toContainText('previous records were restored');expect(await state(page)).toEqual(before);
});
test('another-tab source edit pauses stale editing and can be deliberately restored',async({page,context})=>{
 await open(page);const other=await context.newPage();await open(other);await other.evaluate(key=>{const s=JSON.parse(localStorage.getItem(key));s.title='SetPilot changed in another tab';localStorage.setItem(key,JSON.stringify(s));},DEMO_SOURCE_KEY);
 await expect(page.getByRole('alert')).toContainText('another tab');await expect(page.getByLabel('What must happen?',{exact:true})).toHaveCount(0);await page.getByRole('button',{name:'Reload saved demo',exact:true}).click();await expect(page.locator('.business-source')).toContainText('SetPilot changed in another tab');await other.close();
});
test('corrupt demo source is retained until the visitor confirms reset',async({page})=>{
 await open(page);await page.evaluate(key=>localStorage.setItem(key,'{broken demo source'),DEMO_SOURCE_KEY);await page.reload();await expect(page.getByRole('alert')).toBeVisible();expect(await page.evaluate(key=>localStorage.getItem(key),DEMO_SOURCE_KEY)).toBe('{broken demo source');
 page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Reset demo sample',exact:true}).click();await expect(page.getByRole('heading',{name:'Withdraw coach access',exact:true})).toBeVisible();
});
test('demo cloud and authentication endpoints refuse access without contacting live services',async({request})=>{
 for(const method of ['GET','POST','DELETE']){const r=await request.fetch('/api/workspace',{method});expect(r.status()).toBe(403);expect(r.headers()['cache-control']).toContain('no-store');expect(await r.json()).toEqual({error:'Cloud workspace is disabled in this sample demo.'});}
 for(const method of ['GET','POST']){const r=await request.fetch('/api/auth/get-session',{method});expect(r.status()).toBe(403);expect(await r.json()).toEqual({error:'Cloud accounts are disabled in this sample demo.'});}
});
test('demo disclosures work with keyboard and narrow layouts retain accessible controls',async({page,browserName},info)=>{
 await open(page);const before=await state(page);const details=page.getByText('Details & exports',{exact:true});await details.focus();await details.press('Enter');await expect(page.getByRole('button',{name:'Export review JSON',exact:true})).toBeVisible();await details.press('Enter');await expect(page.getByRole('button',{name:'Export review JSON',exact:true})).toBeHidden();expect(await state(page)).toEqual(before);
 for(const width of [320,390,768,1280]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+1);await expect(page.getByRole('button',{name:'Reset demo sample',exact:true})).toBeVisible();}
 if(browserName==='chromium'){const report=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();await info.attach('demo-accessibility',{body:JSON.stringify(report,null,2),contentType:'application/json'});expect(report.violations.map(x=>x.id)).toEqual([]);}
 await info.attach('demo-desktop',{body:await page.screenshot({fullPage:true}),contentType:'image/png'});
});
