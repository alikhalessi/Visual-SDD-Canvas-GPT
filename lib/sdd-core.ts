export const SDD_STAGES = [
 {id:'idea',label:'Idea',plain:'Your idea',professional:'Intent capture',artifact:'Idea brief',summary:'Describe what you want to create, for whom, and why it matters.'},
 {id:'specify',label:'Specify',plain:'Define the needs',professional:'Requirements & acceptance criteria',artifact:'Specification',summary:'Make the expected behavior explicit and reviewable before code.'},
 {id:'plan',label:'Plan',plain:'Decide how',professional:'Architecture & impact plan',artifact:'Technical plan',summary:'Identify components, dependencies, risks, and implementation choices.'},
 {id:'tasks',label:'Tasks',plain:'Break down work',professional:'Traceable task breakdown',artifact:'Task list',summary:'Translate the approved specification into ordered implementation tasks.'},
 {id:'implement',label:'Implement',plain:'Build',professional:'Agent execution & code review',artifact:'Code change / PR',summary:'Perform approved changes in a constrained, auditable environment.'},
 {id:'verify',label:'Verify',plain:'Check it works',professional:'Evidence & acceptance tests',artifact:'Test evidence',summary:'Compare tested behavior with the accepted requirements.'},
 {id:'release',label:'Release',plain:'Publish safely',professional:'Human-approved deployment',artifact:'Release record',summary:'Publish only after an authorized review and recorded decision.'}
] as const;
export type StageId = typeof SDD_STAGES[number]['id'];
export function getStage(id: StageId){return SDD_STAGES.find(s=>s.id===id)!;}
export function normalizeIdea(input: string){return input.trim().replace(/\s+/g,' ').slice(0,600);}
export function buildIdeaDraft(input: string){
 const description=normalizeIdea(input);
 if(description.length<12) throw new Error('Please describe the idea using at least 12 characters.');
 return {id:'browser-local',title:description.slice(0,58),description,status:'draft' as const};
}
export function progressFor(stage: StageId){return Math.round(((SDD_STAGES.findIndex(s=>s.id===stage)+1)/SDD_STAGES.length)*100);}
