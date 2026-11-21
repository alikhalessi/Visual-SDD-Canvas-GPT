import type {Metadata} from 'next';
import EvaluationSandbox from '../../components/evaluation-sandbox';
import './evaluation.css';
export const metadata:Metadata={title:'Visual SDD | Evaluation rehearsal',description:'A local rehearsal comparing equivalent visual and structured-text specifications.'};
export default function EvaluationPage(){return <EvaluationSandbox/>;}
