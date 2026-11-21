import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const text=(path)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const page=text('app/page.tsx'),layout=text('app/layout.tsx'),view=text('components/business-review-canvas.tsx'),summary=text('components/stakeholder-engineering-summary.tsx'),css=text('app/business-review.css'),core=text('lib/stakeholder-view-core.ts');
test('Business Review is the top-level default, Engineering Cockpit remains reachable',()=>{
 assert.match(page,/useState<'business'\|'engineering'>\('business'\)/);
 assert.match(page,/Business Review Mode/);
 assert.match(page,/Engineering Cockpit/);
 assert.match(page,/aria-pressed=\{experience==='business'\}/);
 assert.match(page,/aria-pressed=\{experience==='engineering'\}/);
});
test('technical panels are unmounted in Business Review and legacy canvas remains intact',()=>{
 assert.match(page,/experience==='business'\?<BusinessReviewCanvas/);
 assert.match(page,/experience==='engineering'&&<aside/);
 assert.match(page,/tab==='canvas'&&<VisualSDDCanvas/);
 assert.match(page,/tab==='specification'&&spec&&<SpecEditor/);
 assert.match(page,/tab==='cloud'&&<CloudPanel/);
 assert.match(page,/onSpecification=\{openSpec\}/);
 assert.match(page,/<StakeholderEngineeringSummary spec=\{spec\}/);
});
test('editing rule wording mutates original Specification, not a shadow business-rule copy',()=>{
 assert.match(view,/onSpecificationChange\(updateRequirement\(spec,active.id,\{statement\}\)\)/);
 assert.match(core,/statement:req.statement/);
 assert.match(core,/sourceCriteria:req.criteria.map/);
});
test('stakeholder records persist separately, with fail-closed recovery and explicit export',()=>{
 assert.match(view,/localStakeholderKey\(spec,projectId\)/);
 assert.match(view,/localStorage\.getItem\(key\)/);
 assert.match(view,/localStorage\.setItem\(key,JSON.stringify\(document\)\)/);
 assert.match(view,/rawRecovery!==null/);
 assert.match(view,/Download original/);
 assert.match(view,/Export review JSON/);
 assert.match(view,/window\.confirm\('Delete only the invalid stakeholder-review cache/);
});
test('workflow, uncovered paths and Given/When/Then scenarios are human-authored',()=>{
 assert.match(view,/addBusinessWorkflow\(doc,card.id,workflow,kind\)/);
 assert.match(view,/flagEdgeCondition\(doc,card.id,edge\)/);
 assert.match(view,/resolveEdgeCondition\(doc,card.id,e.id,exampleId,note\)/);
 assert.match(view,/Resolve with linked evidence/);
 assert.match(view,/proposeBehaviourExample\(doc,card.id,workflowId,given,when,then\)/);
 assert.match(view,/recordReviewRationale\(doc,card.id,rationale\)/);
 assert.match(view,/approveBehaviourReview\(spec,doc,card.id\)/);
});
test('review status is explicit and CSS provides keyboard/responsive affordances',()=>{
 assert.match(view,/Behaviour Reviewed & Approved/);
 assert.match(view,/Example Attached/);
 assert.match(layout,/business-review\.css/);
 assert.match(css,/:focus-visible/);
 assert.match(css,/@media\(max-width:720px\)/);
});
test('engineering summary reads the same sidecar without mutating the old source or plan',()=>{
 assert.match(summary,/localStakeholderKey\(spec,projectId\)/);
 assert.match(summary,/projectStakeholderRules\(spec,doc\)/);
 assert.match(summary,/readStakeholderReview\(JSON.parse\(raw\)\)/);
 assert.doesNotMatch(summary,/localStorage\.setItem/);
});
test('existing source compatibility contracts remain imported and not rewritten',()=>{
 assert.match(page,/import \{createSpecification,readSpecification,validateSpecification,type Specification\} from '\.\.\/lib\/spec-core'/);
 assert.match(page,/inspectCachedSpecification/);
 assert.match(page,/VisualSDDCanvas idea=\{idea\}/);
});
