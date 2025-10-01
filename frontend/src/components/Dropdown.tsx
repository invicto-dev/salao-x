import { Button, Dropdown, DropDownProps } from "antd";
import { EllipsisVertical } from "lucide-react";

interface DropdownProps extends DropDownProps {
  icon?: React.ReactNode;
}

export default function DropdownComponent({ ...props }: DropdownProps) {
  return (
    <Dropdown trigger={["click"]} {...props}>
      <Button
        onClick={(e) => e.stopPropagation()}
        icon={props.icon || <EllipsisVertical size={14} />}
        type="text"
      />
    </Dropdown>
  );
}
