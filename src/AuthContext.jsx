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
    localStorage.setItem("hmc_token", data.accessToken);
    localStorage.setItem("hmc_refresh_token", data.refreshToken);
    localStorage.setItem("hmc_user", JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const signup = async (name, email, password) => {
    const data = await api.signup(name, email, password);
    localStorage.setItem("hmc_token", data.accessToken);
    localStorage.setItem("hmc_refresh_token", data.refreshToken);
    localStorage.setItem("hmc_user", JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    api.logout(); // best-effort server-side refresh token revoke, fire-and-forget
    localStorage.removeItem("hmc_token");
    localStorage.removeItem("hmc_refresh_token");
    localStorage.removeItem("hmc_user");
    setUser(null);
  };

  const updateStoredUser = (updatedUser, newAccessToken, newRefreshToken) => {
    if (newAccessToken) localStorage.setItem("hmc_token", newAccessToken);
    if (newRefreshToken) localStorage.setItem("hmc_refresh_token", newRefreshToken);
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