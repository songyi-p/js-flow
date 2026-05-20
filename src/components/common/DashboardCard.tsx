import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const dashboardStyle = cva(
  "flex flex-col bg-white border border-gray-200 rounded-2xl p-6 shadow-xs",
  {
    variants: {
      variant: {
        stack: "border-stack",
        micro: "border-micro",
        macro: "border-macro",
      },
    },
  },
);

interface DashboardCardProps extends VariantProps<typeof dashboardStyle> {
  title: string;
  isRunning?: boolean;
  headerRight?: ReactNode;
  className?: string;
  children: ReactNode;
}

export default function DashboardCard({
  title,
  isRunning = true,
  headerRight,
  variant,
  children,
  className,
}: DashboardCardProps) {
  return (
    <section
      className={twMerge(dashboardStyle({ variant }), !isRunning && "border-gray-200", className)}
    >
      <div className="mb-4 flex items-center justify-between select-none">
        <h3 className="flex items-center gap-1.5 font-semibold">{title}</h3>
        {headerRight && <div className="flex items-center">{headerRight}</div>}
      </div>
      <div className="w-full flex-1">{children}</div>
    </section>
  );
}
