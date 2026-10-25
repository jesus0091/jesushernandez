import { preload } from "react-dom";

const ROWS = 6;
// A tile's width with its gap, in cqh (h-[30cqh] at 1600/707, plus mr-[2cqh]).
const TILE_W = (30 * 1600) / 707 + 2;
// A row is 400cqh wide and starts up to 68cqh further left (its margin), so the
// sets left after the loop's shift must still cover that span.
const ROW_SPAN = 400 + 68;

// The same few screens repeat across the wall hundreds of times, so each tile
// lists just two optimized widths (next/image would list every configured one
// per tile, a few hundred KB of markup).
const optimized = (src: string, w: number) => `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75`;
const srcSetFor = (src: string) => `${optimized(src, 384)} 384w, ${optimized(src, 640)} 640w`;

/**
 * The /works wall at card size: a tilted mosaic of a project's own screens, in
 * color. Fills its (positioned) parent and is sized from it, in container
 * units, so the same composition holds in any card.
 */
export default function CoverMosaic({
  tiles,
  animated = false,
  sizes = "280px",
  prioritySrc,
}: {
  tiles: string[];
  /** One above-the-fold tile to prioritize without raising every image. */
  prioritySrc?: string;
  animated?: boolean;
  /** Rendered tile width, for the image srcset (tiles are far smaller than their files). */
  sizes?: string;
}) {
  if (prioritySrc) {
    preload(optimized(prioritySrc, 640), {
      as: "image",
      imageSrcSet: srcSetFor(prioritySrc),
      imageSizes: sizes,
      fetchPriority: "high",
    });
  }

  // Neighbouring rows never share an image (see WorksWall).
  const pools = [tiles.filter((_, i) => i % 2 === 0), tiles.filter((_, i) => i % 2 === 1)];

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-[var(--color-ink-1)] [container-type:size]">
      <div className="absolute left-1/2 top-1/2 w-[400cqh] -translate-x-1/2 -translate-y-1/2 -rotate-12">
        {Array.from({ length: ROWS }, (_, r) => {
          const pool = pools[r % 2];
          const start = Math.floor(r / 2) * (r % 2 ? 1 : 2);
          // A single pool already repeats seamlessly. Duplicate only enough
          // to cover the viewport after the animation shifts by one set.
          const perSet = pool.length * (animated ? 1 : 2);
          const sets = animated ? 1 + Math.ceil(ROW_SPAN / (perSet * TILE_W)) : 1;
          return (
            // Each row starts a little further in, so the tiles don't stack in columns.
            <div key={r} className="mb-[2cqh]" style={{ marginLeft: `-${(r * 23) % 68}cqh` }}>
              <div
                className={`flex w-max ${animated ? "works-wall-row" : ""}`}
                data-reverse={animated && r % 2 ? "" : undefined}
                style={animated ? ({ "--wall-sets": sets, animationDuration: r % 2 ? "33s" : "44s" } as React.CSSProperties) : undefined}
              >
                {Array.from({ length: sets * perSet }, (_, i) => {
                  const src = pool[(i + start) % pool.length];
                  return (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={optimized(src, 640)}
                      srcSet={srcSetFor(src)}
                      sizes={sizes}
                      alt=""
                      // The moving wall is on screen as it loads; still covers sit lower.
                      loading={animated ? "eager" : "lazy"}
                      fetchPriority={src === prioritySrc ? "high" : "auto"}
                      decoding="async"
                      draggable={false}
                      className="mr-[2cqh] aspect-[1600/707] h-[30cqh] flex-none rounded-[2cqh] object-cover select-none"
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
