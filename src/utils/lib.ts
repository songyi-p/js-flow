import type { ScopeEnv } from "./types/parser";

export const evalExpr = (expr: string, scopeChain: ScopeEnv[]): string => {
  try {
    const scope = Object.assign({}, ...scopeChain);
    const keys = Object.keys(scope);
    const vals = Object.values(scope);
    const result = new Function(...keys, `return (${expr})`)(...vals);
    return String(result);
  } catch {
    return expr;
  }
};
