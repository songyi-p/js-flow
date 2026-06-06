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

export const extractConsoleArg = (taskStr: string): string | null => {
  const prefix = "console.log(";
  if (!taskStr.startsWith(prefix)) return null;

  let depth = 0;
  let argStart = prefix.length;
  let argEnd = -1;

  for (let i = prefix.length - 1; i < taskStr.length; i++) {
    if (taskStr[i] === "(") depth++;
    else if (taskStr[i] === ")") {
      depth--;
      if (depth === 0) {
        argEnd = i;
        break;
      }
    }
  }

  if (argEnd === -1) return null;
  return taskStr.slice(argStart, argEnd).trim();
};
