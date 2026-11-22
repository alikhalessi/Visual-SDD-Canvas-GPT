import {test,expect} from '@playwright/test';
import {createDemoSample} from '../lib/demo-core.ts';
import {localStakeholderKey} from '../lib/stakeholder-view-core.ts';
test('secondary details retain exact review exports and opening them does not change records',async({page})=>{
 const f=createDemoSample(),key=localStakeholderKey(f.source,null);
 await page.route('**/api/auth/**',r=>r.fulfill({json:{session:null,user:null}}));
 await page.addInitScript(({f,key})=>{localStorage.setItem('visual-sdd-specification-v1',JSON.stringify(f.source));localStorage.setItem('visual-sdd-idea',JSON.stringify({description:f.source.sourceIdea}));localStorage.setItem(key,JSON.stringify(f.review));},{f,key});
 await page.goto('/');await expect(page.getByRole('heading',{name:'Withdraw coach access',exact:true})).toBeVisible();
 const before=await page.evaluate(key=>[localStorage.getItem('visual-sdd-specification-v1'),localStorage.getItem(key)],key);
 await expect(page.getByRole('button',{name:'Export review JSON',exact:true})).toBeHidden();
 const details=page.getByText('Details & exports',{exact:true});await details.focus();await details.press('Enter');
 await expect(page.getByRole('button',{name:'Export review JSON',exact:true})).toBeVisible();
 await page.getByText('Reference details',{exact:true}).click();await expect(page.locator('.business-reference')).toContainText('REQ-001');
 await expect(page.locator('.business-edge').first()).toContainText('not a confirmed workflow');
 const done=page.waitForEvent('download');await page.getByRole('button',{name:'Export review JSON',exact:true}).click();const file=await done;const stream=await file.createReadStream();let raw='';for await(const part of stream)raw+=part;
 expect(JSON.parse(raw)).toEqual(f.review);expect(await page.evaluate(key=>[localStorage.getItem('visual-sdd-specification-v1'),localStorage.getItem(key)],key)).toEqual(before);
});
