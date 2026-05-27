import { OPERATOR_REGEX, QUOTE_REGEX } from "./regex";
import type { ScopeEnv, Task } from "./types/parser";

const getCallExprName = (callee: any): string => {
  if (!callee) return "anonymous";

  switch (callee.type) {
    case "Identifier":
      return callee.name;

    case "MemberExpression": {
      const prop = callee.property?.name ?? callee.property?.value ?? "unknown";
      const obj = getCallExprName(callee.object);
      return `${obj}.${prop}`;
    }

    case "CallExpression":
      return `${getCallExprName(callee.callee)}()`;

    default:
      return "anonymous";
  }
};

export const createTask = (node: any, source: string): Task => {
  const uuid = crypto.randomUUID();
  const callName = getCallExprName(node.callee);

  const rawExpr: string = source.slice(node.start, node.end);

  if (callName.startsWith("setTimeout") || callName.startsWith("setInterval")) {
    return { id: uuid, task: rawExpr, type: "macro" };
  }

  if (
    callName.startsWith("Promise") ||
    callName.includes(".then") ||
    callName.includes(".catch") ||
    callName.includes(".finally") ||
    callName === "queueMicrotask"
  ) {
    return { id: uuid, task: rawExpr, type: "micro" };
  }

  return { id: uuid, task: rawExpr, type: "stack" };
};

const FUNC_TYPES = new Set([
  "FunctionDeclaration",
  "FunctionExpression",
  "ArrowFunctionExpression",
]);

export const findClosestFunc = (ancestors: any[]): any | null => {
  for (let i = ancestors.length - 1; i >= 0; i--) {
    if (FUNC_TYPES.has(ancestors[i].type)) return ancestors[i];
  }
  return null;
};

export const getDeclaredFuncName = (funcNode: any, ancestors: any[]): string | null => {
  if (funcNode.type === "FunctionDeclaration" && funcNode.id?.name) {
    return funcNode.id.name;
  }

  if (funcNode.type === "FunctionExpression" && funcNode.id?.name) {
    return funcNode.id.name;
  }

  const parent = ancestors[ancestors.length - 2];
  if (parent?.type === "VariableDeclarator" && parent.id?.name) {
    return parent.id.name;
  }

  return null;
};

export const parseCallbackFunc = (node: any, code: string): Task[] => {
  const tasks: Task[] = [];
  const callbackNode = node.arguments?.find(
    (arg: any) => arg.type === "ArrowFunctionExpression" || arg.type === "FunctionExpression",
  );
  if (!callbackNode) return tasks;

  if (callbackNode.body?.type === "BlockStatement") {
    callbackNode.body.body.forEach((stmt: any) => {
      if (stmt.type === "ExpressionStatement" && stmt.expression.type === "CallExpression") {
        tasks.push({
          id: crypto.randomUUID(),
          task: code.slice(stmt.start, stmt.end),
          type: "stack",
        });
      }
    });
  } else if (callbackNode.body?.type === "CallExpression") {
    tasks.push({
      id: crypto.randomUUID(),
      task: code.slice(callbackNode.body.start, callbackNode.body.end),
      type: "stack",
    });
  }
  return tasks;
};

export const findIdentifier = (expr: string, scopeChain: ScopeEnv[]): string => {
  const trimmed = expr.trim();

  const quoteMatch = trimmed.match(QUOTE_REGEX);
  if (quoteMatch) return quoteMatch[2];

  for (let i = scopeChain.length - 1; i >= 0; i--) {
    if (scopeChain[i][trimmed] !== undefined) return scopeChain[i][trimmed];
  }
  return trimmed;
};

export const executeStatement = (rawArg: string, scopeChain: ScopeEnv[]): string => {
  if (!OPERATOR_REGEX.test(rawArg)) {
    return findIdentifier(rawArg, scopeChain);
  }

  const tokens = rawArg.split(OPERATOR_REGEX);
  const evaluatedStr = tokens
    .map((t) => {
      const resolved = findIdentifier(t, scopeChain);
      return isNaN(Number(resolved)) ? t : resolved;
    })
    .join("");

  try {
    return String(new Function(`return ${evaluatedStr}`)());
  } catch {
    return rawArg;
  }
};
