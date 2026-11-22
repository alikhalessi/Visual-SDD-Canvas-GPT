import {test,expect} from '@playwright/test';
import {createSpecification} from '../lib/spec-core.ts';
import {localStakeholderKey} from '../lib/stakeholder-view-core.ts';
import {parseVibeBrief,defaultImportChoices,prepareVibeImport,appendVibeImportHistory,localVibeHistoryKey} from '../lib/vibe-ingestor-core.ts';

const brief='An athlete must be able to revoke coach access to the dashboard. The system should queue weekly reports and check permissions when delivering a report.';
const proposal=parseVibeBrief(brief),choices=defaultImportChoices(proposal);
choices.rules.forEach(r=>r.include=true);
choices.paths.find(x=>x.id===proposal.paths.find(p=>p.ruleId==='C-002'&&p.kind==='background').id).include=true;
const imported=prepareVibeImport(createSpecification(brief),null,proposal,choices);
const history=appendVibeImportHistory(null,imported.receipt);
const projectId='11111111-1111-4111-8111-111111111111';
const secondId='22222222-2222-4222-8222-222222222222';
const cloudToken='2026-11-21T16:00:00.000Z';
const qaSession={session:{id:'qa-session',userId:'qa-user'},user:{id:'qa-user',name:'QA account',email:'qa@example.invalid'}};
function project(id,title){return {id,title,idea:brief,specification:imported.spec,revision:2,approval_status:'draft',updated_at:cloudToken,created_at:cloudToken};}
async function openProjects(page){await page.getByRole('button',{name:'◉ QA account',exact:true}).click();}
function queuedRule(page){return page.locator('.business-rule-card').filter({hasText:imported.spec.requirements.find(r=>r.id==='REQ-003').statement});}
test.beforeEach(async({page})=>{
 test.skip(!!process.env.E2E_BASE_URL,'Mocked cloud integration runs locally; live OAuth is verified separately.');
 await page.route('**/api/auth/**',r=>r.fulfill({json:qaSession}));
 const projects=[project(secondId,'QA second project')];
 await page.route('**/api/workspace',async route=>{
  if(route.request().method()==='GET')return route.fulfill({json:{projects,activity:[]}});
  const payload=route.request().postDataJSON();
  projects.unshift({...project(projectId,'QA first project'),...payload,id:projectId,updated_at:cloudToken});
  return route.fulfill({status:201,json:{created:true,project:{id:projectId,updated_at:cloudToken}}});
 });
 await page.addInitScript(({spec,review,history,brief,reviewKey,historyKey})=>{
  if(localStorage.getItem('qa-cloud-seeded'))return;
  localStorage.setItem('qa-cloud-seeded','yes');
  localStorage.setItem('visual-sdd-specification-v1',JSON.stringify(spec));
  localStorage.setItem('visual-sdd-idea',JSON.stringify({id:'qa-idea',title:'Athlete access',description:brief,status:'draft'}));
  localStorage.setItem(reviewKey,JSON.stringify(review));localStorage.setItem(historyKey,JSON.stringify(history));
 },{spec:imported.spec,review:imported.review,history,brief,reviewKey:localStakeholderKey(imported.spec,null),historyKey:localVibeHistoryKey(imported.spec,null)});
 await page.goto('/');
});

test('first cloud save retains browser review and provenance under the new project identity',async({page})=>{
 await openProjects(page);await page.getByRole('button',{name:'Save to my account →',exact:true}).click();
 await expect(page.getByRole('status')).toContainText('New project saved securely');
 await page.getByRole('button',{name:'Business Review Mode',exact:true}).click();
 await expect(queuedRule(page)).toContainText('1 uncovered path(s)');
 const values=await page.evaluate(keys=>keys.map(k=>localStorage.getItem(k)),[localStakeholderKey(imported.spec,projectId),localVibeHistoryKey(imported.spec,projectId)]);
 expect(JSON.parse(values[0])).toEqual(imported.review);expect(JSON.parse(values[1])).toEqual(history);
});

test('project identity survives reload and project switching keeps local notes separate',async({page})=>{
 await openProjects(page);await page.getByRole('button',{name:'Save to my account →',exact:true}).click();
 await expect(page.getByRole('status')).toContainText('New project saved securely');
 await page.getByRole('button',{name:'Business Review Mode',exact:true}).click();
 await queuedRule(page).click();
 await page.getByLabel('Why is this behaviour acceptable (or what still needs work)?').fill('Only the first cloud project owns this QA review note.');
 await page.getByRole('button',{name:'Save review rationale',exact:true}).click();
 await page.reload();
 await queuedRule(page).click();
 await expect(page.getByLabel('Why is this behaviour acceptable (or what still needs work)?')).toHaveValue('Only the first cloud project owns this QA review note.');
 await openProjects(page);
 page.once('dialog',d=>d.accept());
 await page.locator('.cloud-project').filter({hasText:'QA second project'}).getByRole('button',{name:'Open',exact:true}).click();
 await page.getByRole('button',{name:'Business Review Mode',exact:true}).click();
 await queuedRule(page).click();
 await expect(page.getByLabel('Why is this behaviour acceptable (or what still needs work)?')).toHaveValue('');
 await expect(queuedRule(page)).toContainText('0 uncovered path(s)');
 await openProjects(page);page.once('dialog',d=>d.accept());
 await page.locator('.cloud-project').filter({hasText:imported.spec.title}).getByRole('button',{name:'Open',exact:true}).click();
 await page.getByRole('button',{name:'Business Review Mode',exact:true}).click();
 await queuedRule(page).click();
 await expect(page.getByLabel('Why is this behaviour acceptable (or what still needs work)?')).toHaveValue('Only the first cloud project owns this QA review note.');
});

test('a corrupt cloud link cannot bypass unreadable-source recovery or erase source bytes',async({page})=>{
 await page.evaluate(()=>{
  localStorage.setItem('visual-sdd-specification-v1','{unreadable-source');
  localStorage.setItem('visual-sdd-cloud-link-v1','{unreadable-link');
 });
 await page.reload();
 await expect(page.getByText('Recovery needed: unreadable browser Specification',{exact:true})).toBeVisible();
 expect(await page.evaluate(()=>localStorage.getItem('visual-sdd-specification-v1'))).toBe('{unreadable-source');
 expect(await page.evaluate(()=>localStorage.getItem('visual-sdd-cloud-link-v1'))).toBe('{unreadable-link');
});
