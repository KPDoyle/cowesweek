import Image from 'next/image';
import { ArrowDown, ArrowUpRight, Compass, MapPin, Waves } from 'lucide-react';

/** An original island-and-wave mark, independent of tourism and event logos. */
export function IslandMark({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <path d="M32 5 55 28 32 46 9 28Z" fill="currentColor"/>
    <path d="m15 28 17-16 17 16-17-5Z" fill="var(--sunshine, #ffdc52)"/>
    <path d="M6 45c9-9 17 9 26 0s17 9 26 0M6 55c9-9 17 9 26 0s17 9 26 0" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
  </svg>;
}

type Props = {
  discipline: string;
  onProgramme: () => void;
  onRegister: () => void;
  loaded: boolean;
};

export function IslandHero({ discipline, onProgramme, onRegister, loaded }: Props) {
  const powerboat = discipline === 'powerboat';
  return <section className={`island-hero ${powerboat ? 'powerboat-hero' : ''}`} aria-labelledby="island-headline">
    <Image key={discipline} src={`/images/${powerboat ? 'powerboat' : 'sailing'}-solent.webp`} alt={powerboat ? 'Illustrative offshore powerboats racing across blue water beside a green island coastline' : 'Illustrative sailing yachts crossing blue water beside a green island coastline'} fill priority sizes="(max-width: 560px) 100vw, (max-width: 1100px) 92vw, 1400px" className="hero-photo"/>
    <div className="hero-shade"/>
    <div className="hero-content">
      <p className="hero-kicker"><span/> COWES · ISLE OF WIGHT</p>
      <h1 id="island-headline">our island.<br/><span>{powerboat ? 'full throttle.' : 'your race.'}</span></h1>
      <p className="hero-description">{powerboat ? 'Big wakes. Bigger moments. Bring your crew, your boat and every offshore race together.' : 'Salt in the air. A fleet on the horizon. Your whole week on the water, together in one place.'}</p>
      <div className="hero-actions">
        <button className="btn sunshine" onClick={onProgramme}>Explore the programme <ArrowUpRight size={17}/></button>
        <button className="hero-register" disabled={!loaded} onClick={onRegister}>Register your boat <ArrowUpRight size={16}/></button>
      </div>
    </div>
    <div className="island-stamp"><IslandMark/><span>ISLAND SPIRIT.<br/>OCEAN ADVENTURE.</span></div>
    <div className="hero-bottom"><a href="#race-centre"><Compass size={15}/> Your race centre <ArrowDown size={14}/></a><span>Original AI-created illustration</span></div>
  </section>;
}

export function IslandRibbon({ onHarbour }: { onHarbour: () => void }) {
  return <div className="island-ribbon"><span className="ribbon-wave"><Waves size={25}/></span><p>One island. <strong>A whole world of racing.</strong></p><button onClick={onHarbour}><MapPin size={14}/> Find your place ashore <ArrowUpRight size={15}/></button></div>;
}
