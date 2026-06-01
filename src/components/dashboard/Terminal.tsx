import { cva } from "class-variance-authority";
import type { ConsoleEntry } from "@/utils/types/store";
import DashboardCard from "../common/DashboardCard";

const logLineStyle = cva("font-mono text-sm leading-relaxed", {
  variants: {
    kind: {
      log: "text-emerald-400",
      warn: "text-yellow-400",
      error: "text-red-400",
      system: "text-cyan-400 font-semibold",
    },
  },
  defaultVariants: {
    kind: "log",
  },
});

const kindPrefix: Record<ConsoleEntry["kind"], string> = {
  log: "",
  warn: "[warn] ",
  error: "[error] ",
  system: "> ",
};

interface TerminalProps {
  logs: ConsoleEntry[];
  onClear: () => void;
}

export default function Terminal({ logs, onClear }: TerminalProps) {
  return (
    <DashboardCard
      title="💻 브라우저 콘솔 출력 결과 | Console"
      headerRight={
        <button
          onClick={onClear}
          className="cursor-pointer text-xs text-gray-400 hover:text-gray-600"
        >
          기록 삭제
        </button>
      }
      className="w-full"
    >
      <div className="max-h-50 min-h-35 w-full overflow-y-auto rounded-xl bg-[#111827] p-5 select-text">
        {logs.length === 0 ? (
          <span className="font-mono text-sm text-gray-500">콘솔 출력이 없습니다.</span>
        ) : (
          logs.map((log) => (
            <div key={log.id} className={logLineStyle({ kind: log.kind })}>
              {kindPrefix[log.kind]}
              {log.message}
            </div>
          ))
        )}
      </div>
    </DashboardCard>
  );
}
