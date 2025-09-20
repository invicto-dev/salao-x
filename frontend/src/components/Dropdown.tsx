import { Button, Dropdown, DropDownProps } from "antd";
import { EllipsisVertical } from "lucide-react";

interface DropdownProps extends DropDownProps {}

export default function DropdownComponent({ ...props }: DropdownProps) {
  return (
    <Dropdown trigger={["click"]} {...props}>
      <Button
        onClick={(e) => e.stopPropagation()}
        icon={<EllipsisVertical size={16} />}
        type="text"
      />
    </Dropdown>
  );
}
