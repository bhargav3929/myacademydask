import type { SVGProps } from "react";

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4" />
      <path d="M18 16.5V14a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2.5" />
      <path d="M6 14.5V14a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v.5" />
      <path d="M12 8a4 4 0 0 0-4 4v2" />
      <path d="M12 8a4 4 0 0 1 4 4v2" />
      <path d="m5 16 1-1" />
      <path d="m19 16-1-1" />
      <path d="M12 8V2" />
    </svg>
  ),
};
