import { translate, type TranslateKey } from "@/lib/i18n";

/** Renders both languages; CSS in globals.css shows the active locale. */
export function Tx({
  k,
  vars,
}: {
  k: TranslateKey;
  vars?: Record<string, string | number>;
}) {
  const en = translate("en", k, vars);
  const mr = translate("mr", k, vars);
  return (
    <>
      <span data-lang="en" lang="en">
        {en}
      </span>
      <span data-lang="mr" lang="mr">
        {mr}
      </span>
    </>
  );
}

export function BiText({
  en,
  mr,
  className,
  as: Tag = "p",
}: {
  en: string;
  mr: string;
  className?: string;
  as?: "p" | "span" | "div" | "h2" | "h3";
}) {
  return (
    <Tag className={className}>
      <span data-lang="en" lang="en" className="block">
        {en}
      </span>
      <span data-lang="mr" lang="mr" className="block">
        {mr}
      </span>
    </Tag>
  );
}

export function BiLabel({
  en,
  mr,
  className,
}: {
  en: string;
  mr: string;
  className?: string;
}) {
  return (
    <>
      <span data-lang="en" lang="en" className={className}>
        {en}
      </span>
      <span data-lang="mr" lang="mr" className={className}>
        {mr}
      </span>
    </>
  );
}
