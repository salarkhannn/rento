import React from "react";
import { useAuth } from "@/lib/AuthContext";
import { router } from "expo-router";
import { Alert } from "react-native";

interface ConditionalAuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  message?: string;
  onAuthRequired?: () => void;
}

export function ConditionalAuthGuard({ 
  children, 
  requireAuth = false, 
  message = "You need to sign in to perform this action.",
  onAuthRequired
}: ConditionalAuthGuardProps) {
  const { session, loading, isInitialized } = useAuth();

  // If auth is not required, always render children
  if (!requireAuth) {
    return <>{children}</>;
  }

  // If auth is required but user is not authenticated
  if (requireAuth && isInitialized && !loading && !session) {
    // Call custom handler if provided, otherwise show alert and redirect
    if (onAuthRequired) {
      onAuthRequired();
    } else {
      Alert.alert(
        "Authentication Required",
        message,
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Sign In", 
            onPress: () => router.push('/auth/auth-start')
          }
        ]
      );
    }
    return null;
  }

  // If loading or authenticated, render children
  return <>{children}</>;
}

// Hook for checking auth status and triggering auth flow
export function useAuthAction() {
  const { session, loading, isInitialized } = useAuth();

  const requireAuth = (
    action: () => void,
    message: string = "You need to sign in to perform this action."
  ) => {
    if (isInitialized && !loading && !session) {
      Alert.alert(
        "Authentication Required",
        message,
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Sign In", 
            onPress: () => router.push('/auth/auth-start')
          }
        ]
      );
      return;
    }

    if (session) {
      action();
    }
  };

  return { requireAuth, isAuthenticated: !!session };
}
