// NEXT
import Link from 'next/link';
import { useSession } from 'next-auth/react';

// MATERIAL - UI
import ButtonBase from '@mui/material/ButtonBase';
import { SxProps } from '@mui/system';

// THIRD - PARTY
import { To } from 'history';

// PROJECT IMPORTS
import Logo from './LogoMain';
import LogoIcon from './LogoIcon';
import { APP_DEFAULT_PATH } from 'config';

// ==============================|| MAIN LOGO ||============================== //

interface Props {
  reverse?: boolean;
  isIcon?: boolean;
  sx?: SxProps;
  to?: To;
}

const LogoSection = ({ reverse, isIcon, sx, to }: Props) => {
  const { data: session } = useSession();
  const user = session?.user as any;
  const role = user?.role;

  let path = APP_DEFAULT_PATH;
  if (role === 'supervisor') path = '/dashboardsuper';
  if (role === 'participant') path = '/dashboarduser';

  return (
    <ButtonBase disableRipple component={Link} href={!to ? path : to} sx={sx}>
      {isIcon ? <LogoIcon /> : <Logo />}
    </ButtonBase>
  );
};

export default LogoSection;
