import { View } from "@/components/Themed";
import { useAuth } from "@/lib/AuthContext";
import { router } from "expo-router";
import React, { ReactNode, useEffect } from "react";
import { ActivityIndicator } from "react-native";

interface ModeGuardProps {
    requiredMode: 'renter' | 'lender';
    children: ReactNode;
}

export const ModeGuard: React.FC<ModeGuardProps> = ({ requiredMode, children }) => {
    const { mode, loading, isInitialized } = useAuth();

    useEffect(() => {
        if (!loading && isInitialized && mode && mode !== requiredMode) {
            // Redirect to the default screen
            if (mode === 'renter') {
                router.push('/');
            } else if (mode === 'lender') {
                router.push('/dashboard');
            }
        }
    }, [mode, loading, isInitialized, requiredMode]);

    if (loading || !isInitialized || !mode) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2f95dc" />
            </View>
        )
    }

    if (mode !== requiredMode) {
        return null;
    }

    return <>{children}</>;
}