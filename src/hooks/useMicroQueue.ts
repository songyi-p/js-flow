import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useFlowStore } from "@/store/useFlowStore";

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
      const task = draft.microQueue.shift();
      if (!task) return;

      draft.callStack.push(task);

      const visible = draft.callStack.filter((t) => !(t as any)._isEndMarker);
      draft.activeTaskId = visible.length > 0 ? visible[visible.length - 1].id : null;
    });
  }, [canStepMicro, updateStore]);

  return { microQueue, stepMicro };
}
