import { withBasePath } from 'utils/path';
// MATERIAL - UI
// import { useTheme } from '@mui/material/styles';

/**
 * if you want to use image instead of <svg> uncomment following.
 *
 * import logoIconDark from 'assets/images/logo-icon-dark.svg';
 * import logoIcon from 'assets/images/logo-icon.svg';
 *
 */

// ==============================|| LOGO ICON SVG ||============================== //

const LogoIcon = () => {
  // const theme = useTheme();

  const logoIcon = withBasePath('/assets/images/auth/situ-icon.svg');
  return (
   /**
    * if you want to use image instead of svg uncomment following, and comment out <svg> element.
    *
    * <img src={theme.palette.mode === ThemeMode.DARK ? logoIconDark : logoIcon} alt="icon logo" width="100" />
    *
    */

   <img src={logoIcon} alt="icon logo" width="30" />
  );
};

export default LogoIcon;
