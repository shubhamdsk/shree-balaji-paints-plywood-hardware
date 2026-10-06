import type { SVGProps } from "react";

export function Namam(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <circle cx="12" cy="12" r="11" fill="#1e2a5a" stroke="#e09a1a" strokeWidth="1.6" />
      <path d="M7.5 5.5V12.5Q7.5 18 12 18Q16.5 18 16.5 12.5V5.5" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M12 6.5V15.5" stroke="#e11d2e" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
