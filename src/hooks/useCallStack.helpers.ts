import { evalExpr, extractArgs, extractConsoleArg } from "@/utils/lib";
import type { ScopeEnv, Task } from "@/utils/types/parser";
import type { FlowState } from "@/utils/types/store";
import type { WritableDraft } from "immer";

type Draft = WritableDraft<FlowState>;

export const getVisibleTop = (draft: Draft): Task | null => {
  const visible = draft.callStack.filter((t) => !(t as any)._isEndMarker);
  return visible[visible.length - 1] ?? null;
};

export const syncActivePointer = (draft: Draft) => {
  const top = getVisibleTop(draft);
  draft.activeTaskId = top?.id ?? null;
};

export const pushNextFuncTask = (draft: Draft) => {
  const context = draft.funcCallStack[draft.funcCallStack.length - 1];
  if (context && context.index < context.tasks.length) {
    draft.callStack.push(context.tasks[context.index]);
    context.index += 1;
  }
};

export const buildScopeForFunc = (
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

export const makeEndMarker = (funcName: string): Task => {
  const marker: Task = {
    id: crypto.randomUUID(),
    task: `// exit ${funcName}`,
    type: "stack",
  };
  (marker as any)._isEndMarker = true;
  return marker;
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

export const handleFuncCall = (draft: Draft, funcName: string, taskStr: string) => {
  const { newEnv, callableTasks } = buildScopeForFunc(draft, funcName, taskStr);
  draft.scopeChain.push(newEnv);
  draft.funcCallStack.push({ tasks: callableTasks, index: 1 });
  draft.callStack.push(makeEndMarker(funcName));
  if (callableTasks.length > 0) {
    draft.callStack.push(callableTasks[0]);
  }
};
