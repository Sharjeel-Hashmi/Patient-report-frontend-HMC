import { createContext, useContext, useState, useEffect } from "react";
import { api } from "./api/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("hmc_token");
    const storedUser = localStorage.getItem("hmc_user");
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    localStorage.setItem("hmc_token", data.token);
    localStorage.setItem("hmc_user", JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const signup = async (name, email, password) => {
    const data = await api.signup(name, email, password);
    localStorage.setItem("hmc_token", data.token);
    localStorage.setItem("hmc_user", JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("hmc_token");
    localStorage.removeItem("hmc_user");
    setUser(null);
  };

  const updateStoredUser = (updatedUser, newToken) => {
    if (newToken) localStorage.setItem("hmc_token", newToken);
    localStorage.setItem("hmc_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateStoredUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
