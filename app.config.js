import 'dotenv/config';

export default ( {config} ) => ({
    ...config,
    expo: {
        name: "Rento",
        slug: "rento",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/images/icon.png",
        scheme: "rento",
        userInterfaceStyle: "automatic",
        splash: {
            image: "./assets/images/splash-icon.png",
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
            useNextNotificationsApi: true,
            softwareKeyboardLayoutMode: "pan",
            permissions: ["NOTIFICATIONS"]
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
                projectId: "b0c689bf-14e4-489b-9105-8dfd39aa576d",
            },
        },
    }
});
