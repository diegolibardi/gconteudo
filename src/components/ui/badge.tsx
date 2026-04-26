import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-violet-100 text-violet-700",
        draft: "border-transparent bg-gray-100 text-gray-600",
        scheduled: "border-transparent bg-amber-100 text-amber-700",
        published: "border-transparent bg-green-100 text-green-700",
        instagram: "border-transparent bg-pink-100 text-pink-700",
        facebook: "border-transparent bg-blue-100 text-blue-700",
        twitter: "border-transparent bg-sky-100 text-sky-700",
        linkedin: "border-transparent bg-blue-100 text-blue-800",
        tiktok: "border-transparent bg-gray-100 text-gray-800",
        youtube: "border-transparent bg-red-100 text-red-700",
        outline: "text-gray-700 border-gray-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
