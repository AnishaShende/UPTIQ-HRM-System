import React from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg" | "xl";
  shadow?: "none" | "sm" | "md" | "lg" | "card";
  borderRadius?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = "lg",
  shadow = "card",
  borderRadius = "xl",
}) => {
  const paddingClasses = {
    sm: "p-sm",
    md: "p-md",
    lg: "p-lg",
    xl: "p-xl",
  };

  const shadowClasses = {
    none: "shadow-none",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    card: "shadow-card",
  };

  const borderRadiusClasses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
  };

  return (
    <div
      className={cn(
        "bg-white border border-gray-200",
        paddingClasses[padding],
        shadowClasses[shadow],
        borderRadiusClasses[borderRadius],
        className
      )}
    >
      {children}
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: "purple" | "green" | "orange" | "blue";
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "green",
  className,
}) => {
  const gradientClasses = {
    purple: "bg-gradient-to-br from-purple-100 to-purple-200",
    green: "bg-gradient-to-br from-green-100 to-green-200",
    orange: "bg-gradient-to-br from-orange-100 to-orange-200",
    blue: "bg-gradient-to-br from-blue-100 to-blue-200",
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden",
        gradientClasses[variant],
        className
      )}
      padding="md"
      shadow="card"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-700 opacity-90">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-600 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
            <Icon className="w-6 h-6 text-gray-700" />
          </div>
        )}
      </div>
    </Card>
  );
};

interface ListCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export const ListCard: React.FC<ListCardProps> = ({
  title,
  children,
  className,
  headerAction,
}) => {
  return (
    <Card className={cn("", className)}>
      {(title || headerAction) && (
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {headerAction}
        </div>
      )}
      <div className="space-y-1">{children}</div>
    </Card>
  );
};

interface ListItemProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const ListItem: React.FC<ListItemProps> = ({
  children,
  className,
  onClick,
}) => {
  return (
    <div
      className={cn(
        "p-4 rounded-md hover:bg-gray-50 transition-colors duration-200",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
