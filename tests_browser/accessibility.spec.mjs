import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {createSpecification} from '../lib/spec-core.ts';
const brief='An athlete must revoke coach access to the dashboard. The system should queue weekly reports and check delivery permissions.';
test('keyboard and narrow layout work across browsers with Chromium WCAG audit',async({page,browserName},testInfo)=>{
 test.skip(!!process.env.E2E_BASE_URL,'Uses an isolated local fixture.');
 await page.route('**/api/auth/**',r=>r.fulfill({json:{session:null,user:null}}));
 await page.addInitScript(spec=>{
  localStorage.setItem('visual-sdd-specification-v1',JSON.stringify(spec));
  localStorage.setItem('visual-sdd-idea',JSON.stringify({id:'qa',title:'Athlete access',description:spec.sourceIdea,status:'draft'}));
 },createSpecification(brief));
 await page.setViewportSize({width:320,height:780});await page.goto('/');
 const summary=page.locator('.vibe-import summary');await summary.focus();await summary.press('Enter');
 await page.getByLabel('Prototype behavior / feature brief').fill(brief);
 await page.getByRole('button',{name:'Preview candidates',exact:true}).click();
 await expect(page.locator('.vibe-candidate')).toHaveCount(2);
 // axe injection crashes the Windows Firefox test process; audit Chromium,
 // while every engine still runs the keyboard and viewport assertions below.
 if(browserName==='chromium'){
  const report=await new AxeBuilder({page}).include('.business-view').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  await testInfo.attach('accessibility-report',{body:JSON.stringify(report,null,2),contentType:'application/json'});
  expect(report.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
 }
 for(const width of [320,390,768]){
  await page.setViewportSize({width,height:780});
  const bounds=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:window.innerWidth,
   overflow:[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>window.innerWidth+1).map(e=>({tag:e.tagName,class:e.className,right:e.getBoundingClientRect().right})).slice(-12)}));
  expect(bounds.width,JSON.stringify(bounds)).toBeLessThanOrEqual(bounds.viewport+1);
 }
});

test('cloud API rejects guest access and cross-origin mutations',async({request})=>{
 test.skip(!!process.env.E2E_BASE_URL,'Local API boundary checks; no live cloud mutation.');
 const guest=await request.get('/api/workspace');expect(guest.status()).toBe(401);
 expect(guest.headers()['cache-control']).toContain('no-store');
 for(const method of ['POST','DELETE']){
  const response=await request.fetch('/api/workspace',{method,headers:{origin:'https://untrusted.example'},data:{}});
  expect(response.status()).toBe(403);expect(await response.json()).toEqual({error:'Cross-origin request rejected.'});
 }
});
