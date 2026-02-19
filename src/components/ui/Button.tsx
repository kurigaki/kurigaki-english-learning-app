import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  fullWidth?: boolean;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: `bg-gradient-to-r from-primary-500 via-primary-500 to-accent-500
            text-white font-bold shadow-lg shadow-primary-500/30
            hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-1 hover:scale-[1.02]
            active:scale-95 active:shadow-md`,
  secondary: `bg-white text-primary-600 font-bold
              border-2 border-primary-200 shadow-md
              hover:shadow-lg hover:border-primary-400 hover:-translate-y-1 hover:bg-primary-50/50
              active:scale-95
              dark:bg-slate-800 dark:text-primary-400 dark:border-slate-600
              dark:hover:border-primary-400`,
  ghost: `text-primary-500 font-medium
          hover:bg-primary-50 hover:text-primary-600
          dark:text-primary-400 dark:hover:bg-primary-900/30`,
  danger: `bg-gradient-to-r from-error-400 to-error-500
           text-white font-bold shadow-lg shadow-error-500/30
           hover:shadow-xl hover:shadow-error-500/40 hover:-translate-y-1
           active:scale-95`,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "py-2 px-4 text-sm rounded-xl",
  md: "py-3 px-6 text-base rounded-2xl",
  lg: "py-4 px-8 text-lg rounded-2xl",
};

export const Button = ({
  variant = "primary",
  size = "md",
  children,
  fullWidth = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? "w-full" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed transform-none" : ""}
        transform transition-all duration-200 ease-out
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
