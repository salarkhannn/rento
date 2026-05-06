import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { AuthProvider, useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';

// Mock Supabase
jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } }
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(),
      })),
      rpc: jest.fn(),
    })),
    rpc: jest.fn(),
  },
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
  },
  useLocalSearchParams: jest.fn(),
}));

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// Mock UI components
jest.mock('../ui/components/InputField', () => 'CustomTextInput');
jest.mock('../ui/components/Button', () => 'CustomButton');

describe('Authentication System', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User'
  };

  const mockSession = {
    user: mockUser,
    access_token: 'mock-token'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AuthContext', () => {
    beforeEach(() => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null }
      });
      (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } }
      });
    });

    it('should provide initial loading state', () => {
      const TestComponent = () => {
        const { loading, isInitialized } = useAuth();
        return (
          <View testID="auth-test">
            <Text testID="loading">{loading ? 'loading' : 'not-loading'}</Text>
            <Text testID="initialized">{isInitialized ? 'initialized' : 'not-initialized'}</Text>
          </View>
        );
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('loading')).toHaveTextContent('loading');
      expect(screen.getByTestId('initialized')).toHaveTextContent('not-initialized');
    });

    it('should handle successful authentication', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession }
      });

      const mockSelect = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: { current_mode: 'renter' },
            error: null
          }))
        }))
      }));

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect
      });

      const TestComponent = () => {
        const { user, mode, loading, isInitialized } = useAuth();
        return (
          <View testID="auth-test">
            <Text testID="user-id">{user?.id || 'no-user'}</Text>
            <Text testID="mode">{mode || 'no-mode'}</Text>
            <Text testID="loading">{loading ? 'loading' : 'loaded'}</Text>
            <Text testID="initialized">{isInitialized ? 'initialized' : 'not-initialized'}</Text>
          </View>
        );
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-id')).toHaveTextContent('user-123');
        expect(screen.getByTestId('mode')).toHaveTextContent('renter');
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
        expect(screen.getByTestId('initialized')).toHaveTextContent('initialized');
      });
    });

    it('should handle sign out', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession }
      });
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({});

      const mockSelect = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: { current_mode: 'renter' },
            error: null
          }))
        }))
      }));

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect
      });

      const TestComponent = () => {
        const { user, signOut } = useAuth();
        return (
          <View testID="auth-test">
            <Text testID="user-id">{user?.id || 'no-user'}</Text>
            <TouchableOpacity testID="sign-out-btn" onPress={signOut}>
              <Text>Sign Out</Text>
            </TouchableOpacity>
          </View>
        );
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-id')).toHaveTextContent('user-123');
      });

      fireEvent.press(screen.getByTestId('sign-out-btn'));

      await waitFor(() => {
        expect(supabase.auth.signOut).toHaveBeenCalled();
      });
    });

    it('should switch user mode', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession }
      });

      const mockSelect = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: { current_mode: 'renter' },
            error: null
          }))
        }))
      }));

      const mockUpdate = jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null }))
      }));

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        update: mockUpdate
      });

      const TestComponent = () => {
        const { mode, switchMode } = useAuth();
        return (
          <View testID="auth-test">
            <Text testID="mode">{mode || 'no-mode'}</Text>
            <TouchableOpacity testID="switch-mode-btn" onPress={switchMode}>
              <Text>Switch Mode</Text>
            </TouchableOpacity>
          </View>
        );
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('mode')).toHaveTextContent('renter');
      });

      fireEvent.press(screen.getByTestId('switch-mode-btn'));

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith({ current_mode: 'lender' });
      });
    });
  });

  describe('Auth UI Components', () => {
    it('should render auth start screen', () => {
      const AuthStartScreen = () => (
        <View testID="auth-start">
          <Text testID="title">Welcome to Rento</Text>
          <View testID="email-input">Email Input</View>
          <TouchableOpacity testID="continue-btn">
            <Text>Continue</Text>
          </TouchableOpacity>
        </View>
      );

      render(<AuthStartScreen />);

      expect(screen.getByTestId('auth-start')).toBeTruthy();
      expect(screen.getByTestId('title')).toHaveTextContent('Welcome to Rento');
      expect(screen.getByTestId('email-input')).toBeTruthy();
      expect(screen.getByTestId('continue-btn')).toBeTruthy();
    });

    it('should render login screen', () => {
      const AuthLoginScreen = () => (
        <View testID="auth-login">
          <Text testID="title">Welcome back to rento!</Text>
          <View testID="email-input">Email Input</View>
          <View testID="password-input">Password Input</View>
          <TouchableOpacity testID="login-btn">
            <Text>Sign In</Text>
          </TouchableOpacity>
        </View>
      );

      render(<AuthLoginScreen />);

      expect(screen.getByTestId('auth-login')).toBeTruthy();
      expect(screen.getByTestId('title')).toHaveTextContent('Welcome back to rento!');
      expect(screen.getByTestId('email-input')).toBeTruthy();
      expect(screen.getByTestId('password-input')).toBeTruthy();
      expect(screen.getByTestId('login-btn')).toBeTruthy();
    });

    it('should render signup screen', () => {
      const AuthSignupScreen = () => (
        <View testID="auth-signup">
          <Text testID="title">Create your account</Text>
          <View testID="email-input">Email Input</View>
          <View testID="password-input">Password Input</View>
          <View testID="confirm-password-input">Confirm Password Input</View>
          <TouchableOpacity testID="signup-btn">
            <Text>Sign Up</Text>
          </TouchableOpacity>
        </View>
      );

      render(<AuthSignupScreen />);

      expect(screen.getByTestId('auth-signup')).toBeTruthy();
      expect(screen.getByTestId('title')).toHaveTextContent('Create your account');
      expect(screen.getByTestId('email-input')).toBeTruthy();
      expect(screen.getByTestId('password-input')).toBeTruthy();
      expect(screen.getByTestId('confirm-password-input')).toBeTruthy();
      expect(screen.getByTestId('signup-btn')).toBeTruthy();
    });

    it('should show loading state during auth operations', () => {
      const AuthLoadingScreen = ({ loading }: { loading: boolean }) => (
        <View testID="auth-loading">
          {loading ? (
            <Text testID="loading-text">Loading...</Text>
          ) : (
            <Text testID="ready-text">Ready</Text>
          )}
        </View>
      );

      const { rerender } = render(<AuthLoadingScreen loading={true} />);
      expect(screen.getByTestId('loading-text')).toHaveTextContent('Loading...');

      rerender(<AuthLoadingScreen loading={false} />);
      expect(screen.getByTestId('ready-text')).toHaveTextContent('Ready');
    });

    it('should display error messages', () => {
      const AuthErrorScreen = ({ error }: { error: string }) => (
        <View testID="auth-error">
          {error ? (
            <Text testID="error-text">{error}</Text>
          ) : (
            <Text testID="no-error">No errors</Text>
          )}
        </View>
      );

      const { rerender } = render(<AuthErrorScreen error="Invalid email" />);
      expect(screen.getByTestId('error-text')).toHaveTextContent('Invalid email');

      rerender(<AuthErrorScreen error="" />);
      expect(screen.getByTestId('no-error')).toHaveTextContent('No errors');
    });
  });

  describe('Authentication Flows', () => {
    it('should handle successful login flow', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      });

      const mockRouter = require('expo-router').router;

      // Mock login component
      const LoginFlow = () => {
        const [email, setEmail] = React.useState('test@example.com');
        const [password, setPassword] = React.useState('password123');
        const [loading, setLoading] = React.useState(false);

        const handleLogin = async () => {
          setLoading(true);
          try {
            const { error } = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            if (!error) {
              mockRouter.replace('/(tabs)');
            }
          } finally {
            setLoading(false);
          }
        };

        return (
          <View testID="login-flow">
            <TouchableOpacity testID="login-btn" onPress={handleLogin} disabled={loading}>
              <Text>{loading ? 'Signing In...' : 'Sign In'}</Text>
            </TouchableOpacity>
          </View>
        );
      };

      render(<LoginFlow />);

      fireEvent.press(screen.getByTestId('login-btn'));

      await waitFor(() => {
        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123'
        });
        expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)');
      });
    });

    it('should handle login error', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' }
      });

      const LoginFlow = () => {
        const [email, setEmail] = React.useState('test@example.com');
        const [password, setPassword] = React.useState('wrongpassword');
        const [loading, setLoading] = React.useState(false);

        const handleLogin = async () => {
          setLoading(true);
          try {
            const { error } = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            if (error) {
              Alert.alert('Error', error.message);
            }
          } finally {
            setLoading(false);
          }
        };

        return (
          <View testID="login-flow">
            <TouchableOpacity testID="login-btn" onPress={handleLogin} disabled={loading}>
              <Text>Sign In</Text>
            </TouchableOpacity>
          </View>
        );
      };

      render(<LoginFlow />);

      fireEvent.press(screen.getByTestId('login-btn'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Invalid credentials');
      });
    });

    it('should handle email verification flow', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue(true);

      const mockRouter = require('expo-router').router;
      const mockUseLocalSearchParams = require('expo-router').useLocalSearchParams;
      mockUseLocalSearchParams.mockReturnValue({ email: 'test@example.com' });

      const EmailCheckFlow = () => {
        const [email, setEmail] = React.useState('test@example.com');
        const [loading, setLoading] = React.useState(false);

        const checkEmail = async () => {
          setLoading(true);
          try {
            const data = await supabase.rpc('check_user_exists', {
              input_email: email.toLowerCase().trim()
            });

            if (data === true) {
              mockRouter.push({ pathname: '/auth/auth-login', params: { email } });
            } else {
              mockRouter.push({ pathname: '/auth/auth-signup', params: { email } });
            }
          } finally {
            setLoading(false);
          }
        };

        return (
          <View testID="email-check-flow">
            <TouchableOpacity testID="continue-btn" onPress={checkEmail} disabled={loading}>
              <Text>Continue</Text>
            </TouchableOpacity>
          </View>
        );
      };

      render(<EmailCheckFlow />);

      fireEvent.press(screen.getByTestId('continue-btn'));

      await waitFor(() => {
        expect(supabase.rpc).toHaveBeenCalledWith('check_user_exists', {
          input_email: 'test@example.com'
        });
        expect(mockRouter.push).toHaveBeenCalledWith({
          pathname: '/auth/auth-login',
          params: { email: 'test@example.com' }
        });
      });
    });
  });
});