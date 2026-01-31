import { useCategories, useCategoryModal } from "@/hooks/use-categories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Props {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  isFilter?: boolean;
  className?: string;
}

export default function CategorySelect({
  value,
  onChange,
  placeholder = "Selecione uma categoria",
  isFilter,
  className,
}: Props) {
  const { data: categories = [] } = useCategories({
    status: "true",
  });
  const { CategoryModal, toggleModal } = useCategoryModal(null);

  return (
    <>
      <div className={`flex flex-col gap-2 ${className}`}>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className={isFilter ? "min-w-[200px]" : "w-full"}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id.toString()}>
                {c.nome}
              </SelectItem>
            ))}
            {!isFilter && (
              <Button
                variant="ghost"
                className="w-full justify-start mt-2 px-2"
                onClick={(e) => {
                  e.preventDefault();
                  toggleModal();
                }}
              >
                <Plus size={14} className="mr-2" />
                Nova categoria
              </Button>
            )}
          </SelectContent>
        </Select>
      </div>
      {CategoryModal}
    </>
  );
}
