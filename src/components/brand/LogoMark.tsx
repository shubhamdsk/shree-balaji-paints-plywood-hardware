import type { SVGProps } from "react";

const NAVY = "#1e2a5a";
const GOLD = "#e09a1a";
const SWIRL = ["#e11d2e", "#f97316", "#facc15", "#2563eb", "#7c3aed"];

export function LogoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <rect x="13" y="9" width="6" height="12" rx="1" fill={NAVY} />
      <path d="M3 30L32 5L61 30H54.5L32 11.5L9.5 30Z" fill={NAVY} />
      <path d="M10.5 32L32 13.5L53.5 32" stroke={GOLD} strokeWidth="2.2" strokeLinejoin="round" />
      <g fill={NAVY}>
        <rect x="37.5" y="23" width="4" height="4" rx="0.6" />
        <rect x="42.5" y="23" width="4" height="4" rx="0.6" />
        <rect x="37.5" y="28" width="4" height="4" rx="0.6" />
        <rect x="42.5" y="28" width="4" height="4" rx="0.6" />
      </g>

      <g strokeWidth="4.2" strokeLinecap="round">
        <path d="M5 50Q13 35 31 37" stroke={SWIRL[0]} />
        <path d="M7 54.5Q16 40 31.5 41" stroke={SWIRL[1]} />
        <path d="M10 58.5Q19 45 32.5 45" stroke={SWIRL[2]} />
        <path d="M14.5 61Q22.5 50 33.5 49" stroke={SWIRL[3]} />
        <path d="M20 62.5Q27 55 34.5 53" stroke={SWIRL[4]} />
      </g>
      <circle cx="4" cy="42" r="1.6" fill={SWIRL[0]} />
      <circle cx="3.5" cy="60" r="1.4" fill={SWIRL[1]} />
      <circle cx="27" cy="31.5" r="1.2" fill={SWIRL[4]} />

      <g transform="translate(32 45) rotate(-37)">
        <path d="M0 -4.5Q-3.5 0 0 4.5L7.5 4.5V-4.5Z" fill={SWIRL[1]} />
        <rect x="7.5" y="-5" width="6.5" height="10" rx="1.2" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.7" />
        <path d="M14 -3.2L27 -2.2Q29.5 0 27 2.2L14 3.2Z" fill={NAVY} />
      </g>
    </svg>
  );
}
