import { TECH_LOGOS } from "./techLogos";
import styles from "./TechMarquee.module.css";

// Infinite logo marquee: the track holds the logo set twice and slides by
// -50%, so the loop point is invisible. Hover pauses the scroll.
export default function TechMarquee({ label }: { label: string }) {
  return (
    <div className={styles.wrap}>
      <p className={styles.label}>{label}</p>
      <div className={styles.marquee}>
        <div className={styles.track}>
          {[...TECH_LOGOS, ...TECH_LOGOS].map((tool, i) => (
            <span
              className={styles.logo}
              key={i}
              aria-hidden={i >= TECH_LOGOS.length || undefined}
            >
              <span
                className={styles.glyph}
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: tool.svg }}
              />
              {tool.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
