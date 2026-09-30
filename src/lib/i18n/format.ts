/** format("{count} projects", { count: 3 }) → "3 projects". Unknown tokens are left as-is. */
export function format(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (token, key: string) =>
    key in vars ? String(vars[key]) : token,
  );
}
