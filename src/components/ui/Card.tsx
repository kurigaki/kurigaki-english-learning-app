import { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
};

const paddingStyles = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export const Card = ({
  children,
  className = "",
  hover = false,
  padding = "md",
}: CardProps) => {
  return (
    <div
      className={`
        bg-white rounded-3xl shadow-lg shadow-slate-200/50
        transition-all duration-300 ease-out
        border border-slate-100
        dark:bg-slate-800 dark:shadow-black/20 dark:border-slate-700
        ${paddingStyles[padding]}
        ${hover ? "hover:shadow-xl hover:shadow-primary-200/30 hover:-translate-y-2 hover:border-primary-200 cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

type StatsCardProps = {
  label: string;
  value: string | number;
  icon?: ReactNode;
  color?: "primary" | "success" | "error" | "accent";
};

const colorStyles = {
  primary: "text-primary-600 from-primary-50 to-primary-100/50 border-primary-200/50 dark:text-primary-400 dark:from-slate-800 dark:to-slate-700 dark:border-slate-600",
  success: "text-success-600 from-success-50 to-green-100/50 border-success-200/50 dark:text-success-400 dark:from-slate-800 dark:to-slate-700 dark:border-slate-600",
  error: "text-error-600 from-error-50 to-red-100/50 border-error-200/50 dark:text-error-400 dark:from-slate-800 dark:to-slate-700 dark:border-slate-600",
  accent: "text-accent-600 from-accent-50 to-cyan-100/50 border-accent-200/50 dark:text-accent-400 dark:from-slate-800 dark:to-slate-700 dark:border-slate-600",
};

export const StatsCard = ({
  label,
  value,
  icon,
  color = "primary",
}: StatsCardProps) => {
  const colorClass = colorStyles[color];
  const [textColor, ...bgClasses] = colorClass.split(" ");

  return (
    <div className={`bg-gradient-to-br ${bgClasses.join(" ")} rounded-2xl p-4 text-center border transition-all duration-200 hover:scale-105`}>
      {icon && <div className="text-2xl mb-2">{icon}</div>}
      <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">{label}</p>
      <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
    </div>
  );
};
