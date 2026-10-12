import Image from 'next/image';
import { ArrowDown, ArrowUpRight, Compass, MapPin, Waves } from 'lucide-react';

/** Registered 3:5 island flag, reproduced from the public-domain source asset. */
export function IsleOfWightFlag({ className = '' }: { className?: string }) {
  return <Image src="/isle-of-wight-flag.svg" width={50} height={30} alt="Official Isle of Wight flag" className={className}/>;
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
    <div className="island-stamp"><IsleOfWightFlag/><span>ISLAND SPIRIT.<br/>OCEAN ADVENTURE.</span></div>
    <div className="hero-bottom"><a href="#race-centre"><Compass size={15}/> Your race centre <ArrowDown size={14}/></a><span>Original AI-created illustration</span></div>
  </section>;
}

export function IslandRibbon({ onHarbour }: { onHarbour: () => void }) {
  return <div className="island-ribbon"><span className="ribbon-wave"><Waves size={25}/></span><p>One island. <strong>A whole world of racing.</strong></p><button onClick={onHarbour}><MapPin size={14}/> Find your place ashore <ArrowUpRight size={15}/></button></div>;
}
