import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { supabase, supabaseAnonKey, supabaseUrl } from './supabase';

const httpLink = createHttpLink({
    uri: `${supabaseUrl}/graphql/v1`,
});

const authLink = setContext(async (_, { headers }) => {
    const { data: { session } } = await supabase.auth.getSession();

    return {
        headers: {
            ...headers,
            authorization: session?.access_token ? `Bearer ${session.access_token}` : '',
            apikey: supabaseAnonKey || '',
        }
    }
});

export const apolloClient = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
});