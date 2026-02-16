import axios, { AxiosResponse } from 'axios';
import endpoints from 'utils/endpoints';
import { getServerSession, type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from 'lib/prisma';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || process.env.NEXT_APP_JWT_SECRET,
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

          // 1. Try local authentication (Prisma)
          const cleanUsername = username.includes('@') ? username.split('@')[0] : username;
          const standardEmail = `${cleanUsername}@telkomuniversity.ac.id`;



          const localUser = await prisma.user.findFirst({
            where: {
              OR: [
                { email: { equals: username, mode: 'insensitive' } },
                { email: { equals: standardEmail, mode: 'insensitive' } }
              ]
            }
          });



          if (localUser) {
            if (localUser.password === password) {
              return {
                id: localUser.id,
                name: localUser.name,
                email: localUser.email,
                role: localUser.role,
                unit_id: localUser.unit_id,
                photo: (localUser as any).photo,
                phone: (localUser as any).phone,
                institution_name: (localUser as any).institution_name,
                institution_type: (localUser as any).institution_type,
                personal_email: (localUser as any).personal_email,
                telegram_username: localUser.telegram_username,
                id_number: localUser.id_number,
                provider: 'local'
              } as any;
            }
          }

          // 2. Fallback to External SSO (Telkom University)
          // Normalize username for SSO call: strip domain to ensure only core ID is sent

          const tokenResponse: any = await authLogin(cleanUsername, password);

          // Debug: Check token response structure


          const accessToken = tokenResponse?.token || tokenResponse?.data?.access_token || tokenResponse?.access_token;

          if (!accessToken) {
            const ssoError = tokenResponse?.response?.data?.message || tokenResponse?.message;
            throw new Error(ssoError || 'Invalid credentials or SSO token missing');
          }

          const userResponse: any = await getProfile(accessToken);

          // Debug: Check profile response structure


          // Flexible data mapping: Some APIs return data nested in .data, some don't.
          const userData = userResponse?.data || userResponse;

          if (!userData || (typeof userData === 'object' && Object.keys(userData).length === 0)) {
            throw new Error('SSO User profile not found or empty.');
          }

          // 3. Sync SSO user with local users table
          // Look for identifier in multiple possible fields (Tel-U SSO uses 'user' or 'numberid')
          const identifier = userData.email || userData.username || userData.user || userData.nim || userData.numberid || userData.user_id;

          if (!identifier) {
            console.error('SSO Error: No identifier found in profile', userData);
            throw new Error('SSO Authentication failed: No email, username, or NIM found in profile');
          }

          // Format email to be used as primary key/unique identifier
          const email = identifier.includes('@') ? identifier : `${identifier}@telkomuniversity.ac.id`;

          let dbUser = await prisma.user.findUnique({
            where: { email: email }
          });

          if (!dbUser) {
            console.log('Creating new Supervisor record for SSO user:', email);
            dbUser = await prisma.user.create({
              data: {
                email: email,
                name: userData.fullname || userData.nama || userData.name || userData.display_name || identifier,
                role: 'supervisor',
                status: 'active'
              }
            });
          }

          return {
            id: dbUser?.id || userData.id || identifier,
            name: dbUser?.name || userData.fullname || userData.nama || userData.name,
            email: email,
            role: dbUser?.role || 'supervisor',
            unit_id: dbUser?.unit_id,
            telegram_username: dbUser?.telegram_username,
            id_number: dbUser?.id_number,
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
    jwt: async ({ token, user, account, trigger, session }) => {
      // Handle session update from client
      if (trigger === 'update' && session) {
        // Only merge essential fields
        return {
          ...token,
          name: session.name || token.name,
          email: session.email || token.email,
          role: session.role || token.role,
          telegram_username: session.telegram_username || token.telegram_username,
          id_number: session.id_number || token.id_number
        };
      }

      if (user) {
        // Only store essential user data in JWT to prevent cookie overflow
        const userData = user as any;
        token.id = userData.id;
        token.name = userData.name;
        token.email = userData.email;
        token.role = userData.role;
        token.unit_id = userData.unit_id;
        token.telegram_username = userData.telegram_username;
        token.id_number = userData.id_number;
        token.provider = account?.provider;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token) {

        // Only pass essential data to session
        session.user = {
          id: token.id,
          name: token.name,
          email: token.email,
          role: token.role,
          unit_id: token.unit_id,
          telegram_username: token.telegram_username,
          id_number: token.id_number
        } as any;

        session.provider = token.provider;

        // Store minimal token info
        session.token = {
          id: token.id,
          role: token.role
        } as any;
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
    secret: process.env.NEXTAUTH_SECRET || process.env.NEXT_APP_JWT_SECRET,
    maxAge: Number(process.env.NEXT_APP_JWT_TIMEOUT || 86400)
  },
  pages: {
    signIn: '/login'
  }
};

// ==============================|| AXIOS LOGIN INSTANCE ||============================== //

const axiosLogin = axios.create({
  baseURL: process.env.NEXT_PUBLIC_NEXT_APP_API_URL_LOGIN || 'https://auth-v2.telkomuniversity.ac.id/stg/api/oauth/'
});

export async function authLogin(username: string | undefined, password: string | undefined) {
  try {
    const { data }: AxiosResponse = await axiosLogin.post(endpoints.login, {
      username: username,
      password: password
    });
    return data;
  } catch (error) {
    console.error('Login API Error:', error);
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
    console.error('Profile API Error:', error);
    return error;
  }
}

export async function getserverAuthSession() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      console.warn('[AUTH] getserverAuthSession - Session is null. Host:', process.env.NEXTAUTH_URL);
    }
    return session;
  } catch (error) {
    console.error('[AUTH] Error getting session:', error);
    return null;
  }
}
