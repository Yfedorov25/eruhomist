/*
  Logo — словесний знак «Є·рухомість» із золотою крапкою-сепаратором.
  Спільний для Header і Footer (раніше дублювався).
*/
export default function Logo({ size = 22, href = "#" }) {
  return (
    <a
      href={href}
      style={{
        fontFamily: "var(--font-display), Georgia, serif",
        fontSize: size,
        fontWeight: 400,
        letterSpacing: "0.02em",
        color: "var(--text-1)",
        textDecoration: "none",
      }}
    >
      Є<span style={{ color: "var(--lamp-glow)" }}>·</span>рухомість
    </a>
  );
}
