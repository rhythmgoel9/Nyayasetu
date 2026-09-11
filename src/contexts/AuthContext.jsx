import { createContext, useContext, useState, useCallback } from 'react';
import { mockUsers } from '../data/mockData';

const AuthContext = createContext();

// SIMULATED: In production, this would connect to a real authentication service

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (role, credentials = {}) => {
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: credentials.name || "AI Test User",
          email: credentials.email || "aitest@nyayasetu.com",
          password: credentials.password || "AItest@12345",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Backend login failed");
      }

      // Save JWT token for protected backend requests
      localStorage.setItem("token", data.token);

      // Preserve frontend mock user structure where needed
      const loggedInUser =
        data.user || mockUsers[role] || mockUsers.citizen;

      setUser(loggedInUser);
      setIsAuthenticated(true);

      return loggedInUser;
    } catch (error) {
      console.error("Backend login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("token");
  }, []);

  const sendOTP = useCallback(async (mobile) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      message: "OTP sent to " + mobile,
    };
  }, []);

  const verifyOTP = useCallback(async (mobile, otp) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (otp === "123456" || otp.length === 6) {
      return { success: true };
    }

    return {
      success: false,
      message: "Invalid OTP",
    };
  }, []);

  const verifyDigiLocker = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      success: true,
      data: {
        name: "Rajesh Kumar",
        dob: "1990-05-15",
        address: "42, Sector 15, Noida, Uttar Pradesh - 201301",
        aadhaarLast4: "4829",
        panVerified: true,
      },
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        sendOTP,
        verifyOTP,
        verifyDigiLocker,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}