import { notFound } from 'next/navigation';
import OrganizerApp from '../components/OrganizerApp';
export default function Office(){if(process.env.COWES_PUBLIC_ONLY==='1')notFound();return <OrganizerApp/>;}
