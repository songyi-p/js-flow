import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";

const taskBoxStyle = cva(
  "relative flex shrink-0 bg-white border border-gray-200 rounded-xl p-3 transition-all duration-200 select-none shadow-sm text-gray-500 border-l-4",
  {
    variants: {
      variant: {
        stack: "w-full min-h-8",
        micro: "w-32 h-32",
        macro: "w-32 h-32",
      },
      active: {
        true: "border-y-gray-200 border-r-gray-200",
      },
    },
    compoundVariants: [
      {
        variant: "stack",
        active: true,
        class: "border-l-stack bg-linear-to-r from-stack/20 to-transparent",
      },
      {
        variant: "micro",
        active: true,
        class: "border-l-micro bg-linear-to-b from-micro/20 to-transparent",
      },
      {
        variant: "macro",
        active: true,
        class: "border-l-macro bg-linear-to-b from-macro/20 to-transparent",
      },
    ],
  },
);

const arrowColor = {
  stack: "text-stack",
  micro: "text-micro",
  macro: "text-macro",
} as const;

interface TaskBoxProps {
  variant: NonNullable<VariantProps<typeof taskBoxStyle>["variant"]>;
  task: string;
  isActive?: boolean;
  className?: string;
}

export default function TaskBox({ variant, task, isActive = false, className }: TaskBoxProps) {
  return (
    <motion.div
      variants={{
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { type: "decay", stiffness: 200, damping: 20 } },
        exit: {
          opacity: 0,
          y: variant === "stack" ? -40 : 0,
          x: variant === "stack" ? 0 : -40,
          transition: { duration: 0.15, ease: "linear" },
        },
      }}
      initial="initial"
      animate="animate"
      exit="exit"
      layout
      className={twMerge(taskBoxStyle({ variant, active: isActive }), className)}
    >
      <div className="flex h-full min-h-0 w-full items-center gap-2">
        {isActive && (
          <span className={twMerge("mt-0.5 shrink-0 animate-pulse text-sm", arrowColor[variant])}>
            ▶
          </span>
        )}
        <div
          className={twMerge(
            "max-h-full w-full scrollbar-none overflow-y-auto py-0.5 text-sm font-medium break-all select-text",
            isActive && "font-semibold",
          )}
        >
          {task}
        </div>
      </div>
    </motion.div>
  );
}
