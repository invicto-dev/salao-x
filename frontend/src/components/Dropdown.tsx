import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EllipsisVertical } from "lucide-react";

interface DropdownComponentProps {
  menu: {
    items: {
      key: string;
      label: string;
      icon?: React.ReactNode;
      onClick: (e: any) => void;
      danger?: boolean;
    }[];
  };
  icon?: React.ReactNode;
}

export default function DropdownComponent({ menu, icon }: DropdownComponentProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => e.stopPropagation()}
        >
          {icon || <EllipsisVertical size={16} />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {menu.items.map((item) => (
          <DropdownMenuItem
            key={item.key}
            onClick={(e) => {
              e.stopPropagation();
              item.onClick(e);
            }}
            className={item.danger ? "text-destructive focus:text-destructive" : ""}
          >
            {item.icon && <span className="mr-2">{item.icon}</span>}
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
