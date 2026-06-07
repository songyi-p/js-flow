import type { MicroQueueItem } from "@/utils/types/parser";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useFlowStore } from "@/store/useFlowStore";
export { pushMicroTask, popAndAdvanceChain } from "./useMicoQueu.helpers";

export function useMicroQueue() {
  const { microQueue, updateStore } = useFlowStore(
    useShallow((s) => ({
      microQueue: s.microQueue,
      updateStore: s.updateStore,
    })),
  );

  const canStepMicro = microQueue.length > 0;

  const stepMicro = useCallback(() => {
    if (!canStepMicro) return;

    updateStore((draft) => {
      const item = draft.microQueue.shift() as MicroQueueItem | undefined;
      if (!item) return;

      const callbackScope = (item as any).callbackScope;
      if (callbackScope && Object.keys(callbackScope).length > 0) {
        draft.scopeChain.push(callbackScope);
        (item as any)._hasMicroScope = true;
      }

      if (item.bodyTasks.length > 0) {
        const firstTask = {
          ...item.bodyTasks[0],
          id: crypto.randomUUID(),
          _microItem: item,
          _microBodyIndex: 0,
          _microBodyTasks: item.bodyTasks,
        };
        draft.callStack.push(firstTask as any);

        if (item.bodyTasks.length > 1) {
          draft.funcCallStack.push({
            tasks: item.bodyTasks.slice(1),
            index: 0,
          } as any);
        }
      }

      const visible = draft.callStack.filter((t) => !(t as any)._isEndMarker);
      draft.activeTaskId = visible.length > 0 ? visible[visible.length - 1].id : null;
    });
  }, [canStepMicro, updateStore]);

  return { microQueue, canStepMicro, stepMicro };
}
