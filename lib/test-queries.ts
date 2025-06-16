import { getRentalItems, getCategories, getProfile, createRentalItem } from "./queries";
import { supabase } from "./supabase";

export const testBackend = async () => {
    try {
        console.log('🚀 Starting backend tests...');
        
        // Test 1: Database Connection
        console.log('📡 Testing database connection...');
        const { data: connectionTest } = await supabase.from('categories').select('count').limit(1);
        console.log('✅ Database connection successful');
        
        // Test 2: Categories
        console.log('📂 Testing categories...');
        const categories = await getCategories();
        console.log('✅ Categories loaded:', categories.length, 'categories found');
        categories.forEach(cat => console.log(`  - ${cat.name}`));
        
        // Test 3: Rental Items
        console.log('🏠 Testing rental items...');
        const rentalItems = await getRentalItems();
        console.log('✅ Rental items loaded:', rentalItems.length, 'items found');
        
        // Test 4: Environment Variables
        console.log('🔧 Testing environment variables...');
        const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing environment variables');
        }
        console.log('✅ Environment variables configured');
        console.log('  - Supabase URL:', supabaseUrl.substring(0, 30) + '...');
        
        // Test 5: Authentication Status
        console.log('🔐 Testing authentication...');
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            console.log('✅ User authenticated:', user.email);
            
            // Test user profile if authenticated
            const profile = await getProfile();
            if (profile) {
                console.log('✅ User profile loaded:', profile.name);
            } else {
                console.log('⚠️ No user profile found');
            }
        } else {
            console.log('ℹ️ No user currently authenticated');
        }
        
        console.log('🎉 All backend tests completed successfully!');
        return true;
        
    } catch (error) {
        console.error('❌ Backend test failed:', error);
        
        // Enhanced error reporting
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        
        // Check specific error types
        if (error?.code) {
            console.error('Supabase error code:', error.code);
        }
        
        return false;
    }
}

// Additional test for specific features
export const testSpecificFeature = async (feature: 'items' | 'categories' | 'auth' | 'profile') => {
    try {
        switch (feature) {
            case 'items':
                const items = await getRentalItems();
                console.log(`Items test: ${items.length} items found`);
                return items;
                
            case 'categories':
                const categories = await getCategories();
                console.log(`Categories test: ${categories.length} categories found`);
                return categories;
                
            case 'auth':
                const { data: { user } } = await supabase.auth.getUser();
                console.log(`Auth test: ${user ? 'Authenticated' : 'Not authenticated'}`);
                return user;
                
            case 'profile':
                const profile = await getProfile();
                console.log(`Profile test: ${profile ? 'Profile found' : 'No profile'}`);
                return profile;
                
            default:
                throw new Error(`Unknown feature: ${feature}`);
        }
    } catch (error) {
        console.error(`Test failed for ${feature}:`, error);
        throw error;
    }
};