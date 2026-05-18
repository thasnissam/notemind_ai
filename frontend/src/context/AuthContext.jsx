import { createContext, useContext, useState, useEffect } from 'react';
// Added apiSignup to the imports
import { apiGetMe, apiLogout, apiLogin, apiSignup } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const token = localStorage.getItem('notemind_token');
        if (token) {
          const userData = await apiGetMe();
          setUser(userData);
        }
      } catch (err) {
        apiLogout();
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  const login = async (username, password) => {
    const data = await apiLogin(username, password);
    const userData = await apiGetMe();
    setUser(userData);
    return data;
  };

  const signup = async (username, password) => {
    const data = await apiSignup(username, password);
    return data;
  };

  const logout = () => {
    apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);