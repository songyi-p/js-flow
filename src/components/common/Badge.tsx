import { cva, type VariantProps } from "class-variance-authority";

const badgeStyle = cva("text-xs font-medium rounded-xl py-1 px-2.5 animate-pulse", {
  variants: {
    variant: {
      stack: "text-stack bg-stack/10",
      micro: "text-micro bg-micro/10",
      macro: "text-macro bg-macro/10",
    },
  },
});

interface BadgeProps extends Required<VariantProps<typeof badgeStyle>> {
  name: string;
  isShow?: boolean;
}

export default function Badge({ variant, name, isShow = true }: BadgeProps) {
  if (!isShow) return null;
  return <span className={badgeStyle({ variant })}>{name}</span>;
}
