import React, { createContext, useState, useContext } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { id: string; username: string } | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ id: string; username: string } | null>(null);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // 管理员账户列表
      const adminAccounts = [
        { id: '1', username: 'admin', password: 'password' },
        { id: '2', username: 'sjw', password: '123456' },
        { id: '3', username: 'xsm', password: '123456' }
      ];

      // 查找匹配的账户
      const matchedAccount = adminAccounts.find(
        account => account.username.toLowerCase() === username.toLowerCase() && account.password === password
      );

      if (matchedAccount) {
        setUser({ id: matchedAccount.id, username: matchedAccount.username });
        setIsAuthenticated(true);
        // Store auth state in localStorage for persistence
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify({ id: matchedAccount.id, username: matchedAccount.username }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    // Clear auth state from localStorage
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
  };

  // Check for existing auth state on mount
  React.useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    const storedUser = localStorage.getItem('user');
    
    if (storedAuth === 'true' && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};