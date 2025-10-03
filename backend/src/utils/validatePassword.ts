// utils/validatePassword.ts

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
  
    if (password.length < 8) {
      errors.push("A senha deve ter no mínimo 8 caracteres.");
    }
  
    if (!/[A-Z]/.test(password)) {
      errors.push("A senha deve conter pelo menos uma letra maiúscula.");
    }
  
    if (!/[0-9]/.test(password)) {
      errors.push("A senha deve conter pelo menos um número.");
    }
  
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
      errors.push("A senha deve conter pelo menos um caractere especial.");
    }
  
    return {
      valid: errors.length === 0,
      errors,
    };
  }
  