import { useAuth } from "@/lib/AuthContext";
import React, { useEffect } from "react";
import { Text, View } from "./Themed";
import { ActivityIndicator, StyleSheet } from "react-native";
import { router } from "expo-router";

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { session, loading, isInitialized } = useAuth();

    useEffect(() => {
        if (isInitialized && !loading && !session) {
            console.log('AuthGaurd: Redirecting to sign-in');
            router.replace('/auth/sign-in');
        }
    }, [isInitialized, loading, session]);

    if (!isInitialized || loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#2f95dc"/>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        )
    }

    if (!session) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#2f95dc"/>
                <Text style={styles.redirectText}>Redirecting to sign in...</Text>
            </View>
        );
    }

    return <>{children}</>;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    redirectText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
});