import type { ScopeEnv, Task } from "@/utils/types/parser";
import type { FlowState } from "@/utils/types/store";
import type { WritableDraft } from "immer";

type Draft = WritableDraft<FlowState>;

export const syncActivePointer = (draft: Draft) => {
  const visible = draft.callStack.filter((t) => !(t as any)._isEndMarker);
  const top = visible[visible.length - 1] ?? null;
  draft.activeTaskId = top?.id ?? null;
};

export const pushNextFuncTask = (draft: Draft) => {
  const context = draft.funcCallStack[draft.funcCallStack.length - 1];
  if (context && context.index < context.tasks.length) {
    draft.callStack.push(context.tasks[context.index]);
    context.index += 1;
  }
};

const extractArgs = (taskStr: string): string[] => {
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

const buildScopeForFunc = (
  draft: Draft,
  funcName: string,
  taskStr: string,
): { newEnv: ScopeEnv; callableTasks: Task[] } => {
  const targetFunc = draft.funcMap[funcName];
  const rawArgs = extractArgs(taskStr);
  const paramNames = targetFunc.params ?? [];

  const newEnv: ScopeEnv = {};
  paramNames.forEach((param, idx) => {
    newEnv[param] = evalExpr(rawArgs[idx] ?? "undefined", draft.scopeChain);
  });

  const callableTasks = targetFunc.tasks.filter((task) => {
    if (task.type === "declaration") {
      newEnv[task.varName] = evalExpr(task.varValue, [...draft.scopeChain, newEnv]);
      return false;
    }
    return true;
  });

  return { newEnv, callableTasks };
};

export const handleGlobalAnonymous = (draft: Draft) => {
  if (draft.lineIndex < draft.globalScripts.length) {
    draft.callStack.push(draft.globalScripts[draft.lineIndex]);
    draft.lineIndex += 1;
  } else {
    draft.callStack.pop();
    draft.phase = "done";
  }
};

export const handleEndMarker = (draft: Draft) => {
  draft.scopeChain.pop();
  draft.funcCallStack.pop();
  draft.callStack.pop();
  draft.callStack.pop();
  pushNextFuncTask(draft);
};

const extractConsoleArg = (taskStr: string): string | null => {
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

export const handleConsoleLog = (draft: Draft, taskStr: string) => {
  const arg = extractConsoleArg(taskStr);
  if (arg !== null) {
    draft.consoleLog.push({
      id: crypto.randomUUID(),
      message: evalExpr(arg, draft.scopeChain),
      kind: "log",
    });
  }
  draft.callStack.pop();
  pushNextFuncTask(draft);
};

const makeEndMarker = (funcName: string): Task => {
  const marker: Task = {
    id: crypto.randomUUID(),
    task: `// exit ${funcName}`,
    type: "stack",
  };
  (marker as any)._isEndMarker = true;
  return marker;
};

export const handleFuncCall = (draft: Draft, funcName: string, taskStr: string) => {
  const { newEnv, callableTasks } = buildScopeForFunc(draft, funcName, taskStr);
  draft.scopeChain.push(newEnv);
  draft.funcCallStack.push({ tasks: callableTasks, index: 1 });
  draft.callStack.push(makeEndMarker(funcName));
  if (callableTasks.length > 0) {
    draft.callStack.push(callableTasks[0]);
  }
};

export const extractFuncName = (taskStr: string): string => {
  const idx = taskStr.indexOf("(");
  return idx === -1 ? taskStr.trim() : taskStr.slice(0, idx).trim();
};
