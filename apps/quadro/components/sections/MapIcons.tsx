// SVG icon sprite for the district map (PB_interactive_map playbook: one inline <svg> of
// <symbol>s; markers + filter chips reference them via <use href="#ic-...">). Stroke-based,
// 24x24, `currentColor` so the consumer controls color via CSS `color`.

// Render ONCE near the top of the map section. Hidden, zero layout.
export function MapIconSprite() {
  return (
    <svg
      aria-hidden
      focusable="false"
      width={0}
      height={0}
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        {/* Presentation attrs live on each <symbol> (its root is cloned into the <use> shadow
            tree and its children inherit; a wrapping <g> in <defs> would NOT pass through). */}
        {/* water — droplet */}
        <symbol id="ic-water" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3c3.3 4 5.2 6.6 5.2 9.6a5.2 5.2 0 0 1-10.4 0C6.8 9.6 8.7 7 12 3Z" />
        </symbol>
        {/* park — pine tree */}
        <symbol id="ic-park" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3 7 11h10L12 3Z" />
          <path d="M12 9 6.5 17h11L12 9Z" />
          <path d="M12 17v4" />
        </symbol>
        {/* food — fork & knife */}
        <symbol id="ic-food" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 3v18" />
          <path d="M5 3v4a2 2 0 0 0 4 0V3" />
          <path d="M16.5 3C15 3 14.5 7 14.5 10.5h2.2V21" />
        </symbol>
        {/* sport — dumbbell */}
        <symbol id="ic-sport" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 9.5v5M6.5 7v10M17.5 7v10M20 9.5v5M6.5 12h11" />
        </symbol>
        {/* mall — shopping bag */}
        <symbol id="ic-mall" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8h12l-1 11.5H7L6 8Z" />
          <path d="M9 8a3 3 0 0 1 6 0" />
        </symbol>
        {/* kids — balloon */}
        <symbol id="ic-kids" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 14c2.8 0 5-2.6 5-6s-2.2-5-5-5-5 1.6-5 5 2.2 6 5 6Z" />
          <path d="M12 14v3M10.5 20h3" />
        </symbol>
        {/* bank — columns */}
        <symbol id="ic-bank" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9 12 4l9 5" />
          <path d="M5 9v8M9.5 9v8M14.5 9v8M19 9v8" />
          <path d="M3.5 20h17" />
        </symbol>
        {/* service — gear */}
        <symbol id="ic-service" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 2.6v3.2M12 18.2v3.2M2.6 12h3.2M18.2 12h3.2M5.2 5.2l2.3 2.3M16.5 16.5l2.3 2.3M18.8 5.2l-2.3 2.3M7.5 16.5l-2.3 2.3" />
        </symbol>
      </defs>
    </svg>
  );
}

// Renders a single icon by id (color via the parent's `color`/`text-*`).
export function MapIcon({ id, className }: { id: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false">
      <use href={`#${id}`} />
    </svg>
  );
}
