import type { Task } from "./type";

export const getCallName = (callee: any): string => {
  if (!callee) return "anonymous";
  if (callee.type === "Identifier") return callee.name;
  if (callee.type === "MemberExpression") {
    if (callee.object.type === "CallExpression") {
      return `${getCallName(callee.object.callee)}().${callee.property?.name || "unknown"}`;
    }
    return `${callee.object?.name || "unknown"}.${callee.property?.name || "unknown"}`;
  }
  return "anonymous";
};

export const covertNodeToTask = (node: any, code: string): Task => {
  const callee = node.callee;
  const callName = getCallName(callee);
  const uuid = crypto.randomUUID();

  if (callName.startsWith("setTimeout") || callName.startsWith("setInterval")) {
    return { id: uuid, task: `${callName}(cb)`, type: "macro" };
  }
  if (
    callName.startsWith("Promise") ||
    callName.includes(".then") ||
    callName.includes(".catch") ||
    callName.includes(".finally") ||
    callName === "queueMicrotask"
  ) {
    return { id: uuid, task: `${callName}(cb)`, type: "micro" };
  }
  return { id: uuid, task: `${callName}()`, type: "stack" };
};
