import type { Metadata } from "next"; import "./globals.css";
export const metadata:Metadata={title:"Mobility Pulse AI",description:"Intelligenz für den öffentlichen Verkehr"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="de"><body>{children}</body></html>}
