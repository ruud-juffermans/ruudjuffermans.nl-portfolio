import styles from "./HeroCircles.module.css";

// Decorative circle pattern for the hero. Purely ambient: the motion runs
// entirely in CSS (orbit-and-bloom on desktop, steady breathing on mobile)
// and deliberately does not react to the pointer.
export default function HeroCircles() {
  return (
    <div className={styles.pattern} aria-hidden="true">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className={styles.circle} />
      ))}
    </div>
  );
}
