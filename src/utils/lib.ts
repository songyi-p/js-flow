import type { ScopeEnv, Task } from "./types/parser";

const getCallExprName = (callee: any): string => {
  if (!callee) return "anonymous";

  switch (callee.type) {
    case "Identifier":
      return callee.name;

    case "MemberExpression": {
      const prop = callee.property?.name ?? callee.property?.value ?? "unknown";
      return `${getCallExprName(callee.object)}.${prop}`;
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

export const extractFuncName = (taskStr: string): string => {
  const idx = taskStr.indexOf("(");
  return idx === -1 ? taskStr.trim() : taskStr.slice(0, idx).trim();
};

export const extractArgs = (taskStr: string): string[] => {
  const start = taskStr.indexOf("(");
  const end = taskStr.lastIndexOf(")");
  if (start === -1 || end === -1) return [];

  const inner = taskStr.slice(start + 1, end);
  const args: string[] = [];
  let depth = 0;
  let cur = "";

  for (const ch of inner) {
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    else if (ch === "," && depth === 0) {
      args.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) args.push(cur.trim());
  return args;
};
