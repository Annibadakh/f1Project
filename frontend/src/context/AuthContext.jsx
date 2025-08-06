import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Set Axios base URL globally (adjust for production)
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

        try {
          const response = await axios.get('/api/auth/profile');
          setUser(response.data.user);
        } catch (error) {
          console.error('🔒 Token validation failed:', error);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    console.log('🔑 Attempting login with:', email, password);
    try {
      const response = await axios.post('/api/auth/login', { email, password });

      const { token: newToken, user: userData } = response.data;

      setToken(newToken);
      setUser(userData);

      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      console.log('✅ Login successful:', userData);
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const signup = async (name, email, password, role = 'Admin') => {
    console.log('📝 Attempting signup with:', name, email, role);
    try {
      const response = await axios.post('/api/public/signup', { 
        name, 
        email, 
        password, 
        role 
      });

      console.log('✅ Signup successful:', response.data);
    } catch (error) {
      console.error('❌ Signup failed:', error);
      throw new Error(error.response?.data?.message || 'Signup failed');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    token,
    login,
    signup,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
