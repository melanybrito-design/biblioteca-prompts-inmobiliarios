'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="loading"><h1>No pudimos abrir la biblioteca</h1><p>Intenta cargarla de nuevo.</p><button onClick={reset}>Reintentar</button></main>;}
