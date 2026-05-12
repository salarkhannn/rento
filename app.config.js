import 'dotenv/config';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL/EXPO_PUBLIC_SUPABASE_ANON_KEY for this build');
}

if (supabaseUrl.includes('dvgvzeldpalswkmksard')) {
    throw new Error('Build is targeting the old Supabase project. Update EXPO_PUBLIC_SUPABASE_URL.');
}

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
            },
            bundleIdentifier: "com.salarkhannn.rento"
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/images/adaptive-icon.png",
                backgroundColor: "#ffffff"
            },
            useNextNotificationsApi: true,
            softwareKeyboardLayoutMode: "resize",
            permissions: ["NOTIFICATIONS", "INTERNET"],
            package: "com.salarkhannn.rento"
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
            supabaseUrl,
            supabaseAnonKey,
            eas: {
                projectId: "de5d1168-3873-4437-aa25-f9587bdd1c2d",
            },
        },
    }
});
