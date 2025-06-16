import { useAuth } from "@/lib/AuthContext";
import React from "react";
import { Text, View } from "./Themed";
import { ActivityIndicator } from "react-native";
import { router } from "expo-router";

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { session, loading } = useAuth();

    if (loading) {
        return (
            <View>
                <ActivityIndicator/>
                <Text>Loading...</Text>
            </View>
        )
    }

    if (!session) {
        router.replace('/auth/sign-in');
        return (
            <View>
                <Text>You must be signed in to view this page.</Text>
            </View>
        );
    }

    return <>{children}</>;
}