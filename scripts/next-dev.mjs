// Accept the managed preview supervisor's host/port flags as well as Next CLI flags.
import { createRequire } from 'node:module';
const preview=process.argv.includes('--production-preview');
const args=process.argv.slice(2).filter(a=>!['--strictPort','--production-preview'].includes(a)).map(a=>a==='--host'?'--hostname':a);
process.argv=[process.execPath,createRequire(import.meta.url).resolve('next/dist/bin/next'),...(preview?['start']:['dev','--webpack']),...args];
await import('next/dist/bin/next');
