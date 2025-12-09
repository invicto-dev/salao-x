import {
  createCategory,
  deleteCategory,
  getCategory,
  getCategories,
  updateCategory,
} from "@/api/categories";
import { NameInput } from "@/components/inputs/NameInput";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Col, Form, message, Modal, Row, Switch } from "antd";
import TextArea from "antd/es/input/TextArea";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";

export const useCategories = (params?: Params) => {
  return useQuery<Category.Props[]>({
    queryKey: ["get-categories", params],
    queryFn: () => getCategories(params),
  });
};

export const useCategory = (id: string) => {
  return useQuery<Category.Props>({
    queryKey: ["get-categories", id],
    queryFn: () => getCategory(id),
  });
};

export const useCategoryCreate = () => {
  const queryClient = useQueryClient();
  const res = useMutation({
    mutationFn: async (body: Category.Props) => {
      return await createCategory(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-categories"] });
      message.success("Categoria criada com sucesso.");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      message.error(error.response.data.error);
      return error;
    },
  });

  return res;
};

export const useCategoryUpdate = () => {
  const queryClient = useQueryClient();
  const res = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Category.Props }) => {
      return await updateCategory(id, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-categories"] });
      message.success("Categoria atualizada com sucesso.");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      message.error(error.response.data.error);
    },
  });

  return res;
};

export const useCategoryDelete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return await deleteCategory(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-categories"] });
      message.success("Categoria excluída com sucesso.");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      message.error(error.response.data.error);
    },
  });
};

export const useCategoryModal = (initialValues?: Category.Props) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const isEdit = Boolean(initialValues?.id);

  const toggle = () => setModalVisible((v) => !v);

  const { mutateAsync: create, isPending: isCreate } = useCategoryCreate();
  const { mutateAsync: update, isPending: isUpdate } = useCategoryUpdate();

  const handleCancel = () => {
    form.resetFields();
    setModalVisible(false);
  };

  useEffect(() => {
    if (modalVisible) {
      if (isEdit && initialValues) {
        form.setFieldsValue({
          ...initialValues,
          ativo: initialValues.ativo ?? true, 
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ ativo: true });
      }
    }
  }, [modalVisible, initialValues]);

  const onFinish = async (values: Category.Props) => {
    try {
      if (isEdit) {
        await update({ id: initialValues.id, body: values });
      } else {
        await create(values);
      }

      handleCancel();
    } catch (error) {
      console.error(error);
    }
  };

  const CategoryModal = (
    <Modal
      title={isEdit ? "Editar Categoria" : "Nova Categoria"}
      centered
      open={modalVisible}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      okText={isEdit ? "Salvar" : "Cadastrar"}
      okButtonProps={{
        loading: isCreate || isUpdate
      }}
      confirmLoading={isCreate || isUpdate}
      width={650}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={16}>
          <Col xs={24} lg={18}>
            <Form.Item
              label="Nome"
              name="nome"
              rules={[{ required: true, message: "Nome é obrigatório" }]}
            >
              <NameInput placeholder="Ex: Serviços Capilares" />
            </Form.Item>
          </Col>

          <Col xs={24} lg={5}>
            <Form.Item label="Status" name="ativo" valuePropName="checked">
              <Switch checkedChildren="Ativo" unCheckedChildren="Inativo" />
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col xs={24}>
            <Form.Item label="Descrição" name="descricao">
              <TextArea rows={3} placeholder="Descreva a categoria..." />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );

  return {
    toggleModal: toggle,
    CategoryModal,
  };
};
