import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useFlowStore } from "@/store/useFlowStore";
import { useCallStack } from "./useCallStack";
import { useMicroQueue } from "./useMicroQueue";

export function useEventLoop() {
  const { callStack, microQueue, macroQueue } = useFlowStore(
    useShallow((s) => ({
      callStack: s.callStack,
      microQueue: s.microQueue,
      macroQueue: s.macroQueue,
    })),
  );

  const { step } = useCallStack();
  const { stepMicro } = useMicroQueue();

  const tick = useCallback(() => {
    if (callStack.length > 0) {
      step();
      return;
    }
    if (microQueue.length > 0) {
      stepMicro();
      return;
    }
    if (macroQueue.length > 0) {
      // TODO : useMacroQueue hook 개발 후 활성화
      // stepMacro();
      return;
    }
  }, [callStack, microQueue, macroQueue, , step, stepMicro]);

  return { tick };
}
