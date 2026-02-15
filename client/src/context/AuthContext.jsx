import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const data = localStorage.getItem("user");
    return data ? JSON.parse(data) : null;
  });

  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const loginAdmin = async (email, password) => {
    const { data } = await API.post("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
    navigate("/dashboard");
  };

  const requestOtp = async (email) => {
    await API.post("/auth/otp-request", { email });
  };

  const verifyOtp = async (email, otp) => {
    const { data } = await API.post("/auth/otp-verify", { email, otp });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
    
    // FIX: Dynamically route based on the role returned from the backend
    if (data.role === 'ADMIN' || data.role === 'HR') {
      navigate("/dashboard");
    } else {
      navigate("/myspace");
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, ready, loginAdmin, requestOtp, verifyOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);