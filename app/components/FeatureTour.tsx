'use client';

import { useEffect, useRef, useState } from 'react';
import { Anchor, ArrowLeft, ArrowRight, Bell, CalendarDays, Compass, Download, Flag, Layers3, MapPin, Play, Radio, ShieldCheck, Ship, Sparkles, Trophy, Users, Video, X } from 'lucide-react';

type Audience = 'spectator' | 'organiser';
const tours = {
  spectator: [
    { icon: Compass, label: 'Race centre', menu: 'live', menuName: 'Live', title: 'Start with the race in progress.', summary: 'Choose sailing or powerboat racing, select a class and race, and see the fleet, conditions and current data status together. Positions are demonstrations until an approved live feed is connected.', demo: 'Show: switch disciplines, then select a race from the class menu.', scene: 'map' },
    { icon: Layers3, label: 'Map & course', menu: 'live', menuName: 'Live', title: 'Read the course and the water.', summary: 'Zoom and pan the Solent chart, inspect course marks, and change map layers. Wind, tide, seamarks, laylines, satellite and perspective views add context; course and layline details are illustrative unless supplied by the organiser.', demo: 'Show: change the map layer, zoom to Cowes, and inspect a mark.', scene: 'layers' },
    { icon: Users, label: 'Boat profiles', menu: 'live', menuName: 'Live', title: 'Find a boat and follow it.', summary: 'Search across the fleet, filter by class, select a boat for its public profile, and save favourites on your device. Profiles show the public boat and skipper details the organiser has chosen to share.', demo: 'Show: search for a boat, open its profile, and add it to favourites.', scene: 'map' },
    { icon: Play, label: 'Replay', menu: 'live', menuName: 'Live', title: 'Move through the race together.', summary: 'Use the shared race clock to play, pause and scrub the fleet replay. Recorded reports can show trails and race moments; simulated movement is labelled and should not be mistaken for official GPS.', demo: 'Show: pause the replay, drag the timeline, then resume at another speed.', scene: 'replay' },
    { icon: Compass, label: 'Race analysis', menu: 'analysis', menuName: 'Analysis', title: 'Compare how boats are sailing.', summary: 'Compare selected boats using speed, VMG, course progress and estimated manoeuvres. Switch between on-water order and projected corrected order; estimates explain the race but do not replace the official result.', demo: 'Show: open Analysis, choose a comparison boat, and switch ranking basis.', scene: 'replay' },
    { icon: Trophy, label: 'Live leaderboard', menu: 'live', menuName: 'Live', title: 'See the provisional order.', summary: 'Follow class positions and gaps as the race model updates. The app separates on-water progress from estimated corrected order so spectators can see what is known and what remains provisional.', demo: 'Show: open the live leaderboard and compare water order with projected order.', scene: 'results' },
    { icon: Trophy, label: 'Results & series', menu: 'results', menuName: 'Results', title: 'Follow finishes through the regatta.', summary: 'Review finish records, IRC corrected times, powerboat laps and series standings. Discards, points overrides and tie breaks follow the configured scoring; only organiser-published results are official. Demo results are labelled.', demo: 'Show: open Results, choose a race, then review the series table.', scene: 'results' },
    { icon: CalendarDays, label: 'Programme', menu: 'programme', menuName: 'Programme', title: 'Know what is racing next.', summary: 'Browse the race programme, class starts and race status, and move from the next start into its race view. Official changes and notices remain under the organiser’s control.', demo: 'Show: open Programme and choose a class or race.', scene: 'schedule' },
    { icon: Anchor, label: 'Shore & nearby racing', menu: 'shore', menuName: 'Shore', title: 'Watch from the Isle of Wight.', summary: 'Explore published shoreline viewpoints and see which races are nearby. If you choose to share device location, the app can compare it with races and viewing points; location access is optional.', demo: 'Show: open Shore, pick a viewpoint, or try “near me” if you want.', scene: 'shore' },
    { icon: Video, label: 'Stories & coverage', menu: 'stories', menuName: 'Stories', title: 'Bring the race beyond the map.', summary: 'See organiser-published photographs, reports, commentary and video, alongside sponsor placements. Video and external links appear when the event team adds authorised coverage.', demo: 'Show: open Stories and play or open an available item.', scene: 'publish' },
    { icon: Flag, label: 'Venue screen', menu: 'live', menuName: 'Live', title: 'Put the race on a big screen.', summary: 'Use the venue display for a clearer, larger race view and optional rotation through the programme. It is designed for clubhouses, marinas and public event spaces.', demo: 'Show: turn on Venue screen from the header and review its controls.', scene: 'map' },
    { icon: Download, label: 'Data & accessible viewing', menu: 'stories', menuName: 'Stories', title: 'Keep the race useful and portable.', summary: 'Download race data in supported formats and open the lightweight text viewer when you need a simpler page. The viewer keeps demonstration and data-source status visible.', demo: 'Show: use a footer export link, then open Basic viewer.', scene: 'layers' },
  ],
  organiser: [
    { icon: CalendarDays, label: 'Race programme', menu: 'schedule', menuName: 'Race programme', title: 'Build the day’s racing plan.', summary: 'Create and update starts for sailing and powerboats, assign classes and scoring, and manage scheduled, postponed, racing or finished status.', demo: 'Show: open Race programme and edit a race or add a start.', scene: 'schedule' },
    { icon: Users, label: 'Boats & crew', menu: 'fleet', menuName: 'Boats & crew', title: 'Keep entries in one fleet record.', summary: 'Register boats, numbers, classes, ratings and public profile details. Crew and emergency contacts stay in the protected organiser workspace.', demo: 'Show: open Boats & crew, find an entry, and preview its editable fields.', scene: 'fleet' },
    { icon: ShieldCheck, label: 'Readiness & scrutineering', menu: 'office', menuName: 'Race office', title: 'Check boats before they race.', summary: 'Track insurance, licences, briefings and equipment checks; powerboat entries also have class-specific scrutineering. Outstanding checks remain visible to the race team.', demo: 'Show: open Readiness for sailing, then switch to powerboats.', scene: 'office' },
    { icon: Trophy, label: 'Race results & scoring', menu: 'office', menuName: 'Race office', title: 'Record finishes and apply scoring.', summary: 'Enter elapsed times, penalties, laps and finish status. Sailing can score by IRC or elapsed time; powerboat races can use lap-based scoring. Review before publishing.', demo: 'Show: open Results, choose a race, and inspect a result entry.', scene: 'results' },
    { icon: Bell, label: 'Notices, protests & incidents', menu: 'office', menuName: 'Race office', title: 'Coordinate decisions and safety.', summary: 'Publish competitor notices, log and manage incidents, and track protests through hearings and decisions. Sensitive operational details stay in the race office.', demo: 'Show: open the Race office tabs for Notices, Incidents and Protests.', scene: 'office' },
    { icon: Compass, label: 'Courses & marks', menu: 'studio', menuName: 'Public experience', title: 'Put the organiser’s course on the chart.', summary: 'Build a course from waypoints or import GeoJSON, reorder marks and save organiser geometry. Use the map preview to check the route before publishing it to spectators.', demo: 'Show: open Public experience → Courses and edit a waypoint.', scene: 'course' },
    { icon: Radio, label: 'GPS & provider feeds', menu: 'data', menuName: 'Data & activity', title: 'Bring in tracking when authorised.', summary: 'Import recorded GPS by CSV or GPX, or synchronise normalised tracking and weather feeds from approved HTTPS endpoints. Provider tokens stay server-side; live feeds are not connected until configured.', demo: 'Show: open GPS & feeds, check status, and review the import formats.', scene: 'replay' },
    { icon: Layers3, label: 'Series & discards', menu: 'office', menuName: 'Race office', title: 'Score the whole regatta.', summary: 'Select the races in a series, set minimum races and discards, apply points overrides, and publish class standings. The scoring view handles dead heats and series tie breaks.', demo: 'Show: open Series, select races, and review discard settings.', scene: 'results' },
    { icon: Video, label: 'Media, sponsors & race moments', menu: 'studio', menuName: 'Public experience', title: 'Build the public race story.', summary: 'Add authorised videos, photos, reports and commentary; place sponsors across the viewer; and publish start, rounding, incident or finish moments to the timeline.', demo: 'Show: open Broadcast & stories, Sponsors, then Race events.', scene: 'publish' },
    { icon: MapPin, label: 'Conditions & viewpoints', menu: 'studio', menuName: 'Public experience', title: 'Add useful context for spectators.', summary: 'Record wind, tide and source details, then add shoreline viewpoints with coordinates and visitor information. Published conditions and places appear in the public experience.', demo: 'Show: open Conditions and Viewpoints in Public experience controls.', scene: 'shore' },
    { icon: ShieldCheck, label: 'Publication & privacy', menu: 'studio', menuName: 'Public experience', title: 'Choose what the public can see.', summary: 'Publish races, notices, results, series and media when ready; control boat sharing individually. Private contacts, crew records, readiness checks and internal safety information are excluded from the public feed.', demo: 'Show: check a boat’s public-sharing setting, then preview the spectator site.', scene: 'publish' },
    { icon: Anchor, label: 'Harbour, exports & activity', menu: 'harbour', menuName: 'Harbour & shore', title: 'Close the loop around race day.', summary: 'Manage berth allocations and shore operations, review recent changes, and export event data in supported formats for reporting or handover.', demo: 'Show: open Harbour & shore, then Data & activity and its export tools.', scene: 'office' },
  ],
} as const;

export default function FeatureTour({ audience }: { audience: Audience }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [visited, setVisited] = useState(false);
  const [targetFound, setTargetFound] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const trigger = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const slides = tours[audience];
  const current = slides[step];
  const Icon = current.icon;

  const advance = () => {
    if (step === slides.length - 1) {
      setOpen(false);
      setAutoPlay(false);
      return;
    }
    setStep(n => n + 1);
    setVisited(false);
    setTargetFound(true);
  };

  useEffect(() => {
    if (!open) return;
    const candidates = Array.from(document.querySelectorAll<HTMLElement>('[data-tour-menu="' + current.menu + '"]'));
    const target = candidates.find(item => item.getClientRects().length > 0) ?? candidates[0];
    setTargetFound(Boolean(target));
    if (target && !visited) {
      target.classList.add('feature-tour-highlight');
      target.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    }
    const onMenuClick = (event: MouseEvent) => {
      if (target && event.target instanceof Node && target.contains(event.target)) setVisited(true);
    };
    if (target) target.addEventListener('click', onMenuClick, true);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); setAutoPlay(false); }
      if (event.key === 'ArrowRight') advance();
      if (event.key === 'ArrowLeft') {
        setStep(n => Math.max(n - 1, 0));
        setVisited(false);
        setTargetFound(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      target?.classList.remove('feature-tour-highlight');
      if (target) target.removeEventListener('click', onMenuClick, true);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, step, visited, current.menu]);

  useEffect(() => {
    if (!open || !autoPlay || visited) return;
    const timer = window.setTimeout(() => {
      const candidates = Array.from(document.querySelectorAll<HTMLElement>('[data-tour-menu="' + current.menu + '"]'));
      const target = candidates.find(item => item.getClientRects().length > 0) ?? candidates[0];
      if (target) target.click();
      else setVisited(true);
    }, 900);
    return () => window.clearTimeout(timer);
  }, [open, autoPlay, visited, step, current.menu]);

  useEffect(() => {
    if (!open || !autoPlay || !visited) return;
    const timer = window.setTimeout(() => {
      if (step === slides.length - 1) {
        setOpen(false);
        setAutoPlay(false);
      } else {
        setStep(n => n + 1);
        setVisited(false);
        setTargetFound(true);
      }
    }, 5600);
    return () => window.clearTimeout(timer);
  }, [open, autoPlay, visited, step, slides.length]);

  useEffect(() => {
    if (open) wasOpen.current = true;
    else if (wasOpen.current) { trigger.current?.focus(); wasOpen.current = false; }
  }, [open]);

  const closeTour = () => { setOpen(false); setAutoPlay(false); };

  return <>
    <button ref={trigger} className="feature-tour-trigger" type="button" onClick={() => { setStep(0); setVisited(false); setTargetFound(true); setAutoPlay(true); setOpen(true); }} aria-haspopup="dialog">
      <Sparkles size={14} aria-hidden="true"/><span>Take a quick tour</span>
    </button>
    {open && <section className="feature-tour-guided" role="dialog" aria-label={audience === 'spectator' ? 'Spectator storyboard demo' : 'Organiser storyboard demo'} aria-live="polite">
      <button className="feature-tour-guided-close" type="button" onClick={closeTour} aria-label="Close demo"><X size={17}/></button>
      <p className="feature-tour-guided-eyebrow"><span/> STORYBOARD DEMO <i>•</i> {audience === 'spectator' ? 'SPECTATOR' : 'RACE OFFICE'} <i>•</i> FRAME {String(step + 1).padStart(2, '0')} OF {String(slides.length).padStart(2, '0')}</p>
      <div className="feature-tour-storyboard" data-audience={audience} data-scene={current.scene} aria-hidden="true">
        <div className="feature-tour-storyboard-frame"><span>FRAME {String(step + 1).padStart(2, '0')}</span><span>{audience === 'spectator' ? 'COWES WEEK LIVE' : 'RACE DAY WORKSPACE'}</span></div>
        <svg className="feature-tour-storyboard-route" viewBox="0 0 420 100" preserveAspectRatio="none">
          <path d="M12 78 C78 70 83 28 150 42 S230 84 277 42 S352 26 408 12"/>
          <circle cx="12" cy="78" r="4"/><circle cx="150" cy="42" r="4"/><circle cx="277" cy="42" r="4"/><circle cx="408" cy="12" r="4"/>
        </svg>
        <div className="feature-tour-storyboard-caption"><span><Icon size={16}/></span><div><small>STORY BEAT {String(step + 1).padStart(2, '0')}</small><strong>{current.label}</strong></div></div>
        <div className="feature-tour-storyboard-counter">{String(step + 1).padStart(2, '0')}<i>/</i>{String(slides.length).padStart(2, '0')}</div>
      </div>
      <div className="feature-tour-guided-title">{current.title}</div>
      <p className="feature-tour-guided-summary">{current.summary}</p>
      {!visited
        ? <p className="feature-tour-guided-prompt">{targetFound ? autoPlay ? <>Opening the highlighted <strong>{current.menuName}</strong> menu automatically…</> : <>Click the highlighted <strong>{current.menuName}</strong> menu item to open it.</> : <>The <strong>{current.menuName}</strong> menu item is not available on this screen. You can continue to the next scene.</>}</p>
        : <p className="feature-tour-guided-demo">{current.demo}</p>}
      <p className="feature-tour-guided-status">{autoPlay ? 'Playing automatically · pauses briefly on each scene' : 'Paused · use Play or Next scene to continue'}</p>
      <div className="feature-tour-guided-footer">
        <button type="button" className="feature-tour-guided-close-text" onClick={closeTour}>End demo</button>
        <div className="feature-tour-guided-progress" aria-label={'Frame ' + (step + 1) + ' of ' + slides.length}>{String(step + 1).padStart(2, '0')} <span>/</span> {String(slides.length).padStart(2, '0')}</div>
        <div className="feature-tour-guided-controls">
          <button type="button" className="feature-tour-guided-toggle" onClick={() => setAutoPlay(value => !value)} aria-label={autoPlay ? 'Pause storyboard' : 'Resume storyboard'}>{autoPlay ? <Pause size={14}/> : <Play size={14}/>}</button>
          <button type="button" className="feature-tour-guided-next" onClick={advance} disabled={!visited && targetFound}>{step === slides.length - 1 ? 'Finish demo' : 'Next scene'} <ArrowRight size={15}/></button>
        </div>
      </div>
    </section>}
  </>;
}
