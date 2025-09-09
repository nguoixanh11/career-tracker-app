export type ClassInput =
  | string
  | number
  | null
  | false
  | undefined
  | ClassInput[]
  | { [className: string]: boolean | undefined | null };

export function cn(...inputs: ClassInput[]): string {
  const out: string[] = [];

  const push = (val: ClassInput): void => {
    if (!val && val !== 0) return;
    if (typeof val === "string" || typeof val === "number") {
      if (String(val).trim()) out.push(String(val));
      return;
    }
    if (Array.isArray(val)) {
      for (const v of val) push(v as ClassInput);
      return;
    }
    if (typeof val === "object") {
      for (const [k, v] of Object.entries(val)) {
        if (v) out.push(k);
      }
    }
  };

  for (const i of inputs) push(i);

  // dedupe classes while preserving order
  const seen = new Set<string>();
  const deduped: string[] = [];
  for (const cls of out.join(" ").split(/\s+/)) {
    if (!cls) continue;
    if (!seen.has(cls)) {
      seen.add(cls);
      deduped.push(cls);
    }
  }
  return deduped.join(" ");
}
