import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import apiClient from '../../http-commons';

interface MemberInfo {
  id: number;
  name: string;
  email: string | null;
  picture: string | null;
}

interface AuthContextType {
  member: MemberInfo | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  refetchMember: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // HttpOnly 쿠키는 JS에서 읽을 수 없으므로 API 호출로 로그인 여부 확인
  const fetchMember = async () => {
    try {
      const { status, data } = await apiClient.get('/api/member/me');
      setMember(status === 204 ? null : data);
    } catch {
      setMember(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMember();
  }, []);

  const logout = async () => {
    try {
      await apiClient.delete('/api/auth/logout');
    } finally {
      setMember(null);
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        member,
        isLoggedIn: !!member,
        isLoading,
        logout,
        refetchMember: fetchMember,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
