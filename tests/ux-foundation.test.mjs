import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getJourneySteps, getNextAction } from '../lib/ux-core.ts';

const sample = { ideaSaved: false, specificationExists: false, approvalStatus: null, validationIssueCount: 0 };
test('newcomers receive a concrete first action', () => {
  assert.equal(getNextAction(sample).id, 'idea');
  assert.equal(getJourneySteps(sample)[0].state, 'current');
  assert.equal(getJourneySteps(sample)[2].state, 'upcoming');
});
test('saved ideas prompt specification creation', () => {
  const input={ ...sample, ideaSaved:true };
  assert.equal(getNextAction(input).id, 'specification');
  assert.equal(getJourneySteps(input)[0].state, 'complete');
  assert.equal(getJourneySteps(input)[1].state, 'current');
});
test('draft with validation issues stays in editor', () => {
  const input={...sample,specificationExists:true,approvalStatus:'draft',validationIssueCount:4};
  assert.equal(getNextAction(input).id,'approval');
  assert.match(getNextAction(input).title,/Complete/);
  assert.equal(getJourneySteps(input)[2].state,'current');
});
test('validated draft is not represented as approved', () => {
  const input={...sample,specificationExists:true,approvalStatus:'draft',validationIssueCount:0};
  assert.match(getNextAction(input).title,/Review/);
  assert.equal(getJourneySteps(input)[2].state,'current');
});
test('approved specification now points to available human-reviewed planning', () => {
  const input={...sample,specificationExists:true,approvalStatus:'approved',validationIssueCount:0};
  assert.equal(getNextAction(input).id,'planning');
  assert.equal(getJourneySteps(input).filter(x=>x.state==='complete').length,3);
  assert.match(getNextAction(input).instruction,/Technical Plan/);
});
test('existing specifications count as a captured idea after browser restore',()=>{
  const input={...sample,specificationExists:true,approvalStatus:'draft'};
  assert.equal(getJourneySteps(input)[0].state,'complete');
});
