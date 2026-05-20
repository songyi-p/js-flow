import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";

const taskBoxStyle = cva(
  "relative flex bg-white border border-gray-200 rounded-xl p-3 transition-all duration-200 select-none shadow-sm",
  {
    variants: {
      variant: {
        stack: "w-full min-h-8 text-gray-600",
        micro: "w-32 h-32 items-center text-micro",
        macro: "w-32 h-32 items-center text-macro",
      },
    },
  },
);

interface TaskBoxProps extends Required<VariantProps<typeof taskBoxStyle>> {
  task: string;
  isFirst?: boolean;
  className?: string;
}

export default function TaskBox({ variant, task, isFirst = false, className }: TaskBoxProps) {
  const isStack = variant === "stack";

  return (
    <motion.div
      variants={{
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { type: "decay", stiffness: 200, damping: 20 } },
        exit: {
          opacity: 0,
          y: isStack ? -40 : 0,
          x: isStack ? 0 : -40,
          transition: { duration: 0.15, ease: "linear" },
        },
      }}
      initial="initial"
      animate="animate"
      exit="exit"
      layout
      className={twMerge(taskBoxStyle({ variant }), className)}
    >
      <div
        className={twMerge(
          "max-h-full w-full scrollbar-none overflow-y-auto py-1 text-sm leading-snug font-medium break-all",
          isFirst ? (isStack ? "pr-6" : "pr-4") : "",
        )}
      >
        {task}
      </div>

      {isFirst && (
        <span
          className={twMerge(
            "absolute z-10 text-sm font-bold",
            isStack ? "text-stack top-4 right-4" : "top-3 right-2.5",
          )}
        >
          ★
        </span>
      )}
    </motion.div>
  );
}
