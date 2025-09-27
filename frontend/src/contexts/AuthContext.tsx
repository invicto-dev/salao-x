import http from "@/api/http";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface AuthContextType {
  user: Employee.Props | null;
  login: (email: string, password: string) => Promise<Employee.Props>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Employee.Props | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se há token salvo e buscar perfil do usuário
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await http.get("/auth/profile");
          if (response.status === 200) {
            const data = await response.data;
            setUser(data.data);
          } else {
            localStorage.removeItem("token");
          }
        } catch (error) {
          console.error("Erro ao verificar autenticação:", error);
          localStorage.removeItem("token");
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<Employee.Props> => {
    setIsLoading(true);

    try {
      const response = await http.post("/auth/login", {
        email,
        senha: password,
      });

      const data = await response.data;

      if (response.status !== 200) {
        throw new Error(data.error || "Erro ao fazer login");
      }

      // Salvar token e usuário
      localStorage.setItem("token", data.data.token);
      setUser(data.data.user);
      setIsLoading(false);

      return data.data.user;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
