/*
  SectionHeader — єдина шапка секцій (kicker → headline → subhead).
  Замінює 5 копій inline-S-обʼєктів. Стилі — через .kicker/.headline/.subhead у globals.css.
  title може містити <b> для акценту (рендериться золотим 600 через .headline b).
  data-reveal лишається на елементах — щоб батьківський GSAP reveal їх підхоплював.
*/
export default function SectionHeader({ kicker, title, sub, maxWidth = 640 }) {
  return (
    <header style={{ maxWidth, marginBottom: "clamp(40px, 6vh, 72px)" }}>
      {kicker && (
        <p className="kicker" data-anim="blur">
          {kicker}
        </p>
      )}
      <h2 className="headline" data-anim="rise">
        {title}
      </h2>
      {sub && (
        <p className="subhead" data-anim="blur">
          {sub}
        </p>
      )}
    </header>
  );
}
