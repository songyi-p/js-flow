import type { Task } from "@/utils/types/parser";
import { AnimatePresence } from "framer-motion";
import { Badge, Dashboard } from "@/components/common";
import TaskBox from "@/components/common/TaskBox";

interface QueueProps {
  variant: "micro" | "macro";
  tasks: Task[];
  activeTaskId: string | null;
}

export default function Queue({ variant, tasks, activeTaskId }: QueueProps) {
  const isRunning = tasks.length > 0;

  return (
    <Dashboard
      title={variant === "micro" ? "🧬 마이크로 큐 | Micro-Queue" : "⏳ 매크로 큐 | Macro-Queue"}
      variant={variant}
      isRunning={isRunning}
      headerRight={<Badge variant="stack" isShow={isRunning} name="실행 중" />}
    >
      <div className="flex min-h-30 gap-2.5 overflow-x-auto">
        <AnimatePresence mode="popLayout">
          {tasks.map((task, index) => (
            <TaskBox
              key={task.id}
              variant={variant}
              task={task.task}
              isActive={task.id === activeTaskId || index === 0}
            />
          ))}
        </AnimatePresence>

        {tasks.length === 0 && (
          <div className="flex h-full min-h-30 w-full items-center justify-center text-sm text-gray-400 select-none">
            비어 있음
          </div>
        )}
      </div>
    </Dashboard>
  );
}
