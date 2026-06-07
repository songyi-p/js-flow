import type { MicroQueueItem, MicroTask, Task, ScopeEnv } from "@/utils/types/parser";
import type { WritableDraft } from "immer";
import type { FlowState } from "@/utils/types/store";
import { evalExpr } from "@/utils/lib";

type Draft = WritableDraft<FlowState>;

const buildChainItems = (
  chain: { bodyTasks: Task[]; callbackParams: string[]; resolvedValue?: string }[],
  scopeChain: ScopeEnv[],
): MicroQueueItem | null => {
  if (chain.length === 0) return null;

  let next: MicroQueueItem | undefined = undefined;

  for (let i = chain.length - 1; i >= 0; i--) {
    const step = chain[i];
    const callbackParams = step.callbackParams ?? [];
    const resolvedValue = step.resolvedValue;

    const callbackScope: ScopeEnv = {};
    if (callbackParams.length > 0 && resolvedValue != null) {
      callbackScope[callbackParams[0]] = evalExpr(resolvedValue, scopeChain);
    }

    const label =
      step.bodyTasks.length > 0 ? step.bodyTasks.map((t) => t.task).join("; ") : "() => { ... }";
    const item: MicroQueueItem = {
      id: crypto.randomUUID(),
      task: label,
      type: "micro",
      bodyTasks: step.bodyTasks,
      callbackParams,
      resolvedValue,
      nextChain: next,
      ...(Object.keys(callbackScope).length > 0 && ({ callbackScope } as any)),
    };
    next = item;
  }

  return next ?? null;
};

export const pushMicroTask = (draft: Draft, task: Task) => {
  if (task.type !== "micro") return;

  const firstItem = buildChainItems((task as MicroTask).chain, draft.scopeChain);
  if (!firstItem) return;

  draft.microQueue.push(firstItem);
};

export const popAndAdvanceChain = (draft: Draft, item: MicroQueueItem) => {
  if (item.nextChain) {
    draft.microQueue.push({
      ...item.nextChain,
      id: crypto.randomUUID(),
    });
  }
  if ((item as any).callbackScope) {
    draft.scopeChain.pop();
  }
};
