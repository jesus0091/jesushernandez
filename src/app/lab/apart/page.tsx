import type { Metadata } from "next";
import ProposalBento from "./ProposalBento";
import ProposalDecode from "./ProposalDecode";
import ProposalSketch from "./ProposalSketch";

// Proposals for the "What sets me apart" redesign; not linked or indexed.
export const metadata: Metadata = {
  title: "What sets me apart — proposals",
  robots: { index: false, follow: false },
};

const PROPOSALS = [
  {
    id: "a",
    title: "A · Decodificar",
    body: "La frase se actúa sola: “I code.” se decodifica como código (Curtis), “I design.” vive en un marco de selección de Figma que un cursor acomoda, y “I do both.” lo asienta todo con pincelada y nota manuscrita (Daniel Kiss).",
    label: "Etiqueta numerada + meta con puntos (Kiss)",
    Component: ProposalDecode,
  },
  {
    id: "b",
    title: "B · Dos mazos",
    body: "Tarjetas de código entran por la izquierda y de diseño por la derecha, iluminando su frase; en “I do both.” se barajan en una sola grilla. Tarjetas con esquina recortada (Curtis) en tu estilo blanco.",
    label: "Etiqueta píldora mono (Curtis)",
    Component: ProposalBento,
  },
  {
    id: "c",
    title: "C · Boceto → producto",
    body: "La frase arranca como spec: contornos, grilla, cotas y tipografía anotada. Un barrido de bloques naranjas (Curtis) la convierte en el diseño final.",
    label: "Tu etiqueta actual + meta mono (Curtis)",
    Component: ProposalSketch,
  },
];

export default function ApartLabPage() {
  return (
    <main className="pt-24">
      <header className="mx-auto max-w-[1280px] px-8 py-16">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-ink-4)]">Lab · What sets me apart</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">3 propuestas — hacé scroll en cada una</h1>
        <nav className="mt-6 flex gap-3">
          {PROPOSALS.map((p) => (
            <a key={p.id} href={`#${p.id}`} className="rounded-full border border-[var(--color-line-2)] px-4 py-2 text-sm font-medium">
              {p.title}
            </a>
          ))}
        </nav>
      </header>

      {PROPOSALS.map(({ id, title, body, label, Component }) => (
        <div key={id} id={id}>
          <div className="mx-auto max-w-[1280px] border-t border-[var(--color-line-2)] px-8 pt-10 pb-4">
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            <p className="mt-2 max-w-2xl text-[var(--color-ink-3)]">{body}</p>
            <p className="mt-2 font-mono text-xs uppercase tracking-[0.14em] text-[var(--color-ink-4)]">{label}</p>
          </div>
          <Component />
          <div className="h-[30vh]" />
        </div>
      ))}
    </main>
  );
}
