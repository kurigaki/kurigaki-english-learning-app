type ProgressBarProps = {
  current: number;
  total: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "white";
};

const sizeStyles = {
  sm: "h-2",
  md: "h-3",
  lg: "h-4",
};

const variantStyles = {
  default: {
    bg: "bg-primary-100 dark:bg-slate-700",
    bar: "bg-gradient-to-r from-primary-400 to-accent-400",
    labelText: "text-slate-500 dark:text-slate-400",
    percentText: "text-primary-500 dark:text-primary-400",
  },
  white: {
    bg: "bg-white/30",
    bar: "bg-white",
    labelText: "text-white/80",
    percentText: "text-white",
  },
};

export const ProgressBar = ({
  current,
  total,
  showLabel = true,
  size = "md",
  variant = "default",
}: ProgressBarProps) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const styles = variantStyles[variant];

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className={`text-sm ${styles.labelText}`}>
            {current} / {total}
          </span>
          <span className={`text-sm font-medium ${styles.percentText}`}>
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div className={`${sizeStyles[size]} ${styles.bg} rounded-full overflow-hidden`}>
        <div
          className={`h-full ${styles.bar} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
