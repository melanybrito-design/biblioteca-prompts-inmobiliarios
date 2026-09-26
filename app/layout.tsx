import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Biblioteca de Prompts Inmobiliarios · LQ',description:'30 prompts para atraer, conversar y acompañar a tus clientes inmobiliarios.',icons:{icon:'/favicon.svg'}};
export default function Layout({children}:{children:React.ReactNode}) {return <html lang="es"><body>{children}</body></html>;}
