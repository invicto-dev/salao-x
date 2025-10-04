import { Card, CardProps } from "antd";

interface Props extends CardProps {
  disabled?: boolean;
}

export const CardWithDisabled = ({ disabled, ...props }: Props) => {
  return (
    <Card
      {...props}
      onClick={disabled ? null : props.onClick}
      className={disabled ? "cursor-not-allowed opacity-50" : ""}
    />
  );
};
