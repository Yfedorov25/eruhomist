import { Fragment, type ReactNode } from "react";

// Renders the copy's lightweight markup:
//   **text** → emphasised (warm accent, the brand's "green/gold" highlight)
//   *text*   → muted/secondary (the "negative" tone)
// Kept deliberately tiny — the copy in messages/ is the source of truth, not a CMS.
export function richText(input: string): ReactNode {
  if (!input) return null;
  const parts = input.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-[var(--accent)] font-medium">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={i} className="text-[var(--fg-muted)] not-italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

// Splits multi-paragraph body copy (\n\n separated) into <p> blocks that "breathe".
export function paragraphs(input: string): string[] {
  return input.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
}
