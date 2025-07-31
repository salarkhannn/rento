import { Session, User } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
    isInitialized: boolean;
    mode: string | null;
    setMode: (mode: string) => void;
    switchMode: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: false,
    signOut: async () => {},
    isInitialized: false,
    mode: null,
    setMode: () => {},
    switchMode: async () => {},
});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);
    const [mode, setMode] = useState<string | null>(null);

    const fetchUserMode = async (userId: string) => {
        const {data, error} = await supabase
            .from('profiles')
            .select('current_mode')
            .eq('id', userId)
            .single();
        if (!error && data?.current_mode) {
            setMode(data.current_mode);
        } else {
            setMode('renter'); // Default mode
        }
    }

    useEffect(() => {
        // Get initial session and user
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            setSession(session);
            setUser(session?.user || null);
            if (session?.user?.id) {
                await fetchUserMode(session.user.id);
            } else {
                setMode(null);
            }
            setLoading(false);
            setIsInitialized(true);
        });

        // Listen for auth state changes
        const { data: { subscription }} = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                if (session?.user?.id) {
                    await fetchUserMode(session.user.id);
                } else {
                    setMode(null);
                }
                setLoading(false);
                setIsInitialized(true);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        setLoading(true);
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Sign out error:', error);
        } finally {
            setLoading(false);
        }
    };

    const switchMode = async () => {
        if (!user?.id || !mode) return;
        const newMode = mode === 'renter' ? 'lender' : 'renter';
        const { error } = await supabase
            .from('profiles')
            .update({ current_mode: newMode })
            .eq('id', user.id);
        if (!error) {
            setMode(newMode);
        } else {
            console.error('Error switching mode:', error);
        }
    }

    return (
        <AuthContext.Provider
            value={{
                session,
                user,
                loading,
                signOut,
                isInitialized,
                mode,
                setMode,
                switchMode
            }}>
            {children}
        </AuthContext.Provider>
    )
}