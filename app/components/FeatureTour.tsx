'use client';

import { useEffect, useRef, useState } from 'react';
import { Anchor, ArrowLeft, ArrowRight, Bell, CalendarDays, Compass, Download, Flag, Layers3, MapPin, Pause, Play, Radio, ShieldCheck, Ship, Sparkles, Trophy, Users, Video, X } from 'lucide-react';

type Audience = 'spectator' | 'organiser';
const tours = {
  spectator: [
    { icon: Flag, label: 'Sailing', menu: 'spectator-sailing', menuName: 'Sailing', title: 'Begin with the sailing fleet.', summary: 'Start in the sailing view. The race centre brings the selected class, Solent chart, course, conditions and current data source together before you follow a boat.', demo: 'Show: start in Sailing, then open the Live race centre.', scene: 'map' },
    { icon: Compass, label: 'Sailing race centre', menu: 'live', menuName: 'Live', title: 'Follow the sailing race from one place.', summary: 'Choose a class and race, follow boats on the chart, inspect course marks and map layers, open public boat profiles, save favourites, and use the replay clock and provisional leaderboard. Venue screen makes the race easier to share on a big display.', demo: 'Show: choose a sailing class and race, then point out the map, boat list, replay and leaderboard.', scene: 'map' },
    { icon: Compass, label: 'Sailing analysis', menu: 'analysis', menuName: 'Analysis', title: 'Compare sailing performance.', summary: 'Compare boat speed, VMG, course progress and estimated manoeuvres. Switch between the on-water order and projected corrected order; the projection is explanatory and is not an official result.', demo: 'Show: compare two boats and switch the ranking basis.', scene: 'replay' },
    { icon: CalendarDays, label: 'Sailing programme', menu: 'programme', menuName: 'Programme', title: 'See the next sailing start.', summary: 'Browse class starts, race times and status, then move from the programme into the race view. The organiser controls official changes and notices.', demo: 'Show: choose a class and open its scheduled race.', scene: 'schedule' },
    { icon: Trophy, label: 'Sailing results', menu: 'results', menuName: 'Results', title: 'Follow finishes and series standings.', summary: 'Review finish records, IRC corrected times and class standings. Series points, discards and tie breaks follow the configured scoring; only organiser-published results are official.', demo: 'Show: select a sailing race, then review its result and series table.', scene: 'results' },
    { icon: Anchor, label: 'Sailing from shore', menu: 'shore', menuName: 'Shore', title: 'Find a place to watch ashore.', summary: 'Explore published Isle of Wight viewpoints and nearby racing. Location sharing is optional; when enabled, the app can compare your position with viewing points and races.', demo: 'Show: open a viewpoint and the nearby-racing information.', scene: 'shore' },
    { icon: Video, label: 'Sailing stories', menu: 'stories', menuName: 'Stories', title: 'See the coverage around the race.', summary: 'Browse event photographs, reports, commentary, video and sponsor placements. Available coverage depends on what the event team has published.', demo: 'Show: open a story or coverage item; point out the accessible viewer and export links.', scene: 'publish' },
    { icon: Ship, label: 'Powerboats', menu: 'spectator-powerboat', menuName: 'Powerboats', title: 'Now switch to powerboat racing.', summary: 'Change disciplines to the Powerboat Festival. The same race centre, programme, analysis, results and shore tools now follow powerboat classes and race formats.', demo: 'Show: select Powerboats, then follow the same menu sequence for the fleet.', scene: 'power' },
    { icon: Compass, label: 'Powerboat race centre', menu: 'live', menuName: 'Live', title: 'Follow the powerboat fleet.', summary: 'Choose a powerboat class and race, follow positions on the Solent chart, inspect course marks and map layers, and use replay and the provisional leaderboard. Demonstration positions remain labelled until an approved live feed is connected.', demo: 'Show: choose a powerboat class and race, then point out the map, replay and leaderboard.', scene: 'power' },
    { icon: Compass, label: 'Powerboat analysis', menu: 'analysis', menuName: 'Analysis', title: 'Compare powerboat race progress.', summary: 'Review boat speed, course progress and position changes. The analysis explains the developing race; it does not replace official timing or published results.', demo: 'Show: compare powerboat positions and review the race progress.', scene: 'replay' },
    { icon: CalendarDays, label: 'Powerboat programme', menu: 'programme', menuName: 'Programme', title: 'See the next powerboat start.', summary: 'Browse powerboat classes, start times and race status, then open the race centre for the selected event. Official updates remain under organiser control.', demo: 'Show: choose a powerboat class and open its scheduled race.', scene: 'schedule' },
    { icon: Trophy, label: 'Powerboat results', menu: 'results', menuName: 'Results', title: 'Review laps, finishes and standings.', summary: 'Follow powerboat finish records, lap counts and class standings. Only organiser-published results are official; sample results are labelled as demonstration data.', demo: 'Show: select a powerboat race, review its laps and open the series table.', scene: 'results' },
    { icon: Anchor, label: 'Powerboats from shore', menu: 'shore', menuName: 'Shore', title: 'Watch powerboat racing from shore.', summary: 'Explore published viewing points and nearby powerboat races around the Isle of Wight. Sharing device location is optional.', demo: 'Show: open a shoreline viewpoint and check which racing is nearby.', scene: 'shore' },
    { icon: Video, label: 'Powerboat stories', menu: 'stories', menuName: 'Stories', title: 'Finish with powerboat coverage.', summary: 'Browse published powerboat photographs, reports, video, commentary and sponsor content. Open the lightweight text view or supported export for a simpler way to follow the event.', demo: 'Show: open a coverage item and point out the text viewer and export options.', scene: 'publish' },
  ],
  organiser: [
    { icon: Flag, label: 'Cowes Week · Sailing', menu: 'organiser-sailing', menuName: 'Cowes Week sailing', title: 'Start with the sailing event.', summary: 'Select Cowes Week to set the working discipline to sailing. The organiser workspace keeps the programme, fleet, race office, public experience and data controls in one place.', demo: 'Show: select Cowes Week, then start at Race centre.', scene: 'map' },
    { icon: Compass, label: 'Sailing race centre', menu: 'live', menuName: 'Race centre', title: 'Review the sailing event at a glance.', summary: 'Start from the live race overview and current event status. Use it as the control-room home before moving through the programme, fleet, race decisions, public content and data feeds.', demo: 'Show: open Race centre and review its status and event controls.', scene: 'map' },
    { icon: CalendarDays, label: 'Sailing programme', menu: 'schedule', menuName: 'Race programme', title: 'Set the order of sailing.', summary: 'Create and update sailing starts, assign classes and scoring, and manage scheduled, postponed, racing or finished status.', demo: 'Show: open a sailing race or inspect how a start is configured.', scene: 'schedule' },
    { icon: Users, label: 'Sailing boats & crew', menu: 'fleet', menuName: 'Boats & crew', title: 'Check sailing entries and crew.', summary: 'Manage boat names, numbers, classes, ratings and public profile details. Keep crew and emergency contacts in the protected organiser workspace.', demo: 'Show: find a sailing entry and review its editable fields and sharing setting.', scene: 'fleet' },
    { icon: ShieldCheck, label: 'Sailing race office', menu: 'office', menuName: 'Race office', title: 'Run sailing results and race decisions.', summary: 'Use the race office for finish times, penalties and scoring, then check readiness, notices, incidents and protests. Sensitive operational details stay inside the race office.', demo: 'Show: visit Results, Readiness, Notices, Incidents and Protests in sequence.', scene: 'office' },
    { icon: Anchor, label: 'Sailing harbour & shore', menu: 'harbour', menuName: 'Harbour & shore', title: 'Coordinate sailing on the water and ashore.', summary: 'Manage berth allocations and shoreline information for the sailing event, keeping race operations connected to the harbour.', demo: 'Show: review berth allocations and published viewing information.', scene: 'shore' },
    { icon: Video, label: 'Sailing public experience', menu: 'studio', menuName: 'Public experience', title: 'Prepare the sailing story for spectators.', summary: 'Manage sailing courses and marks, race moments, media, sponsors, conditions, viewpoints and publication settings. Preview what spectators will see before publishing.', demo: 'Show: review the course, coverage, sponsor placement and public preview.', scene: 'publish' },
    { icon: Radio, label: 'Sailing data & activity', menu: 'data', menuName: 'Data & activity', title: 'Connect and review sailing data.', summary: 'Check GPS imports and approved provider feeds, then review exports and activity records. Live feeds remain disconnected until the organiser configures them.', demo: 'Show: check feed status, review CSV or GPX import options, and open the activity log.', scene: 'layers' },
    { icon: Ship, label: 'Powerboat Festival', menu: 'organiser-powerboat', menuName: 'Powerboat Festival', title: 'Switch the race office to powerboats.', summary: 'Change to the Powerboat Festival before continuing. The same organiser menu sequence now applies to powerboat entries, starts, lap scoring and published coverage.', demo: 'Show: select Powerboat Festival, then repeat the organiser menu sequence.', scene: 'power' },
    { icon: Compass, label: 'Powerboat race centre', menu: 'live', menuName: 'Race centre', title: 'Review the powerboat event at a glance.', summary: 'Use Race centre to check the powerboat event overview and current status before moving through starts, entries, race decisions, public content and data feeds.', demo: 'Show: open Race centre for the Powerboat Festival.', scene: 'power' },
    { icon: CalendarDays, label: 'Powerboat programme', menu: 'schedule', menuName: 'Race programme', title: 'Set the powerboat race programme.', summary: 'Create and update powerboat starts, assign classes and scoring, and manage scheduled, postponed, racing or finished status.', demo: 'Show: inspect a powerboat start and its race status.', scene: 'schedule' },
    { icon: Users, label: 'Powerboat boats & crew', menu: 'fleet', menuName: 'Boats & crew', title: 'Check powerboat entries and crew.', summary: 'Manage powerboat race numbers, classes, driver and public profile information. Keep crew and emergency contacts protected in the organiser workspace.', demo: 'Show: open a powerboat entry and review its editable fields.', scene: 'fleet' },
    { icon: ShieldCheck, label: 'Powerboat race office', menu: 'office', menuName: 'Race office', title: 'Run powerboat readiness and lap scoring.', summary: 'Review class-specific scrutineering and readiness, enter lap counts and finish records, and manage notices, incidents and protests in the race office.', demo: 'Show: inspect Readiness, then Results and the race office decision tabs.', scene: 'office' },
    { icon: Anchor, label: 'Powerboat harbour & shore', menu: 'harbour', menuName: 'Harbour & shore', title: 'Coordinate powerboats around the harbour.', summary: 'Review berth allocations and shore information that support the Powerboat Festival and its spectators.', demo: 'Show: review the harbour plan and published viewing information.', scene: 'shore' },
    { icon: Video, label: 'Powerboat public experience', menu: 'studio', menuName: 'Public experience', title: 'Prepare powerboat coverage for spectators.', summary: 'Manage powerboat courses and marks, media, sponsor placements, race moments, conditions, viewpoints and publication settings. Preview the public view before release.', demo: 'Show: review a course, coverage and the public preview.', scene: 'publish' },
    { icon: Radio, label: 'Powerboat data & activity', menu: 'data', menuName: 'Data & activity', title: 'Connect and review powerboat data.', summary: 'Check GPS imports and approved tracking feeds, then review data exports and activity records. Provider access must be configured by the organiser.', demo: 'Show: review feed status, import options and recent activity.', scene: 'layers' },
  ],
} as const;

export default function FeatureTour({ audience }: { audience: Audience }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [visited, setVisited] = useState(false);
  const [targetFound, setTargetFound] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [scrollPhase, setScrollPhase] = useState<'opening' | 'down' | 'up' | 'done'>('opening');
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
    setScrollPhase('opening');
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
    let cancelled = false;
    let frame = 0;
    let startTimer = 0;
    let finishTimer = 0;
    let resolveStage: (() => void) | null = null;
    const documentRoot = document.scrollingElement as HTMLElement | null;
    const nestedScroller = Array.from(document.querySelectorAll<HTMLElement>('main, .main-shell, .viewer-main')).find(element => {
      const overflow = window.getComputedStyle(element).overflowY;
      return element.scrollHeight - element.clientHeight > 120 && (overflow === 'auto' || overflow === 'scroll');
    }) ?? null;
    const scroller = nestedScroller ?? documentRoot;
    const isDocument = !nestedScroller;

    const readTop = () => isDocument ? window.scrollY : scroller?.scrollTop ?? 0;
    const writeTop = (top: number) => {
      if (isDocument) window.scrollTo(0, top);
      else if (scroller) scroller.scrollTop = top;
    };
    const animateScroll = (from: number, to: number, duration: number) => new Promise<void>(resolve => {
      const started = performance.now();
      resolveStage = resolve;
      const tick = (now: number) => {
        if (cancelled) { resolve(); return; }
        const progress = Math.min(1, (now - started) / duration);
        const eased = progress < .5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        writeTop(from + (to - from) * eased);
        if (progress < 1) frame = window.requestAnimationFrame(tick);
        else { resolveStage = null; resolve(); }
      };
      frame = window.requestAnimationFrame(tick);
    });

    startTimer = window.setTimeout(async () => {
      if (cancelled) return;
      const maxTop = Math.max(0, (scroller?.scrollHeight ?? document.documentElement.scrollHeight) - (scroller?.clientHeight ?? window.innerHeight));
      setScrollPhase('down');
      const top = readTop();
      await animateScroll(top, maxTop, maxTop > 80 ? 4200 : 1100);
      if (cancelled) return;
      setScrollPhase('up');
      await animateScroll(readTop(), 0, maxTop > 80 ? 4200 : 1100);
      if (cancelled) return;
      setScrollPhase('done');
      finishTimer = window.setTimeout(() => {
        if (step === slides.length - 1) {
          setOpen(false);
          setAutoPlay(false);
        } else {
          setStep(n => n + 1);
          setVisited(false);
          setTargetFound(true);
          setScrollPhase('opening');
        }
      }, 600);
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(startTimer);
      window.clearTimeout(finishTimer);
      if (frame) window.cancelAnimationFrame(frame);
      resolveStage?.();
    };
  }, [open, autoPlay, visited, step, slides.length]);

  useEffect(() => {
    if (open) wasOpen.current = true;
    else if (wasOpen.current) { trigger.current?.focus(); wasOpen.current = false; }
  }, [open]);

  const closeTour = () => { setOpen(false); setAutoPlay(false); };

  return <>
    <button ref={trigger} className="feature-tour-trigger" type="button" onClick={() => { setStep(0); setVisited(false); setTargetFound(true); setScrollPhase('opening'); setAutoPlay(true); setOpen(true); }} aria-haspopup="dialog">
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
      <p className="feature-tour-guided-status">{!autoPlay ? 'Paused · use Play or Next scene to continue' : !visited ? 'Opening the selected screen…' : scrollPhase === 'down' ? 'Slowly scrolling down this screen…' : scrollPhase === 'up' ? 'Returning slowly to the top…' : scrollPhase === 'done' ? 'Scene complete · moving on…' : 'Preparing this screen…'}</p>
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
