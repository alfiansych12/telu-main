import { AxiosResponse } from 'axios';
import endpoints from 'utils/endpoints';
import { getServerSession, type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { axiosLogin } from 'utils/axios';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET_KEY,
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
          const tokenResponse: any = await authLogin(credentials?.username, credentials?.password);
          const accessToken = tokenResponse?.token;

          if (!accessToken) {
            throw new Error(
              tokenResponse?.response?.data?.message
                ? tokenResponse?.response?.data?.message
                : 'Authentication failed: failed retrieve access token.'
            );
          }

          const userResponse: any = await getProfile(accessToken);
          const userData = userResponse?.data;

          if (!userData) {
            throw new Error('User profile not found.');
          }

          userData['accessToken'] = accessToken;

          return userData;
        } catch (e: any) {
          const errorMessage = e?.response?.data?.message || e.message || 'Something went wrong!';
          throw new Error(errorMessage);
        }
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user, account }) => {
      if (user) {
        // @ts-ignore
        // token.accessToken = user.accessToken;
        // token.id = user.id;
        token = { ...user };
        token.provider = account?.provider;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token) {
        // session.id = token.id;
        session.provider = token.provider;
        session.token = token;
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
    maxAge: Number(process.env.NEXT_APP_JWT_TIMEOUT!)
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
