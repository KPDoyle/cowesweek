'use client';

import { useEffect, useRef, useState } from 'react';
import { Anchor, ArrowLeft, ArrowRight, CalendarDays, Compass, Flag, Layers3, Play, ShieldCheck, Ship, Sparkles, Trophy, Users, X } from 'lucide-react';

type Audience = 'spectator' | 'organiser';
const tours = {
  spectator: [
    { icon: Compass, label: 'Live race centre', title: 'See the race take shape.', summary: 'Follow sailing and powerboat fleets on a detailed Solent chart, with course marks and boat details in one view.', scene: 'map' },
    { icon: Layers3, label: 'Course & map layers', title: 'Make the water easier to read.', summary: 'Switch chart styles, inspect courses and marks, and use the perspective view to understand where the fleet is headed.', scene: 'layers' },
    { icon: Play, label: 'Replay & analysis', title: 'Replay key moments.', summary: 'Move the shared race clock, compare boats, and explore speed, position and race stories. Demonstration tracks are labelled clearly.', scene: 'replay' },
    { icon: Trophy, label: 'Results', title: 'Understand the order.', summary: 'Explore published finish times, corrected IRC standings and series tables as they become available.', scene: 'results' },
    { icon: Anchor, label: 'Shore guide', title: 'Follow from the island.', summary: 'Find shore viewpoints, event stories and practical places to watch around Cowes and the Isle of Wight.', scene: 'shore' },
  ],
  organiser: [
    { icon: CalendarDays, label: 'Race programme', title: 'Keep every start in view.', summary: 'Review the event programme and manage race schedules for both sailing and powerboat events.', scene: 'schedule' },
    { icon: Users, label: 'Boats & crew', title: 'Know who is on the water.', summary: 'Maintain boat entries and crew information, with private contacts kept in the race office workspace.', scene: 'fleet' },
    { icon: ShieldCheck, label: 'Race office', title: 'Run a safer race day.', summary: 'Track readiness, notices, incidents and protests alongside race office decisions.', scene: 'office' },
    { icon: Compass, label: 'Courses & results', title: 'Prepare the public race view.', summary: 'Edit courses and marks, review recorded tracks, and publish results and scoring when they are ready.', scene: 'course' },
    { icon: Ship, label: 'Powerboat operations', title: 'Manage both disciplines.', summary: 'Work with the powerboat programme, classes, race operations and event information in the same workspace.', scene: 'power' },
    { icon: Flag, label: 'Public experience', title: 'Share the right event details.', summary: 'Choose what spectators can see, then publish stories, coverage and shore information from the organiser tools.', scene: 'publish' },
  ],
} as const;

export default function FeatureTour({ audience }: { audience: Audience }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const trigger = useRef<HTMLButtonElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const slides = tours[audience];
  const current = slides[step];
  const Icon = current.icon;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
      if (event.key === 'ArrowRight') setStep(n => Math.min(n + 1, slides.length - 1));
      if (event.key === 'ArrowLeft') setStep(n => Math.max(n - 1, 0));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, slides.length]);

  useEffect(() => {
    if (open) { close.current?.focus(); wasOpen.current = true; }
    else if (wasOpen.current) { trigger.current?.focus(); wasOpen.current = false; }
  }, [open]);

  return <>
    <button ref={trigger} className="feature-tour-trigger" type="button" onClick={() => { setStep(0); setOpen(true); }} aria-haspopup="dialog">
      <Sparkles size={14} aria-hidden="true"/><span>Take a quick tour</span>
    </button>
    {open && <div className="feature-tour-scrim" onMouseDown={event => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section className="feature-tour-dialog" role="dialog" aria-modal="true" aria-labelledby="feature-tour-title" aria-describedby="feature-tour-summary" data-audience={audience}>
        <button ref={close} className="feature-tour-close" type="button" onClick={() => setOpen(false)} aria-label="Close tour"><X size={19}/></button>
        <div key={current.scene} className="feature-tour-art" data-scene={current.scene} data-audience={audience} aria-hidden="true">
          <div className="tour-art-photo"/>
          <div className="tour-art-grade"/>
          <div className="tour-art-topline"><span><i/> {audience === 'spectator' ? 'SOLENT RACE VIEW' : 'COWES RACE OFFICE'}</span><span>{audience === 'spectator' ? 'ISLE OF WIGHT' : 'EVENT CONTROL'}</span></div>
          <svg className="tour-art-route" viewBox="0 0 450 430" preserveAspectRatio="none">
            <path className="tour-route-halo" d="M34 299 C104 273 112 212 181 217 S271 260 293 188 S369 142 418 105"/>
            <path className="tour-route-line" d="M34 299 C104 273 112 212 181 217 S271 260 293 188 S369 142 418 105"/>
            <circle className="tour-waypoint" cx="34" cy="299" r="7"/><circle className="tour-waypoint" cx="181" cy="217" r="7"/><circle className="tour-waypoint" cx="293" cy="188" r="7"/><circle className="tour-waypoint" cx="418" cy="105" r="7"/>
            <circle className="tour-route-vessel" r="7"><animateMotion dur={audience === 'spectator' ? '9s' : '12s'} repeatCount="indefinite" path="M34 299 C104 273 112 212 181 217 S271 260 293 188 S369 142 418 105"/></circle>
          </svg>
          <div className="tour-art-signal"><span className="tour-signal-ring"/><span className="tour-signal-ring"/><i/></div>
          <div className="tour-art-top-card"><small>{audience === 'spectator' ? 'RACE DISPLAY' : 'OPERATIONS'}</small><strong>{current.label}</strong><span><i/> {audience === 'spectator' ? 'COURSE & FLEET' : 'RACE DAY WORKSPACE'}</span></div>
          <div className="tour-art-glass"><span className="tour-glass-icon"><Icon size={15}/></span><div><small>FEATURE {String(step + 1).padStart(2, '0')} <i>•</i> {audience === 'spectator' ? 'SPECTATOR' : 'RACE TEAM'}</small><strong>{current.label}</strong></div><span className="tour-art-step">{String(step + 1).padStart(2, '0')}<i>/</i>{String(slides.length).padStart(2, '0')}</span></div>
          <div className="tour-art-readouts">{(audience === 'spectator' ? [['TRACK', 'FLEET VIEW'], ['COURSE', 'MARKS'], ['REPLAY', 'RACE STORY']] : [['PROGRAMME', 'STARTS'], ['FLEET', 'READINESS'], ['PUBLISH', 'PUBLIC VIEW']]).map((item, index) => <span key={item[0]} className={index === step % 3 ? 'active' : ''}><i>{String(index + 1).padStart(2, '0')}</i><b>{item[0]}</b><small>{item[1]}</small></span>)}</div>
        </div>
        <div className="feature-tour-body">
          <p className="feature-tour-eyebrow"><span/> {audience === 'spectator' ? 'COWES WEEK LIVE' : 'RACE OFFICE'} <i>•</i> A QUICK TOUR</p>
          <div className="feature-tour-copy" aria-live="polite" aria-atomic="true">
            <span className="feature-tour-count">FEATURE {String(step + 1).padStart(2, '0')} OF {String(slides.length).padStart(2, '0')}</span>
            <h2 id="feature-tour-title">{current.title}</h2>
            <p id="feature-tour-summary">{current.summary}</p>
          </div>
          <div className="feature-tour-progress" role="group" aria-label="Tour steps">
            {slides.map((slide, index) => <button key={slide.label} type="button" onClick={() => setStep(index)} aria-label={`Go to feature ${index + 1}: ${slide.label}`} aria-current={index === step ? 'step' : undefined}><span style={{width: index <= step ? '100%' : '0%'}}/></button>)}
          </div>
          <div className="feature-tour-footer">
            <button className="feature-tour-skip" type="button" onClick={() => setOpen(false)}>Close tour</button>
            <div>
              <button className="feature-tour-prev" type="button" onClick={() => setStep(n => Math.max(0, n - 1))} disabled={step === 0}><ArrowLeft size={16}/><span>Back</span></button>
              {step < slides.length - 1
                ? <button className="feature-tour-next" type="button" onClick={() => setStep(n => Math.min(slides.length - 1, n + 1))}>Next <ArrowRight size={16}/></button>
                : <button className="feature-tour-next" type="button" onClick={() => setOpen(false)}>Done <Sparkles size={15}/></button>}
            </div>
          </div>
        </div>
      </section>
    </div>}
  </>;
}
