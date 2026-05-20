import { cva, type VariantProps } from "class-variance-authority";

const badgeStyle = cva("text-xs font-medium rounded-xl py-1 px-2.5", {
  variants: {
    variant: {
      stack: "text-stack bg-stack/10",
      micro: "text-micro bg-micro/10",
      macro: "text-macro bg-macro/10",
    },
  },
});

interface BadgeProps extends VariantProps<typeof badgeStyle> {
  name: string;
}

export default function Badge({ variant, name }: BadgeProps) {
  return <span className={badgeStyle({ variant })}>{name}</span>;
}
