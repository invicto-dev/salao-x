export const formatRoleName = (role: string) => {
  switch (role) {
    case "ROOT":
      return "Administrador";
    case "ADMIN":
      return "Administrador";
    case "GERENTE":
      return "Gerente";
    case "SECRETARIO":
      return "Secretário";
    case "FUNCIONARIO":
      return "Funcionário";
    default:
      return "Usuário";
  }
};
