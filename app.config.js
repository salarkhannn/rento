export default () => ({
    expo: {
        name: "Rento",
        slug: "rento",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/images/icon.png",
        scheme: "rento",
        userInterfaceStyle: "automatic",
        splash: {
            image: "./assets/images/splash.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff"
        },
        assetBundlePatterns: ["**/*"],
        ios: {
            supportsTablet: true,
            infoPlist: {
                NSUserTrackingUsageDescription: "This identifier will be used to deliver personalized ads to you.",
                UIBackgroundModes: ["remote-notification"]
            }
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/images/adaptive-icon.png",
                backgroundColor: "#ffffff"
            },
            useNextNotificationsApi: true
        },
        web: { 
            bundler: "metro",
            output: "static",
            favicon: "./assets/images/favicon.png"
        },
        plugins: ["expo-router", "expo-notifications", "expo-web-browser"],
        experiments: {
            typedRoutes: true
        },
        extra: {
            supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
            supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
            eas: {
                projectId: "de5d1168-3873-4437-aa25-f9587bdd1c2d",
            },
        },
    }
});
