// Run offline with a private, researcher-controlled reference file. No network calls.
import {readFile,writeFile} from 'node:fs/promises';
import {readEvaluationSession} from '../lib/evaluation-core.ts';
import {scoreEvaluation} from '../lib/evaluation-scoring.ts';
const [sessionFile,referenceFile,outputFile]=process.argv.slice(2);
if(!sessionFile||!referenceFile||!outputFile)throw Error('Expected session JSON, private reference JSON and new output JSON paths.');
async function boundedJSON(file){const raw=await readFile(file,'utf8');if(raw.length>200000)throw Error('Input exceeds 200000 characters.');return JSON.parse(raw);}
const session=await readEvaluationSession(await boundedJSON(sessionFile));
if(!session)throw Error('Invalid or stale session.');
const score=await scoreEvaluation(session,await boundedJSON(referenceFile));
await writeFile(outputFile,JSON.stringify(score,null,2),{encoding:'utf8',flag:'wx'});
process.stdout.write('Research score written; private reference was not copied.\n');
