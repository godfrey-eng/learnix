import { type ReactNode } from "react";
import type { IconName } from "@/types";
import { Icon } from "@/components/Icon";

export function Button({
  children,
  icon,
  variant = "primary",
  onClick,
  className = "",
}: {
  children: ReactNode;
  icon?: IconName;
  variant?: "primary" | "secondary" | "ghost";
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button className={`button button-${variant} ${className}`} onClick={onClick} type="button">
      {icon && <Icon name={icon} size={18} />}
      {children}
    </button>
  );
}
