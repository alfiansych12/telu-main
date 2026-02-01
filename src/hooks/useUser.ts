import { useSession } from 'next-auth/react';
import { withBasePath } from 'utils/path';

interface UserProps {
  username: string;
  fullName: string;
  photo: string;
  role: string;
  nim: number;
}

const useUser = () => {
  const { data: session } = useSession();
  if (session?.user) {
    const user = session.user as any;

    // Support photo from both session.user and legacy session.token
    const photo = user.photo || (session as any).token?.photo;

    const newUser: UserProps = {
      username: user.email || (session as any).token?.email || '',
      fullName: user.name || (session as any).token?.fullname || user.fullName || '',
      photo: photo && photo !== '' ? photo : withBasePath('/assets/images/users/avatar-1.png'),
      role: user.role || (session as any).token?.role || '',
      nim: user.id || (session as any).token?.id || 0
    };

    return newUser;
  }
  return false;
};

export default useUser;
