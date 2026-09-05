import { createContext, useContext, useState, useCallback } from 'react';
import { mockUsers } from '../data/mockData';

const AuthContext = createContext();

// SIMULATED: In production, this would connect to a real authentication service
// (e.g., DigiLocker OAuth, UIDAI Aadhaar eKYC, or a government SSO)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (role, credentials) => {
    setIsLoading(true);
    // SIMULATED: Mock authentication delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockUser = mockUsers[role] || mockUsers.citizen;
    setUser(mockUser);
    setIsAuthenticated(true);
    setIsLoading(false);
    return mockUser;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const sendOTP = useCallback(async (mobile) => {
    // SIMULATED: In production, this would trigger an SMS OTP via government SMS gateway
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: 'OTP sent to ' + mobile };
  }, []);

  const verifyOTP = useCallback(async (mobile, otp) => {
    // SIMULATED: In production, this would verify OTP against the SMS gateway
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (otp === '123456' || otp.length === 6) {
      return { success: true };
    }
    return { success: false, message: 'Invalid OTP' };
  }, []);

  const verifyDigiLocker = useCallback(async () => {
    // SIMULATED: In production, this would redirect to DigiLocker OAuth
    // and return verified identity documents
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      success: true,
      data: {
        name: 'Rajesh Kumar',
        dob: '1990-05-15',
        address: '42, Sector 15, Noida, Uttar Pradesh - 201301',
        aadhaarLast4: '4829',
        panVerified: true,
      },
    };
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
      sendOTP,
      verifyOTP,
      verifyDigiLocker,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
