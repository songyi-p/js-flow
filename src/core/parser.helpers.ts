import type { ChainStep, Task } from "@/utils/types/parser";

export const getCallExprName = (callee: any): string => {
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

const extractCallbackInfo = (
  callbackNode: any,
  code: string,
): { bodyTasks: Task[]; callbackParams: string[] } => {
  const callbackParams: string[] =
    callbackNode.params?.map((p: any) => p.name).filter(Boolean) ?? [];
  const bodyTasks: Task[] = [];

  if (callbackNode.body?.type === "BlockStatement") {
    callbackNode.body.body.forEach((stmt: any) => {
      if (stmt.type === "ExpressionStatement" && stmt.expression.type === "CallExpression") {
        bodyTasks.push({
          id: crypto.randomUUID(),
          task: code.slice(stmt.start, stmt.end),
          type: "stack",
        });
      }
    });
  } else if (callbackNode.body?.type === "CallExpression") {
    bodyTasks.push({
      id: crypto.randomUUID(),
      task: code.slice(callbackNode.body.start, callbackNode.body.end),
      type: "stack",
    });
  }

  return { bodyTasks, callbackParams };
};

export const extractChain = (
  node: any,
  code: string,
): { chain: ChainStep[]; resolvedValue: string | null; rejectedReason: string | null } => {
  const chain: ChainStep[] = [];
  let resolvedValue: string | null = null;
  let rejectedReason: string | null = null;

  const collect = (n: any) => {
    const name = getCallExprName(n.callee);

    if (name === "Promise.resolve") {
      if (n.arguments?.[0]) {
        resolvedValue = code.slice(n.arguments[0].start, n.arguments[0].end);
      }
      return;
    }

    if (name === "Promise.reject") {
      if (n.arguments?.[0]) {
        rejectedReason = code.slice(n.arguments[0].start, n.arguments[0].end);
      }
      return;
    }

    if (name === "queueMicrotask") {
      const callbackNode = n.arguments?.find(
        (arg: any) => arg.type === "ArrowFunctionExpression" || arg.type === "FunctionExpression",
      );
      if (callbackNode) {
        const { bodyTasks, callbackParams } = extractCallbackInfo(callbackNode, code);
        chain.push({ bodyTasks, callbackParams });
      }
      return;
    }

    if (name.includes(".then") || name.includes(".catch") || name.includes(".finally")) {
      if (n.callee?.object?.type === "CallExpression") {
        collect(n.callee.object);
      }

      const callbackNode = n.arguments?.find(
        (arg: any) => arg.type === "ArrowFunctionExpression" || arg.type === "FunctionExpression",
      );
      if (callbackNode) {
        const { bodyTasks, callbackParams } = extractCallbackInfo(callbackNode, code);
        const currentValue = name.includes(".catch")
          ? (rejectedReason ?? undefined)
          : (resolvedValue ?? undefined);

        chain.push({
          bodyTasks,
          callbackParams,
          resolvedValue: currentValue,
        });
      }
    }
  };

  collect(node);
  return { chain, resolvedValue, rejectedReason };
};
