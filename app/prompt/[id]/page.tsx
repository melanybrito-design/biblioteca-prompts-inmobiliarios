import { notFound } from 'next/navigation';
import Library from '@/components/Library';
import {prompts} from '@/data/library';
export function generateStaticParams(){return prompts.map(p=>({id:p.id}));}
export async function generateMetadata({params}:{params:Promise<{id:string}>}){const {id}=await params;const p=prompts.find(p=>p.id===id);return {title:p?`${p.number}. ${p.displayTitle} · Biblioteca LQ`:'Prompt no encontrado'};}
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;if(!prompts.some(p=>p.id===id))notFound();return <Library initialId={id}/>;}
