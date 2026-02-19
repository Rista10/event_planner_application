import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { User, LoginRequest, SignupRequest } from '../types/auth.ts'
import { loginApi, signupApi, logoutApi, refreshTokenApi } from '../services/auth.ts';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): ReactNode {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      refreshTokenApi()
        .then((data) => {
          sessionStorage.setItem('accessToken', data.accessToken);
          setUser(data.user);
        })
        .catch(() => {
          sessionStorage.removeItem('accessToken');
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (data: LoginRequest): Promise<void> => {
    const result = await loginApi(data);
    sessionStorage.setItem('accessToken', result.accessToken);
    setUser(result.user);
  }, []);

  const signup = useCallback(async (data: SignupRequest): Promise<void> => {
    const result = await signupApi(data);
    sessionStorage.setItem('accessToken', result.accessToken);
    setUser(result.user);
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await logoutApi();
    sessionStorage.removeItem('accessToken');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
