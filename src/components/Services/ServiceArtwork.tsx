import ServiceSketch from "@/components/Services/ServiceSketch";
import type { ServiceId } from "@/data/services";

// Each service has a soft gradient of the page's paper into a tint, following
// the CTA tunnel's gradient: peach, plum, blue. The sketch stays in ink with
// the orange accent, its guides in the card's hue.
export const SERVICE_THEME: Record<ServiceId, string> = {
  "web-development": "bg-[linear-gradient(160deg,#f6e6d8_0%,#efcfb3_55%,#e8b791_100%)] [--sk-guide:#d9773a] [--sk-tint:#f7ebe1]",
  "web-apps": "bg-[linear-gradient(160deg,#f1e6ee_0%,#e6cfe0_55%,#d9b6cf_100%)] [--sk-guide:#a06a8e] [--sk-tint:#f5eff3]",
  "mobile-apps": "bg-[linear-gradient(160deg,#e9edf7_0%,#d6def3_55%,#bfcbef_100%)] [--sk-guide:#6f86d0] [--sk-tint:#ebeef7]",
};

/** Film grain over a service's colour, under its sketch. Goes inside an `isolate` box. */
export function ServiceGrain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 bg-[image:var(--grain-image)] bg-[size:var(--grain-size)_var(--grain-size)] opacity-90 mix-blend-overlay"
    />
  );
}

/** A service's sketch on its coloured, grainy ground. */
export default function ServiceArtwork({
  id,
  play,
  className = "",
}: {
  id: ServiceId;
  play?: "scroll" | "load";
  className?: string;
}) {
  return (
    <div
      className={`relative isolate flex aspect-[4/3] items-center justify-center overflow-hidden rounded-3xl px-[12%] [--sk-width:1.5] [--sk-fill:#fff] ${SERVICE_THEME[id]} ${className}`}
    >
      <ServiceGrain />
      <div className="w-full transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.03]">
        <ServiceSketch id={id} play={play} />
      </div>
    </div>
  );
}
