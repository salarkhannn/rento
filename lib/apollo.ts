import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { supabase } from './supabase';

const httpLink = createHttpLink({
    uri: `${process.env.EXPO_PUBLIC_SUPABASE_URL}/graphql/v1`,
});

const authLink = setContext(async (_, { headers }) => {
    const { data: { session } } = await supabase.auth.getSession();

    return {
        headers: {
            ...headers,
            authorization: session?.access_token ? `Bearer ${session.access_token}` : '',
            apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
        }
    }
});

export const apolloClient = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
});