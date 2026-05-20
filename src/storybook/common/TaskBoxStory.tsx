import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import TaskBox from "@/components/common/TaskBox";
import Button from "@/components/common/Button";

const initialStack = [
  { id: "s1", task: "console.log() - 세번째 태스크" },
  { id: "s2", task: "console.log() - 두번째 태스크" },
  {
    id: "s3",
    task: "긴 글자 테스트용 console.log() console.log() console.log() console.log() console.log() console.log() - 첫번째 태스크",
  },
];

const initialQueue = [
  { id: "q1", task: "setTimeout() 콜백함수A", type: "macro" as const },
  { id: "q2", task: "Promise 콜백함수B", type: "micro" as const },
  {
    id: "q3",
    task: "긴 글자 테스트용 console.log() console.log() console.log() console.log() console.log() console.log()",
    type: "micro" as const,
  },
];

export default function TaskBoxStory() {
  const [stacks, setStacks] = useState(initialStack);
  const [queues, setQueues] = useState(initialQueue);

  // 🔴 스택 POP
  const popStack = () => {
    setStacks((prev) => prev.slice(1));
  };

  // 🔵 큐 SHIFT
  const shiftQueue = () => {
    setQueues((prev) => prev.slice(1));
  };

  // 🔄 리셋
  const resetAll = () => {
    setStacks(initialStack);
    setQueues(initialQueue);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex justify-center gap-2 rounded-xl border border-gray-300 bg-gray-50/50 p-3">
        <Button onClick={popStack} variant="primary">
          스택 Pop
        </Button>
        <Button onClick={shiftQueue} variant="danger">
          큐 Shift
        </Button>
        <Button onClick={resetAll} variant="secondary">
          리셋
        </Button>
      </div>

      <section className="flex flex-col gap-3 rounded-2xl border border-gray-300 bg-gray-50/50 p-6">
        <div className="flex flex-col gap-3">
          <h4 className="font-bold text-gray-400">콜스택 (CALL STACK)</h4>
          <AnimatePresence mode="popLayout">
            {stacks.map((item, index) => (
              <TaskBox key={item.id} task={item.task} isFirst={index === 0} variant="stack" />
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <h4 className="font-bold text-gray-400">태스크 큐 (TASK QUEUE)</h4>
          <div className="flex scrollbar-none gap-4 overflow-x-auto py-2">
            <AnimatePresence mode="popLayout">
              {queues.map((item, index) => (
                <TaskBox key={item.id} task={item.task} isFirst={index === 0} variant={item.type} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
}
