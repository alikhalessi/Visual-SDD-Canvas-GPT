import type {Metadata} from 'next';
import './globals.css';
import './specification.css';
import './ux-foundation.css';
import './cloud.css';
import './live-canvas.css';
import './agent.css';
import './evidence.css';
import './impact.css';
import './github-trace.css';
export const metadata:Metadata={title:'Visual SDD | Transparent Spec-Driven Development',description:'A visual operating environment for Spec-Driven Development with clear human oversight.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
