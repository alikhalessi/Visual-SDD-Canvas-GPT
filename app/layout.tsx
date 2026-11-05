import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Visual SDD | Transparent Spec-Driven Development',description:'A visual operating environment for Spec-Driven Development with clear human oversight.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
