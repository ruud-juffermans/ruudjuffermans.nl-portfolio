"use client";

import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent,
  type TouchEvent,
} from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import styles from "./ServicesShowcase.module.css";

const CYCLE = "5s";

// How long each slide stays up while the slideshow plays: two full cycles of
// the flow diagram.
const SLIDE_MS = 10000;

export interface FlowData {
  sources: [string, string, string];
  hub: { label: string; title: string };
  outputs: [{ label: string; title: string }, { label: string; title: string }];
}

export interface ServiceItem {
  key: string;
  /** Short discipline name, the accessible name of the slide's square. */
  label: string;
  /** The slide's heading and intro copy. */
  title: string;
  subtitle: string;
  /** Screen-reader name for the slide, e.g. "1 of 2: Data engineering". */
  slideLabel: string;
  /** The slide's CTA: label and where it goes (the discipline's own page). */
  learnMore: string;
  href: ComponentProps<typeof Link>["href"];
  /** The slide's visual: a living flow diagram, or a diagram image. */
  visual: { flow: FlowData } | { image: DiagramImage };
}

export interface DiagramImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

// Pulse travelling along a wire during the first leg of the cycle
// (sources → hub).
function PulseIn({ wireId }: { wireId: string }) {
  return (
    <circle className={styles.flowPulse} r="4" opacity="0">
      <animateMotion
        dur={CYCLE}
        repeatCount="indefinite"
        calcMode="linear"
        keyPoints="0;1;1"
        keyTimes="0;0.24;1"
      >
        <mpath href={`#${wireId}`} />
      </animateMotion>
      <animate
        attributeName="opacity"
        dur={CYCLE}
        repeatCount="indefinite"
        values="0;1;1;0;0"
        keyTimes="0;0.01;0.22;0.25;1"
      />
    </circle>
  );
}

// Pulse travelling during the second leg (hub → both outputs).
function PulseOut({ wireId }: { wireId: string }) {
  return (
    <circle className={styles.flowPulse} r="4" opacity="0">
      <animateMotion
        dur={CYCLE}
        repeatCount="indefinite"
        calcMode="linear"
        keyPoints="0;0;1;1"
        keyTimes="0;0.48;0.72;1"
      >
        <mpath href={`#${wireId}`} />
      </animateMotion>
      <animate
        attributeName="opacity"
        dur={CYCLE}
        repeatCount="indefinite"
        values="0;0;1;1;0;0"
        keyTimes="0;0.48;0.49;0.7;0.73;1"
      />
    </circle>
  );
}

const WIRES_IN = [
  { suffix: "w1", d: "M140 57 C170 57 172 140 200 140" },
  { suffix: "w2", d: "M140 170 C170 170 172 170 200 170" },
  { suffix: "w3", d: "M140 283 C170 283 172 200 200 200" },
];

// One hub port fans out to two destinations: the 1-to-2 split.
const WIRES_OUT = [
  { suffix: "w4", d: "M360 170 C386 170 388 100 415 100" },
  { suffix: "w5", d: "M360 170 C386 170 388 240 415 240" },
];

const SRC_Y = [30, 143, 256];

function FlowDiagram({ flow, idPrefix }: { flow: FlowData; idPrefix: string }) {
  const wireId = (suffix: string) => `${idPrefix}-${suffix}`;
  return (
    <div className={styles.flowVisual} aria-hidden="true">
      <svg viewBox="0 0 560 340" role="img">
        {[...WIRES_IN, ...WIRES_OUT].map((w) => (
          <path key={w.suffix} id={wireId(w.suffix)} className={styles.flowWire} d={w.d} />
        ))}

        {WIRES_IN.map((w) => (
          <path
            key={`${w.suffix}-lit`}
            className={`${styles.flowWireLit} ${styles.flowIn}`}
            pathLength={1}
            d={w.d}
          />
        ))}
        {WIRES_OUT.map((w) => (
          <path
            key={`${w.suffix}-lit`}
            className={`${styles.flowWireLit} ${styles.flowOut}`}
            pathLength={1}
            d={w.d}
          />
        ))}

        {flow.sources.map((title, i) => (
          <g className={styles.flowNode} key={title}>
            <rect x="10" y={SRC_Y[i]} width="130" height="54" rx="10" />
            <text className={styles.flowTitle} x="75" y={SRC_Y[i] + 32} textAnchor="middle">
              {title}
            </text>
            <circle className={styles.flowPort} cx="140" cy={SRC_Y[i] + 27} r="3.5" />
          </g>
        ))}

        <g className={`${styles.flowNode} ${styles.flowNodeMid}`}>
          <rect x="200" y="122" width="160" height="96" rx="12" />
          <text className={styles.flowLabel} x="280" y="160" textAnchor="middle">
            {flow.hub.label}
          </text>
          <text
            className={`${styles.flowTitle} ${styles.flowTitleLg}`}
            x="280"
            y="184"
            textAnchor="middle"
          >
            {flow.hub.title}
          </text>
          <circle className={styles.flowPort} cx="200" cy="140" r="3.5" />
          <circle className={styles.flowPort} cx="200" cy="170" r="3.5" />
          <circle className={styles.flowPort} cx="200" cy="200" r="3.5" />
          <circle className={styles.flowPort} cx="360" cy="170" r="3.5" />
        </g>

        {flow.outputs.map((out, i) => (
          <g className={`${styles.flowNode} ${styles.flowNodeOut}`} key={out.title}>
            <rect x="415" y={i === 0 ? 71 : 211} width="135" height="58" rx="10" />
            <text className={styles.flowLabel} x="482" y={i === 0 ? 94 : 234} textAnchor="middle">
              {out.label}
            </text>
            <text className={styles.flowTitle} x="482" y={i === 0 ? 114 : 254} textAnchor="middle">
              {out.title}
            </text>
            <circle className={styles.flowPort} cx="415" cy={i === 0 ? 100 : 240} r="3.5" />
          </g>
        ))}

        {WIRES_IN.map((w) => (
          <PulseIn key={`${w.suffix}-pulse`} wireId={wireId(w.suffix)} />
        ))}
        {WIRES_OUT.map((w) => (
          <PulseOut key={`${w.suffix}-pulse`} wireId={wireId(w.suffix)} />
        ))}
      </svg>
    </div>
  );
}

// A line of copy split into words, each sitting in an overflow-hidden mask.
// The slide's state (see the CSS) slides every word up into its mask or back
// down out of it, staggered by the word's index.
function MaskedWords({ text }: { text: string }) {
  const words = text.split(" ");
  return words.map((word, i) => (
    <Fragment key={i}>
      <span className={styles.mask}>
        <span className={styles.word} style={{ "--i": i } as CSSProperties}>
          {word}
        </span>
      </span>
      {i < words.length - 1 ? " " : null}
    </Fragment>
  ));
}

// "What I do" as a two-slide slideshow: each slide pairs its own heading and
// intro (left) with its diagram (right). The slides don't move: they sit
// stacked in one grid cell, and changing slides drops the outgoing copy word
// by word out of its masks, then raises the incoming copy into place. A flow
// diagram fades in alongside; a diagram image is a large tilted "stage" that
// rises late from below and comes to rest still running off the section's
// bottom edge. The inactive slide stays in the DOM but inert.
//
// The slideshow advances on its own while it is on screen; the squares in
// the top corner jump to a slide and restart the timer. The timer is a CSS
// animation on the active square: its end moves to the next slide, so
// pausing the animation (hovering the slides, keyboard focus inside,
// scrolling away) pauses the slideshow too. Reduced motion turns autoplay
// off; the squares still switch slides.
export default function ServicesShowcase({
  eyebrow,
  services,
}: {
  eyebrow: string;
  services: ServiceItem[];
}) {
  const count = services.length;
  const [active, setActive] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [inView, setInView] = useState(false);
  // The first slide's copy waits below its masks until the section is first
  // scrolled into view. Until hydration it renders in place, so the copy
  // never ships hidden to a reader without JS.
  // Arming waits for the observer's first answer, so a section that loads
  // already on screen is never hidden for a frame and re-revealed.
  const [seen, setSeen] = useState(false);
  const [armed, setArmed] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setAutoplay(false);
    const el = rootRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setArmed(true);
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setSeen(true);
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (count === 0) return null;

  const wrap = (i: number) => ((i % count) + count) % count;
  const goTo = (i: number) => setActive(wrap(i));

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(active + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(active - 1);
    }
  };

  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    // A deliberate horizontal swipe; mostly-vertical drags stay page scrolls.
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      goTo(active + (dx < 0 ? 1 : -1));
    }
  };

  return (
    <section
      ref={rootRef}
      className={[styles.carousel, armed ? styles.armed : "", inView ? "" : styles.offscreen]
        .filter(Boolean)
        .join(" ")}
      aria-roledescription="carousel"
      aria-label={eyebrow}
      onKeyDown={onKeyDown}
    >
      <div className={styles.header}>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <div className={styles.controls}>
          {services.map((service, i) => (
            <button
              key={service.key}
              type="button"
              className={`${styles.square} ${i === active ? styles.squareActive : ""}`}
              aria-label={service.label}
              aria-current={i === active ? "true" : undefined}
              onClick={() => goTo(i)}
            >
              {i === active && autoplay && (
                <span
                  key={active}
                  className={styles.timer}
                  style={{ animationDuration: `${SLIDE_MS}ms` }}
                  onAnimationEnd={() => goTo(active + 1)}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.slides} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {services.map((service, i) => (
          <div
            key={service.key}
            className={[
              styles.slide,
              i === active ? styles.slideActive : "",
              i === active && seen ? styles.slideShown : "",
            ]
              .filter(Boolean)
              .join(" ")}
            role="group"
            aria-roledescription="slide"
            aria-label={service.slideLabel}
            inert={i !== active}
          >
            <div className={styles.layout}>
              <div>
                <h2 className={styles.title}>
                  <MaskedWords text={service.title} />
                </h2>
                <p className={styles.sub}>
                  <MaskedWords text={service.subtitle} />
                </p>
                <Link className={styles.cta} href={service.href}>
                  {service.learnMore} <span aria-hidden="true">→</span>
                </Link>
              </div>
              {"flow" in service.visual ? (
                <div className={styles.flowCol}>
                  <FlowDiagram flow={service.visual.flow} idPrefix={`svcflow-${service.key}`} />
                </div>
              ) : (
                <div className={styles.stageCol}>
                  <div className={styles.stage}>
                    {/* An SVG, served as is. */}
                    <Image
                      className={styles.diagramImage}
                      src={service.visual.image.src}
                      alt={service.visual.image.alt}
                      width={service.visual.image.width}
                      height={service.visual.image.height}
                      unoptimized
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
