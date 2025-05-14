import type { SVGProps } from 'react';

const Logo = (props: SVGProps<SVGSVGElement>) => (
  <svg 
    width="32" 
    height="32" 
    viewBox="0 0 100 100" 
    xmlns="http://www.w3.org/2000/svg"
    aria-label="SQL Insights AI Logo"
    {...props}
  >
    <defs>
      <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor: "hsl(var(--primary))"}} />
        <stop offset="100%" style={{stopColor: "hsl(var(--accent))"}} />
      </linearGradient>
    </defs>
    {/* Abstract representation of a query or insight graph */}
    <path d="M20 80 C 35 30, 65 30, 80 80" stroke="url(#logoGrad)" strokeWidth="10" fill="none" strokeLinecap="round"/>
    <circle cx="50" cy="45" r="12" fill="hsl(var(--accent))" />
    <path d="M50 45 V 20 M 50 45 L 30 30 M 50 45 L 70 30" stroke="hsl(var(--accent))" strokeWidth="6" strokeLinecap="round" />
  </svg>
);

export default Logo;
