import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean;
}

export const CardWithDisabled = ({ disabled, children, className, onClick, ...props }: Props) => {
  return (
    <Card
      {...props}
      onClick={disabled ? undefined : onClick}
      className={cn(
        "transition-all",
        disabled ? "cursor-not-allowed opacity-50 grayscale" : "cursor-pointer hover:border-primary/50 hover:bg-muted/50",
        className
      )}
    >
      {children}
    </Card>
  );
};
