import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const buttonStyle = cva(
  "inline-flex items-center justify-center font-semibold transition-all duration-150 ease-in-out select-none active:scale-95 disabled:scale-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-gray-900 border border-gray-200 text-gray-500 enabled:hover:bg-gray-100 shadow-sm",
        primary: "bg-primary text-gray-900 enabled:hover:bg-primary-hover shadow-sm",
        secondary: "bg-gray-100 text-gray-500 enabled:hover:bg-gray-200",
        danger: "bg-red-50 text-danger enabled:hover:bg-danger-hover",
      },
      shape: {
        square: "rounded-xl px-5 py-2.5 text-sm",
        round: "w-16 h-16 rounded-full p-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      shape: "square",
    },
  },
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonStyle> {
  children: ReactNode;
}

export default function Button({ variant, shape, children, className, ...props }: ButtonProps) {
  return (
    <button className={twMerge(buttonStyle({ variant, shape }), className)} {...props}>
      {children}
    </button>
  );
}
