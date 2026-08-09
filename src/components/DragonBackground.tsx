import { useTheme } from "@/hooks/useTheme";

/**
 * Full animated dragon silhouette + drifting embers, used behind the hero
 * section on the "dragon" theme. Pure CSS/SVG animation, no JS render loop.
 */
export function DragonBackground() {
  const { theme } = useTheme();
  if (theme !== "dragon") return null;

  return (
    <div className="dragon-fx" aria-hidden="true">
      <div className="dragon-fx__glow" />
      <svg
        className="dragon-fx__svg"
        viewBox="0 0 1000 500"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="dragonBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--dragon-ember-2)" />
            <stop offset="100%" stopColor="var(--dragon-ember-1)" />
          </linearGradient>
        </defs>
        <g className="dragon-fx__body">
          <path
            d="M60,360 C160,260 220,420 320,340 C400,275 380,180 470,160
               C540,145 560,90 640,75 C700,64 745,95 760,60
               C775,95 815,95 830,60 C845,100 800,120 760,120
               C700,120 660,150 610,170 C540,198 520,260 450,290
               C380,320 340,400 260,410 C190,418 130,400 60,360 Z"
            fill="url(#dragonBody)"
            opacity="0.9"
          />
          <path
            className="dragon-fx__wing"
            d="M470,160 C520,110 610,90 690,120 C630,130 580,150 540,190 C515,175 490,168 470,160 Z"
            fill="var(--dragon-ember-1)"
            opacity="0.55"
          />
          <circle className="dragon-fx__eye" cx="742" cy="82" r="6" fill="var(--accent)" />
        </g>
        <path
          className="dragon-fx__trail"
          d="M60,360 C160,260 220,420 320,340 C400,275 380,180 470,160
             C540,145 560,90 640,75 C700,64 745,95 760,60"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span className="dragon-fx__ember dragon-fx__ember--1" />
      <span className="dragon-fx__ember dragon-fx__ember--2" />
      <span className="dragon-fx__ember dragon-fx__ember--3" />
      <span className="dragon-fx__ember dragon-fx__ember--4" />
      <span className="dragon-fx__ember dragon-fx__ember--5" />
    </div>
  );
}

/**
 * Small breathing emblem for the "company" (Caged Dragon Studios) theme —
 * shown next to the wordmark in the header, calmer than the full dragon.
 */
export function DragonEmblem() {
  const { theme } = useTheme();
  if (theme !== "company") return null;

  return (
    <svg
      className="dragon-emblem"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="22" fill="none" stroke="var(--accent)" strokeWidth="1.5" />
      <path
        d="M12,30 C16,22 18,32 24,26 C28,22 26,16 32,14 C30,18 33,19 35,16"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="34" cy="15" r="2" fill="var(--accent)" />
    </svg>
  );
}
