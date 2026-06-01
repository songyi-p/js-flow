import { AnimatePresence } from "framer-motion";
import type { Task } from "@/utils/types/parser";
import DashboardCard from "../common/DashboardCard";
import TaskBox from "../common/TaskBox";
import Badge from "../common/Badge";

interface CallStackProps {
  tasks: Task[];
  activeTaskId: string | null;
}

export default function CallStack({ tasks, activeTaskId }: CallStackProps) {
  const isRunning = tasks.length > 0;
  const visible = tasks.filter((t) => !(t as any)._isEndMarker);

  return (
    <DashboardCard
      title="📦 콜스택 | Call-Stack"
      variant="stack"
      isRunning={isRunning}
      headerRight={<Badge variant="stack" isShow={isRunning} name="실행 중" />}
    >
      <div className="flex h-full scrollbar-none flex-col-reverse gap-2.5 overflow-y-auto pb-1">
        <AnimatePresence mode="popLayout">
          {visible.map((task) => (
            <TaskBox
              key={task.id}
              variant="stack"
              task={task.task}
              isActive={task.id === activeTaskId}
            />
          ))}
        </AnimatePresence>

        {visible.length === 0 && (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            콜스택이 비어 있습니다.
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
