import { memo, useMemo, type ReactNode } from 'react';
import { places } from '../data';
import { mapPalette as c } from '../tokens';
import { canal, CANAL_HALF, coastY, distToSufouh, distToSzr, golf, GRID_ANGLE, island, isGolf, isWater, lakes, N, seeded, smoothPath, sufouhY, SZR, U, WORLD } from './mapWorld';
import { palette } from '../../../foundations/palette';

const O = { x: 0, y: coastY(0) };
const at = (s: number, d: number) => ({ x: O.x + U.x * s + N.x * d, y: O.y + U.y * s + N.y * d });
const CELL_S = 124;
const CELL_D = 104;
const STREET = 13;

function Label({ x, y, children, size = 11, color = c.label, weight = 500, rotate = 0, spacing = 0, italic }: { x: number; y: number; children: ReactNode; size?: number; color?: string; weight?: number; rotate?: number; spacing?: number; italic?: boolean }) {
  return (
    <text
      x={x}
      y={y}
      transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={size}
      fontWeight={weight}
      fill={color}
      letterSpacing={spacing}
      fontStyle={italic ? 'italic' : undefined}
      stroke={palette.white}
      strokeWidth={3}
      strokeOpacity={0.85}
      paintOrder="stroke"
      style={{ fontFamily: 'var(--nk-font-family)' }}
    >
      {children}
    </text>
  );
}

/** Static world: drawn once, panned by the parent. */
export const StreetMap = memo(function StreetMap({ highlightPlaceId, highlightKey }: { highlightPlaceId?: string; highlightKey?: number }) {
  const { streets, blocks } = useMemo(() => {
    const rnd = seeded(7);
    const lines: string[] = [];
    for (let k = -2; k <= 22; k++) {
      const a = at(k * CELL_S, -400);
      const b = at(k * CELL_S, 2600);
      lines.push(`M ${a.x} ${a.y} L ${b.x} ${b.y}`);
    }
    for (let m = 0; m <= 22; m++) {
      const a = at(-600, m * CELL_D);
      const b = at(3000, m * CELL_D);
      lines.push(`M ${a.x} ${a.y} L ${b.x} ${b.y}`);
    }
    const out: ReactNode[] = [];
    for (let k = -2; k <= 22; k++) {
      for (let m = 0; m <= 22; m++) {
        const ctr = at(k * CELL_S + CELL_S / 2, m * CELL_D + CELL_D / 2);
        if (ctr.x < -80 || ctr.y < -80 || ctr.x > WORLD + 80 || ctr.y > WORLD + 80) continue;
        if (isWater(ctr, 46) || distToSzr(ctr) < 62 || distToSufouh(ctr) < 40 || isGolf(ctr, 30)) continue;
        const w = CELL_S - STREET;
        const h = CELL_D - STREET;
        const r = rnd();
        const key = `${k}_${m}`;
        const tf = `rotate(${GRID_ANGLE} ${ctr.x} ${ctr.y})`;
        if (r < 0.07) {
          out.push(<rect key={key} x={ctr.x - w / 2} y={ctr.y - h / 2} width={w} height={h} rx={10} fill={c.park} transform={tf} />);
          continue;
        }
        const towers: ReactNode[] = [];
        const count = 1 + Math.floor(rnd() * 3);
        for (let i = 0; i < count; i++) {
          const tw = 18 + rnd() * 26;
          const th = 18 + rnd() * 24;
          const tx = ctr.x - w / 2 + 8 + rnd() * (w - tw - 16);
          const ty = ctr.y - h / 2 + 8 + rnd() * (h - th - 16);
          towers.push(<rect key={i} x={tx} y={ty} width={tw} height={th} rx={rnd() < 0.3 ? tw / 2 : 3} fill={c.tower} stroke={c.blockStroke} strokeWidth={1} />);
        }
        out.push(
          <g key={key} transform={tf}>
            <rect x={ctr.x - w / 2} y={ctr.y - h / 2} width={w} height={h} rx={4} fill={c.block} />
            {towers}
          </g>,
        );
      }
    }
    return { streets: lines.join(' '), blocks: out };
  }, []);

  const canalPath = useMemo(() => smoothPath(canal), []);
  const coastEnd = { x: (O.y - 0) / 0.62, y: 0 };
  const sufA = { x: -50, y: sufouhY(-50) };
  const sufB = { x: 1900, y: sufouhY(1900) };
  const szrA = { x: SZR - 1900, y: 1900 };
  const szrB = { x: 1900, y: SZR - 1900 };
  const metroOff = 46;
  const metroA = { x: szrA.x - metroOff / Math.SQRT2, y: szrA.y - metroOff / Math.SQRT2 };
  const metroB = { x: szrB.x - metroOff / Math.SQRT2, y: szrB.y - metroOff / Math.SQRT2 };
  const highlight = places.find((p) => p.id === highlightPlaceId);

  return (
    <svg width={WORLD} height={WORLD} viewBox={`0 0 ${WORLD} ${WORLD}`} style={{ display: 'block' }} aria-hidden>
      <rect width={WORLD} height={WORLD} fill={c.land} />
      {/* beach */}
      <line x1={O.x - 40} y1={O.y + 25} x2={coastEnd.x + 40} y2={coastEnd.y - 25} stroke={c.sand} strokeWidth={70} />

      {/* local streets */}
      <path d={streets} stroke={c.roadCasing} strokeWidth={STREET + 2} fill="none" />
      <path d={streets} stroke={c.road} strokeWidth={STREET - 1} fill="none" />

      {blocks}

      {/* golf */}
      <ellipse cx={golf.x} cy={golf.y} rx={golf.rx} ry={golf.ry} fill={c.golf} />
      <ellipse cx={golf.x - 60} cy={golf.y - 30} rx={70} ry={26} fill={c.park} transform={`rotate(-30 ${golf.x - 60} ${golf.y - 30})`} />
      <ellipse cx={golf.x + 70} cy={golf.y + 40} rx={60} ry={22} fill={c.park} transform={`rotate(20 ${golf.x + 70} ${golf.y + 40})`} />

      {/* water */}
      <polygon points={`-10,-10 ${coastEnd.x + 10},-10 -10,${O.y + 10}`} fill={c.water} />
      <path d={canalPath} stroke={palette.kitGray92} strokeWidth={CANAL_HALF * 2 + 18} fill="none" strokeLinecap="round" />
      <path d={canalPath} stroke={c.water} strokeWidth={CANAL_HALF * 2} fill="none" strokeLinecap="round" />
      {lakes.map((l, i) => (
        <g key={i}>
          <ellipse cx={l.x} cy={l.y} rx={l.rx + 9} ry={l.ry + 9} fill={palette.kitGray92} transform={`rotate(-40 ${l.x} ${l.y})`} />
          <ellipse cx={l.x} cy={l.y} rx={l.rx} ry={l.ry} fill={c.water} transform={`rotate(-40 ${l.x} ${l.y})`} />
        </g>
      ))}

      {/* Bluewaters + bridge */}
      <line x1={island.x + 40} y1={island.y + 50} x2={520} y2={540} stroke={c.roadCasing} strokeWidth={16} />
      <line x1={island.x + 40} y1={island.y + 50} x2={520} y2={540} stroke={c.road} strokeWidth={12} />
      <circle cx={island.x} cy={island.y} r={island.r + 8} fill={c.sand} />
      <circle cx={island.x} cy={island.y} r={island.r} fill={c.land} />
      <circle cx={island.x} cy={island.y} r={30} fill="none" stroke={c.blockStroke} strokeWidth={10} />
      <rect x={island.x - 34} y={island.y - 60} width={68} height={22} rx={4} fill={c.block} />
      <rect x={island.x - 58} y={island.y + 24} width={52} height={26} rx={4} fill={c.block} />
      <rect x={island.x + 10} y={island.y + 26} width={46} height={24} rx={4} fill={c.block} />

      {/* Al Sufouh Rd / King Salman St */}
      <line x1={sufA.x} y1={sufA.y} x2={sufB.x} y2={sufB.y} stroke={c.roadCasing} strokeWidth={24} />
      <line x1={sufA.x} y1={sufA.y} x2={sufB.x} y2={sufB.y} stroke={c.road} strokeWidth={20} />

      {/* Sheikh Zayed Rd (E11) */}
      <line x1={szrA.x} y1={szrA.y} x2={szrB.x} y2={szrB.y} stroke={c.highwayCasing} strokeWidth={40} />
      <line x1={szrA.x} y1={szrA.y} x2={szrB.x} y2={szrB.y} stroke={c.highway} strokeWidth={36} />
      <line x1={szrA.x} y1={szrA.y} x2={szrB.x} y2={szrB.y} stroke={c.highwayCasing} strokeWidth={1.5} strokeDasharray="1 0" opacity={0.7} />

      {/* Red line metro */}
      <line x1={metroA.x} y1={metroA.y} x2={metroB.x} y2={metroB.y} stroke={c.metro} strokeWidth={4} opacity={0.75} />
      {[
        { x: 1022, y: 1318, n: 'Sobha Realty' },
        { x: 1248, y: 1092, n: 'DMCC' },
        { x: 1490, y: 850, n: 'Dubai Internet City' },
      ].map((s) => (
        <g key={s.n}>
          <circle cx={s.x} cy={s.y} r={7} fill={palette.white} stroke={c.metro} strokeWidth={3} />
          <Label x={s.x - 14} y={s.y - 20} size={10} color={c.metro} weight={600}>
            {s.n}
          </Label>
        </g>
      ))}

      {/* building polygon (MapKMLPolygons) for a searched place */}
      {highlight && (
        <rect
          key={highlightKey}
          x={highlight.x - 34}
          y={highlight.y - 24}
          width={68}
          height={48}
          rx={4}
          stroke={c.polygonStroke}
          strokeWidth={2}
          transform={`rotate(${GRID_ANGLE} ${highlight.x} ${highlight.y})`}
          fill={c.polygonFillEnd}
        >
          <animate attributeName="fill" from={c.polygonFillStart} to={c.polygonFillEnd} dur="350ms" fill="freeze" />
        </rect>
      )}

      {/* labels */}
      <Label x={360} y={190} size={15} color={c.labelWater} weight={500} italic spacing={1}>
        Persian Gulf
      </Label>
      <Label x={735} y={872} size={11} color={c.labelWater} italic rotate={40}>
        Dubai Marina
      </Label>
      <Label x={1075} y={760} size={13} weight={700} spacing={2} color={palette.kitGray48} rotate={GRID_ANGLE}>
        DUBAI MARINA
      </Label>
      <Label x={640} y={470} size={11} weight={700} spacing={1.5} color={palette.kitGray48} rotate={GRID_ANGLE}>
        JUMEIRAH BEACH RESIDENCE
      </Label>
      <Label x={1420} y={430} size={12} weight={700} spacing={2} color={palette.kitGray48} rotate={GRID_ANGLE}>
        DUBAI MEDIA CITY
      </Label>
      <Label x={1300} y={1590} size={12} weight={700} spacing={1.5} color={palette.kitGray48} rotate={GRID_ANGLE}>
        JUMEIRAH LAKES TOWERS
      </Label>
      <Label x={1660} y={1010} size={11} weight={700} spacing={1.5} color={palette.kitGray48} rotate={GRID_ANGLE}>
        BARSHA HEIGHTS
      </Label>
      <Label x={golf.x} y={golf.y + 4} size={11} color={c.labelPark} weight={600}>
        Emirates Golf Club
      </Label>
      <Label x={1150} y={1270} size={11} weight={600} rotate={-45}>
        Sheikh Zayed Rd
      </Label>
      <Label x={1240} y={sufouhY(1240) - 1} size={10} weight={600} rotate={GRID_ANGLE}>
        King Salman Bin Abdulaziz Al Saud St
      </Label>
      <Label x={300} y={sufouhY(300) - 1} size={10} weight={600} rotate={GRID_ANGLE}>
        Al Sufouh Rd
      </Label>

      {/* POIs */}
      {places.map((p) => (
        <g key={p.id}>
          <circle cx={p.x} cy={p.y} r={4.5} fill={c.poi} stroke={palette.white} strokeWidth={1.5} />
          <Label x={p.x} y={p.y + 15} size={10.5} weight={500}>
            {p.placeName.split(',')[0]}
          </Label>
        </g>
      ))}
    </svg>
  );
});
