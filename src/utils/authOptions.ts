import { AxiosResponse } from 'axios';
import endpoints from 'utils/endpoints';
import { getServerSession, type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { axiosLogin } from 'utils/axios';
import { supabase } from 'lib/supabase/client';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET_KEY,
  providers: [
    CredentialsProvider({
      id: 'login',
      name: 'login',
      credentials: {
        username: { name: 'username', label: 'Username', type: 'username', placeholder: 'Enter Username' },
        password: { name: 'password', label: 'Password', type: 'password', placeholder: 'Enter Password' }
      },
      async authorize(credentials) {
        try {
          const username = credentials?.username;
          const password = credentials?.password;

          if (!username || !password) {
            throw new Error('Please enter username and password');
          }

          // 1. Try local authentication (Supabase)
          const { data: localUser } = await (supabase
            .from('users')
            .select('*')
            .eq('email', username)
            .single() as any);

          if (localUser && localUser.password === password) {
            console.log('Local login successful for:', username);
            return {
              id: localUser.id,
              name: localUser.name,
              email: localUser.email,
              role: localUser.role,
              unit_id: localUser.unit_id,
              provider: 'local'
            } as any;
          }

          // 2. Fallback to External SSO (Telkom University)
          console.log('Attempting SSO login for:', username);
          const tokenResponse: any = await authLogin(username, password);
          const accessToken = tokenResponse?.token;

          if (!accessToken) {
            const ssoError = tokenResponse?.response?.data?.message;
            throw new Error(ssoError || 'Invalid credentials');
          }

          const userResponse: any = await getProfile(accessToken);
          const userData = userResponse?.data;

          if (!userData) {
            throw new Error('SSO User profile not found.');
          }

          // 3. Sync SSO user with local users table
          const email = userData.email || userData.username;
          let { data: dbUser } = await (supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single() as any);

          if (!dbUser) {
            console.log('Creating new Admin record for SSO user:', email);
            const { data: newUser, error: createError } = await (supabase
              .from('users' as any)
              .insert({
                email: email,
                name: userData.fullname || userData.name || email,
                role: 'admin',
                status: 'active'
              } as any)
              .select('*')
              .single() as any);

            if (createError) console.error('Error creating admin user:', createError);
            dbUser = newUser;
          }

          return {
            id: dbUser?.id || userData.id,
            name: dbUser?.name || userData.fullname || userData.name,
            email: email,
            role: dbUser?.role || 'admin',
            unit_id: dbUser?.unit_id,
            accessToken: accessToken,
            provider: 'sso'
          } as any;

        } catch (e: any) {
          console.error('Auth Error:', e.message);
          throw new Error(e.message || 'Authentication failed');
        }
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user, account }) => {
      if (user) {
        token = { ...user };
        token.provider = account?.provider;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token) {
        session.provider = token.provider;
        session.token = token;
        // @ts-ignore
        session.user.role = token.role;
        // @ts-ignore
        session.user.id = token.id;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      return url;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: Number(process.env.NEXT_APP_JWT_TIMEOUT || 86400)
  },
  jwt: {
    secret: process.env.NEXT_APP_JWT_SECRET
  },
  pages: {
    signIn: '/login'
  }
};

export async function authLogin(username: string | undefined, password: string | undefined) {
  try {
    const { data }: AxiosResponse = await axiosLogin.post(endpoints.login, {
      username: username,
      password: password
    });
    return data;
  } catch (error) {
    console.error('Error:', error);
    return error;
  }
}

export async function getProfile(token: string) {
  try {
    const { data }: AxiosResponse = await axiosLogin.get(endpoints.profile, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return data;
  } catch (error) {
    console.error('Error:', error);
    return error;
  }
}

export const getserverAuthSession = () => getServerSession(authOptions);
