'use client';

import { useEffect, useRef, useState } from 'react';
import { Anchor, ArrowLeft, ArrowRight, Bell, CalendarDays, Compass, Download, Flag, Layers3, MapPin, Play, Radio, ShieldCheck, Ship, Sparkles, Trophy, Users, Video, X } from 'lucide-react';

type Audience = 'spectator' | 'organiser';
const tours = {
  spectator: [
    { icon: Compass, label: 'Race centre', title: 'Start with the race in progress.', summary: 'Choose sailing or powerboat racing, select a class and race, and see the fleet, conditions and current data status together. Positions are demonstrations until an approved live feed is connected.', demo: 'Show: switch disciplines, then select a race from the class menu.', scene: 'map' },
    { icon: Layers3, label: 'Map & course', title: 'Read the course and the water.', summary: 'Zoom and pan the Solent chart, inspect course marks, and change map layers. Wind, tide, seamarks, laylines, satellite and perspective views add context; course and layline details are illustrative unless supplied by the organiser.', demo: 'Show: change the map layer, zoom to Cowes, and inspect a mark.', scene: 'layers' },
    { icon: Users, label: 'Boat profiles', title: 'Find a boat and follow it.', summary: 'Search across the fleet, filter by class, select a boat for its public profile, and save favourites on your device. Profiles show the public boat and skipper details the organiser has chosen to share.', demo: 'Show: search for a boat, open its profile, and add it to favourites.', scene: 'map' },
    { icon: Play, label: 'Replay', title: 'Move through the race together.', summary: 'Use the shared race clock to play, pause and scrub the fleet replay. Recorded reports can show trails and race moments; simulated movement is labelled and should not be mistaken for official GPS.', demo: 'Show: pause the replay, drag the timeline, then resume at another speed.', scene: 'replay' },
    { icon: Compass, label: 'Race analysis', title: 'Compare how boats are sailing.', summary: 'Compare selected boats using speed, VMG, course progress and estimated manoeuvres. Switch between on-water order and projected corrected order; estimates explain the race but do not replace the official result.', demo: 'Show: open Analysis, choose a comparison boat, and switch ranking basis.', scene: 'replay' },
    { icon: Trophy, label: 'Live leaderboard', title: 'See the provisional order.', summary: 'Follow class positions and gaps as the race model updates. The app separates on-water progress from estimated corrected order so spectators can see what is known and what remains provisional.', demo: 'Show: open the live leaderboard and compare water order with projected order.', scene: 'results' },
    { icon: Trophy, label: 'Results & series', title: 'Follow finishes through the regatta.', summary: 'Review finish records, IRC corrected times, powerboat laps and series standings. Discards, points overrides and tie breaks follow the configured scoring; only organiser-published results are official. Demo results are labelled.', demo: 'Show: open Results, choose a race, then review the series table.', scene: 'results' },
    { icon: CalendarDays, label: 'Programme', title: 'Know what is racing next.', summary: 'Browse the race programme, class starts and race status, and move from the next start into its race view. Official changes and notices remain under the organiser’s control.', demo: 'Show: open Programme and choose a class or race.', scene: 'schedule' },
    { icon: Anchor, label: 'Shore & nearby racing', title: 'Watch from the Isle of Wight.', summary: 'Explore published shoreline viewpoints and see which races are nearby. If you choose to share device location, the app can compare it with races and viewing points; location access is optional.', demo: 'Show: open Shore, pick a viewpoint, or try “near me” if you want.', scene: 'shore' },
    { icon: Video, label: 'Stories & coverage', title: 'Bring the race beyond the map.', summary: 'See organiser-published photographs, reports, commentary and video, alongside sponsor placements. Video and external links appear when the event team adds authorised coverage.', demo: 'Show: open Stories and play or open an available item.', scene: 'publish' },
    { icon: Flag, label: 'Venue screen', title: 'Put the race on a big screen.', summary: 'Use the venue display for a clearer, larger race view and optional rotation through the programme. It is designed for clubhouses, marinas and public event spaces.', demo: 'Show: turn on Venue screen from the header and review its controls.', scene: 'map' },
    { icon: Download, label: 'Data & accessible viewing', title: 'Keep the race useful and portable.', summary: 'Download race data in supported formats and open the lightweight text viewer when you need a simpler page. The viewer keeps demonstration and data-source status visible.', demo: 'Show: use a footer export link, then open Basic viewer.', scene: 'layers' },
  ],
  organiser: [
    { icon: CalendarDays, label: 'Race programme', title: 'Build the day’s racing plan.', summary: 'Create and update starts for sailing and powerboats, assign classes and scoring, and manage scheduled, postponed, racing or finished status.', demo: 'Show: open Race programme and edit a race or add a start.', scene: 'schedule' },
    { icon: Users, label: 'Boats & crew', title: 'Keep entries in one fleet record.', summary: 'Register boats, numbers, classes, ratings and public profile details. Crew and emergency contacts stay in the protected organiser workspace.', demo: 'Show: open Boats & crew, find an entry, and preview its editable fields.', scene: 'fleet' },
    { icon: ShieldCheck, label: 'Readiness & scrutineering', title: 'Check boats before they race.', summary: 'Track insurance, licences, briefings and equipment checks; powerboat entries also have class-specific scrutineering. Outstanding checks remain visible to the race team.', demo: 'Show: open Readiness for sailing, then switch to powerboats.', scene: 'office' },
    { icon: Trophy, label: 'Race results & scoring', title: 'Record finishes and apply scoring.', summary: 'Enter elapsed times, penalties, laps and finish status. Sailing can score by IRC or elapsed time; powerboat races can use lap-based scoring. Review before publishing.', demo: 'Show: open Results, choose a race, and inspect a result entry.', scene: 'results' },
    { icon: Bell, label: 'Notices, protests & incidents', title: 'Coordinate decisions and safety.', summary: 'Publish competitor notices, log and manage incidents, and track protests through hearings and decisions. Sensitive operational details stay in the race office.', demo: 'Show: open the Race office tabs for Notices, Incidents and Protests.', scene: 'office' },
    { icon: Compass, label: 'Courses & marks', title: 'Put the organiser’s course on the chart.', summary: 'Build a course from waypoints or import GeoJSON, reorder marks and save organiser geometry. Use the map preview to check the route before publishing it to spectators.', demo: 'Show: open Public experience → Courses and edit a waypoint.', scene: 'course' },
    { icon: Radio, label: 'GPS & provider feeds', title: 'Bring in tracking when authorised.', summary: 'Import recorded GPS by CSV or GPX, or synchronise normalised tracking and weather feeds from approved HTTPS endpoints. Provider tokens stay server-side; live feeds are not connected until configured.', demo: 'Show: open GPS & feeds, check status, and review the import formats.', scene: 'replay' },
    { icon: Layers3, label: 'Series & discards', title: 'Score the whole regatta.', summary: 'Select the races in a series, set minimum races and discards, apply points overrides, and publish class standings. The scoring view handles dead heats and series tie breaks.', demo: 'Show: open Series, select races, and review discard settings.', scene: 'results' },
    { icon: Video, label: 'Media, sponsors & race moments', title: 'Build the public race story.', summary: 'Add authorised videos, photos, reports and commentary; place sponsors across the viewer; and publish start, rounding, incident or finish moments to the timeline.', demo: 'Show: open Broadcast & stories, Sponsors, then Race events.', scene: 'publish' },
    { icon: MapPin, label: 'Conditions & viewpoints', title: 'Add useful context for spectators.', summary: 'Record wind, tide and source details, then add shoreline viewpoints with coordinates and visitor information. Published conditions and places appear in the public experience.', demo: 'Show: open Conditions and Viewpoints in Public experience controls.', scene: 'shore' },
    { icon: ShieldCheck, label: 'Publication & privacy', title: 'Choose what the public can see.', summary: 'Publish races, notices, results, series and media when ready; control boat sharing individually. Private contacts, crew records, readiness checks and internal safety information are excluded from the public feed.', demo: 'Show: check a boat’s public-sharing setting, then preview the spectator site.', scene: 'publish' },
    { icon: Anchor, label: 'Harbour, exports & activity', title: 'Close the loop around race day.', summary: 'Manage berth allocations and shore operations, review recent changes, and export event data in supported formats for reporting or handover.', demo: 'Show: open Harbour & shore, then Data & activity and its export tools.', scene: 'office' },
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
      <section className="feature-tour-dialog" role="dialog" aria-modal="true" aria-labelledby="feature-tour-title" aria-describedby="feature-tour-summary feature-tour-demo-action" data-audience={audience}>
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
            <p id="feature-tour-summary">{current.summary}</p>\n            <p className="feature-tour-demo-label">IN THE APP</p><p id="feature-tour-demo-action" className="feature-tour-demo">{current.demo}</p>
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
