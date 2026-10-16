const ROWS = 6;

/**
 * The /works wall at card size: a tilted mosaic of a project's own screens, in
 * color. Fills its (positioned) parent and is sized from it, in container
 * units, so the same composition holds in any card.
 */
export default function CoverMosaic({ tiles, animated = false }: { tiles: string[]; animated?: boolean }) {
  // Neighbouring rows never share an image (see WorksWall).
  const pools = [tiles.filter((_, i) => i % 2 === 0), tiles.filter((_, i) => i % 2 === 1)];
  // The loop shifts by one of three identical sets; a still wall needs one.
  const sets = animated ? 3 : 1;

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-[var(--color-ink-1)] [container-type:size]">
      <div className="absolute left-1/2 top-1/2 w-[400cqh] -translate-x-1/2 -translate-y-1/2 -rotate-12">
        {Array.from({ length: ROWS }, (_, r) => {
          const pool = pools[r % 2];
          const start = Math.floor(r / 2) * (r % 2 ? 1 : 2);
          return (
            // Each row starts a little further in, so the tiles don't stack in columns.
            <div key={r} className="mb-[2cqh]" style={{ marginLeft: `-${(r * 23) % 68}cqh` }}>
              <div
                className={`flex w-max ${animated ? "works-wall-row" : ""}`}
                data-reverse={animated && r % 2 ? "" : undefined}
              >
                {Array.from({ length: sets * pool.length * 2 }, (_, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={pool[(i + start) % pool.length]}
                    alt=""
                    decoding="async"
                    draggable={false}
                    className="mr-[2cqh] aspect-[1600/707] h-[30cqh] flex-none rounded-[2cqh] object-cover select-none"
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
