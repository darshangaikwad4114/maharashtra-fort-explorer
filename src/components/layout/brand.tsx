import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      className={cn("size-9", className)}
      fill="none"
    >
      <rect width="40" height="40" rx="12" fill="#B85423" />
      <path
        d="M8 28.5V20l3-1.8V15h3v2h3v-4.5L20 9l3 3.5V17h3v-2h3v3.2l3 1.8v8.5"
        stroke="#FAF6EE"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M8 28.5h24" stroke="#FAF6EE" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M17 28.5v-5.2a3 3 0 0 1 6 0v5.2"
        stroke="#FAF6EE"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M14 19.4h12" stroke="#FAF6EE" strokeWidth="1.2" opacity=".55" />
    </svg>
  );
}
