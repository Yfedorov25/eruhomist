import type { ReactNode } from "react";

// Shared section shell: full-viewport min height, generous breathing room, anchor id.
export function Section({
  id,
  children,
  className = "",
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`relative w-full px-6 py-28 md:px-12 md:py-40 ${className}`}
    >
      {children}
    </section>
  );
}
