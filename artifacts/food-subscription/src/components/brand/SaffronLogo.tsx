import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "w-7 h-7",
  md: "w-8 h-8",
  lg: "w-12 h-12",
  xl: "w-14 h-14",
} as const;

const wordmarkClasses = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
  xl: "text-2xl",
} as const;

type SaffronLogoProps = {
  size?: keyof typeof sizeClasses;
  showWordmark?: boolean;
  className?: string;
  wordmarkClassName?: string;
};

export function SaffronLogo({
  size = "md",
  showWordmark = false,
  className,
  wordmarkClassName,
}: SaffronLogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img
        src="/favicon.svg"
        alt="Saffron"
        className={cn(sizeClasses[size], "shrink-0")}
      />
      {showWordmark && (
        <span className={cn("font-serif font-bold text-foreground", wordmarkClasses[size], wordmarkClassName)}>
          Saffron.
        </span>
      )}
    </div>
  );
}
