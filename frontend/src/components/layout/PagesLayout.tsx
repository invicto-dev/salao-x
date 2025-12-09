import { Button, ButtonProps, Card, Result, Typography } from "antd";

type StringOrNode = String | React.ReactNode;

interface FilterProps {
  element: React.ReactNode;
}

interface Props {
  title?: StringOrNode;
  subtitle?: StringOrNode;
  filters?: FilterProps[];
  buttonsAfterFilters?: ButtonProps[];
  children?: React.ReactNode;
  Error?: {
    isError: boolean;
    onClick: () => void;
  };
}

const { Title, Text } = Typography;

export default function PagesLayout({
  title,
  subtitle,
  filters,
  buttonsAfterFilters,
  children,
  Error,
}: Props) {
  return (
    <div className="space-y-6">
      <div>
        {title && (
          <Title className="!mb-2" level={2}>
            {title}
          </Title>
        )}
        {subtitle && <Text type="secondary">{subtitle}</Text>}
      </div>
      {(filters || buttonsAfterFilters) && (
        <Card>
          <div className="flex flex-col lg:flex-row gap-8 justify-between">
            {filters && (
              <div className="flex flex-col sm:flex-row gap-2 flex-1">
                {filters.map((filter) => (
                  <>{filter.element}</>
                ))}
              </div>
            )}
            <div className="flex-row">
              {buttonsAfterFilters && (
                <div className="flex flex-col sm:flex-row gap-2 flex-1">
                  {buttonsAfterFilters.map((button, index) => (
                    <Button key={index} {...button} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
      <Card>
        {Error && Error.isError ? (
          <Result
            status="error"
            title={`Ocorreu um error ao carregar os dados`}
            subTitle="Tente novamente mais tarde..."
            extra={
              <Button type="primary" onClick={Error.onClick}>
                Tentar novamente
              </Button>
            }
          />
        ) : (
          children
        )}
      </Card>
    </div>
  );
}
