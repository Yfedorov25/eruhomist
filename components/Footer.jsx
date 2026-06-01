import data from "@/content/eruhomist-data.json";

/*
  Footer — лого, телефон, Instagram, copyright. Дані з JSON.
*/

const C = data.contact;

export default function Footer() {
  return (
    <footer style={S.footer}>
      <div style={S.row}>
        <a href="#" style={S.logo}>
          Є<span style={{ color: "var(--accent)" }}>·</span>рухомість
        </a>
        <div style={S.links}>
          <a href={`tel:${C.phone.replace(/\s/g, "")}`} style={S.link}>
            {C.phone}
          </a>
          <a
            href={C.instagram}
            target="_blank"
            rel="noopener noreferrer"
            style={S.link}
          >
            {C.instagramHandle}
          </a>
          <span style={S.muted}>{C.city}</span>
        </div>
      </div>
      <div style={S.bottom}>
        <span style={S.muted}>
          © 2026 Єрухомість. Нерухомість та девелопмент.
        </span>
        <span style={S.muted}>Зроблено з увагою до деталей.</span>
      </div>
    </footer>
  );
}

const S = {
  footer: {
    background: "var(--bg)",
    color: "var(--text)",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    padding: "clamp(48px, 7vh, 80px) clamp(24px, 8vw, 140px) 40px",
  },
  row: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 24,
    paddingBottom: 36,
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  logo: {
    fontFamily: "var(--font-display), Georgia, serif",
    fontSize: 24,
    color: "#fff",
    textDecoration: "none",
  },
  links: { display: "flex", flexWrap: "wrap", gap: "clamp(16px, 3vw, 40px)", alignItems: "center" },
  link: { fontSize: 15, color: "rgba(255,255,255,0.85)", textDecoration: "none" },
  muted: { fontSize: 13, color: "rgba(255,255,255,0.4)", letterSpacing: "0.04em" },
  bottom: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 28,
  },
};
