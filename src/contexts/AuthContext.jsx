import { createContext, useContext, useState, useEffect } from 'react';
import { account } from '../lib/appwrite';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      setAuthError(null);

      // Logged in user data
      const userData = await account.get();

      setUser(userData);
    } catch (error) {
      if (error.code !== 401) {
        console.error("Auth check failed:", error);
        setAuthError(error.message);
      }

      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function loginWithGoogle() {
    try {
      setAuthError(null);

      const baseUrl = window.location.origin;

      const successUrl = `${baseUrl}/daily-tasks`;
      const failureUrl = `${baseUrl}/login`;

      await account.createOAuth2Session(
        'google',
        successUrl,
        failureUrl
      );

    } catch (error) {
      console.error("Google login error:", error);

      return {
        success: false,
        error: error.message
      };
    }
  }

  async function logout() {
    try {
      setLoading(true);

      await account.deleteSession('current');

      setUser(null);
      setAuthError(null);

      return { success: true };

    } catch (error) {
      console.error("Logout error:", error);

      return {
        success: false,
        error: error.message
      };
    } finally {
      setLoading(false);
    }
  }

  async function deleteAccount() {
    try {
      setLoading(true);

      // Delete the current session (logout)
      await account.deleteSession('current');

      setUser(null);
      setAuthError(null);

      return { success: true };

    } catch (error) {
      console.error("Delete account error:", error);

      return {
        success: false,
        error: error.message
      };
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        loginWithGoogle,
        logout,
        deleteAccount,
        isAuthenticated: !!user
      }}
    >
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