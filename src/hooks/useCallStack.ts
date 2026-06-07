import type { ScopeEnv } from "@/utils/types/parser";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { parser } from "@/core/parser";
import { useFlowStore } from "@/store/useFlowStore";
import { evalExpr } from "@/utils/lib";
import * as H from "./useCallStack.helpers";

export function useCallStack() {
  const {
    callStack,
    microQueue,
    consoleLog,
    phase,
    activeTaskId,
    updateStore,
    reset: resetStore,
    clearConsole,
  } = useFlowStore(
    useShallow((s) => ({
      callStack: s.callStack,
      microQueue: s.microQueue,
      consoleLog: s.consoleLog,
      phase: s.phase,
      activeTaskId: s.activeTaskId,
      updateStore: s.updateStore,
      reset: s.reset,
      clearConsole: s.clearConsole,
    })),
  );

  const canStep =
    (callStack.length > 0 || microQueue.length > 0) && (phase === "ready" || phase === "running");

  const run = useCallback(
    (code: string) => {
      if (!code.trim()) return;
      const { mainScript, funcMap: parsedFuncMap } = parser(code);

      updateStore((draft) => {
        const globalScope: ScopeEnv = {};
        const callableTasks = mainScript.filter((task) => {
          if (task.type === "declaration") {
            globalScope[task.varName] = evalExpr(task.varValue, [globalScope]);
            return false;
          }
          return true;
        });

        draft.funcMap = parsedFuncMap;
        draft.globalScripts = callableTasks;
        draft.lineIndex = 0;
        draft.scopeChain = [globalScope];
        draft.funcCallStack = [];
        draft.microQueue = [];
        draft.macroQueue = [];
        draft.callStack = [{ id: "global-anonymous", task: "global anonymous", type: "stack" }];
        draft.activeTaskId = "global-anonymous";
        draft.phase = "ready";
      });
    },
    [updateStore],
  );

  const step = useCallback(() => {
    if (!canStep) return;

    updateStore((draft) => {
      draft.phase = "running";

      const top = draft.callStack[draft.callStack.length - 1];
      if (!top) return;

      const taskStr = top.task.trim();
      const funcName = H.extractFuncName(taskStr);

      if (top.id === "global-anonymous") H.handleGlobalAnonymous(draft);
      else if ((top as any)._isMicroPlaceholder) H.handleMicroPlaceholder(draft);
      else if ((top as any)._isEndMarker) H.handleEndMarker(draft);
      else if (taskStr.startsWith("console.log")) H.handleConsoleLog(draft, taskStr);
      else if (draft.funcMap[funcName]) H.handleFuncCall(draft, funcName, taskStr);
      else {
        H.popTask(draft);
        H.pushNextFuncTask(draft);
      }

      H.syncActivePointer(draft);
    });
  }, [canStep, updateStore]);

  const reset = useCallback(() => resetStore(), [resetStore]);

  return { callStack, consoleLog, phase, canStep, activeTaskId, run, step, reset, clearConsole };
}
