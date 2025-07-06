import React, { createContext, useState, useContext } from 'react';
import { settingsService } from '../firebase/services';

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
      // 管理员账户列表 - 只保留sjw和xsm
      const adminAccounts = [
        { id: '1', username: 'sjw', password: '123456' },
        { id: '2', username: 'xsm', password: '123456' }
      ];

      // 查找匹配的账户
      const matchedAccount = adminAccounts.find(
        account => account.username.toLowerCase() === username.toLowerCase() && account.password === password
      );

      if (matchedAccount) {
        const userInfo = { id: matchedAccount.id, username: matchedAccount.username };
        setUser(userInfo);
        setIsAuthenticated(true);
        
        // Store auth state in Firebase for persistence
        try {
          await settingsService.setSetting('authSession', {
            isAuthenticated: true,
            user: userInfo,
            loginTime: new Date().toISOString()
          });
          console.log('🔥 认证状态已保存到Firebase');
        } catch (error) {
          console.error('❌ 保存认证状态到Firebase失败:', error);
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    setUser(null);
    setIsAuthenticated(false);
    
    // Clear auth state from Firebase
    try {
      await settingsService.deleteSetting('authSession');
      console.log('🔥 认证状态已从Firebase清除');
    } catch (error) {
      console.error('❌ 清除Firebase认证状态失败:', error);
    }
  };

  // Check for existing auth state from Firebase on mount
  React.useEffect(() => {
    const checkAuthState = async () => {
      try {
        const authSession = await settingsService.getSetting('authSession');
        
        if (authSession?.isAuthenticated && authSession?.user) {
          setIsAuthenticated(true);
          setUser(authSession.user);
          console.log('🔥 从Firebase恢复认证状态:', authSession.user.username);
        }
      } catch (error) {
        console.error('❌ 检查Firebase认证状态失败:', error);
      }
    };
    
    checkAuthState();
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