import { Card, Divider, Flex, Typography, theme } from "antd";
import { calPercentual } from "@/utils/cart/calculeIncreaseOrDecrease";
import { formatCurrency } from "@/utils/formatCurrency";

const { Text } = Typography;

interface Props {
  subtotal: number;
  total: number;
  increase: Sale.increaseOrDecrease;
  decrease: Sale.increaseOrDecrease;
}

export default function CartSummary({
  subtotal,
  total,
  increase,
  decrease,
}: Props) {
  const { token } = theme.useToken();

  const increaseValue =
    increase?.value > 0 ? calPercentual(subtotal, increase) : 0;
  const decreaseValue =
    decrease?.value > 0 ? calPercentual(subtotal, decrease) : 0;

  return (
    <Card
      style={{
        background: token.colorBgContainer,
        borderRadius: token.borderRadiusLG,
        padding: token.paddingLG,
        boxShadow: "0 0 0 1px rgba(0,0,0,0.04)",
      }}
      className="!p-0"
    >
      <Flex vertical gap={token.marginXS}>
        {/* Subtotal */}
        <Flex justify="space-between" align="center">
          <Text type="secondary">Subtotal</Text>
          <Text>{formatCurrency(subtotal)}</Text>
        </Flex>

        {/* Acréscimo */}
        {increase?.value > 0 && (
          <Flex justify="space-between" align="center">
            <Text
              style={{
                color: token.colorSuccessText,
                fontSize: token.fontSizeSM,
              }}
            >
              Acréscimo
              {increase?.type === "PORCENTAGEM" && ` (${increase.value}%)`}
            </Text>
            <Text
              style={{
                color: token.colorSuccessText,
                fontSize: token.fontSizeSM,
              }}
            >
              + {formatCurrency(increaseValue)}
            </Text>
          </Flex>
        )}

        {/* Desconto */}
        {decrease?.value > 0 && (
          <Flex justify="space-between" align="center">
            <Text
              style={{
                color: token.colorErrorText,
                fontSize: token.fontSizeSM,
              }}
            >
              Desconto
              {decrease?.type === "PORCENTAGEM" && ` (${decrease?.value}%)`}
            </Text>
            <Text
              style={{
                color: token.colorErrorText,
                fontSize: token.fontSizeSM,
              }}
            >
              - {formatCurrency(decreaseValue)}
            </Text>
          </Flex>
        )}

        <Divider style={{ margin: `${token.marginXS}px 0` }} />

        {/* Total */}
        <Flex justify="space-between" align="center">
          <Text strong style={{ fontSize: token.fontSizeLG }}>
            Total
          </Text>
          <Text
            strong
            style={{
              fontSize: token.fontSizeLG,
              color: token.colorText,
            }}
          >
            {formatCurrency(total)}
          </Text>
        </Flex>
      </Flex>
    </Card>
  );
}
