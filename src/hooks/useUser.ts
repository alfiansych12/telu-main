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
  if (session) {
    const user = session?.token;

    if (!user?.photo) {
      user!.photo = withBasePath('/assets/images/users/avatar-1.png');
    }

    const newUser: UserProps = {
      username: user!.user!,
      fullName: user!.fullname!,
      photo: user?.photo!,
      role: user!.role!,
      nim: user!.numberid!
    };

    return newUser;
  }
  return false;
};

export default useUser;
