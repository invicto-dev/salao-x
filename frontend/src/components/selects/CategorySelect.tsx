import { useCategories, useCategoryModal } from "@/hooks/use-categories";
import { Button, Select, SelectProps } from "antd";
import { Plus } from "lucide-react";
import { useState } from "react";

interface Props extends SelectProps {
  isFilter?: boolean;
}

export default function CategorySelect({ isFilter, ...props }: Props) {
  const { data: categories = [] } = useCategories({
    status: "true",
  });
  const { CategoryModal, toogleModal } = useCategoryModal(null);

  const options = categories.map((c) => ({
    value: c.id,
    label: c.nome,
  }));

  return (
    <>
      <Select
        showSearch
        allowClear
        optionFilterProp="label"
        placeholder="Selecione uma categoria"
        options={options}
        className={isFilter ? "min-w-[250px]" : "w-full"}
        popupRender={(options) => (
          <>
            {options}
            {!isFilter && (
              <Button
                type="text"
                className="w-full mt-1"
                icon={<Plus size={14} />}
                onClick={toogleModal}
              >
                Adicionar nova categoria
              </Button>
            )}
          </>
        )}
        {...props}
      />
      {CategoryModal}
    </>
  );
}
