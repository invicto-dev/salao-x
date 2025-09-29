import { Role } from "@prisma/client";

export const roleHierarchy: Record<Role, number> = {
  [Role.ROOT]: 5,
  [Role.ADMIN]: 4,
  [Role.GERENTE]: 3,
  [Role.SECRETARIO]: 2,
  [Role.FUNCIONARIO]: 1,
};

/**
 * Verifica se um usuário tem a permissão necessária para acessar um recurso.
 * * @param userRole O papel do usuário que está tentando acessar.
 * @param requiredRole O papel mínimo necessário para o acesso.
 * @returns {boolean} Retorna 'true' se o nível do usuário for maior ou igual ao nível exigido.
 */
export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  const userLevel = roleHierarchy[userRole] ?? 0;
  const requiredLevel = roleHierarchy[requiredRole] ?? 0;

  return userLevel >= requiredLevel;
}

/**
 * Verifica se um usuário tem a permissão necessária para atuar em outro usuario.
 * @param userSourceRole Usuario que está tentando atuar.
 * @param userTargetRole Usuario que esta recebendo a ação.
 * @returns {boolean} Retorna 'true' se o nivel do usuario da ação for maior do que o usuario alvo.
 */

export function hierarchyPositionCheck(
  userSourceRole: Role,
  userTargetRole: Role
): boolean {
  const userSourceLevel = roleHierarchy[userSourceRole] ?? 0;
  const userTargetLevel = roleHierarchy[userTargetRole] ?? 0;

  return userSourceLevel <= userTargetLevel;
}
