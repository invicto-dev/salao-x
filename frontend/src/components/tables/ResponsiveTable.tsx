import { List, Table, TableColumnProps, TableProps } from "antd";

interface Props<T> {
  dataSource: T[];
  columns: TableColumnProps<T>[];
  renderItem?: (item: T) => JSX.Element;
  locale?: {
    emptyText: string;
  };
  onRow?: TableProps<T>["onRow"];
  rowKey?: TableProps<T>["rowKey"];
  rowClassName?: TableProps<T>["rowClassName"];
  loading?: boolean;
  scroll?: TableProps<T>["scroll"];
  size?: TableProps<T>["size"];
  pagination?: TableProps<T>["pagination"];
  className?: string;
}

export const ResponsiveTable = <T,>({
  dataSource,
  columns,
  renderItem,
  locale,
  loading,
  onRow,
  rowKey,
  rowClassName,
  scroll,
  size,
  pagination,
  className,
}: Props<T>) => {
  return (
    <>
      <Table
        className={`hidden lg:block ${className}`}
        dataSource={dataSource}
        columns={columns}
        locale={locale}
        rowKey={rowKey || "id"}
        loading={loading}
        onRow={onRow}
        scroll={scroll}
        rowClassName={rowClassName}
        size={size}
        pagination={pagination}
      />
      <List
        size="small"
        className="lg:hidden"
        dataSource={dataSource}
        renderItem={renderItem}
        loading={loading}
        locale={locale}
      />
    </>
  );
};
