import { withBasePath } from 'utils/path';
// MATERIAL - UI
// import { useTheme } from '@mui/material/styles';

/**
 * if you want to use image instead of <svg> uncomment following.
 *
 * import logoDark from 'assets/images/logo-dark.svg';
 * import logo from 'assets/images/logo.svg';
 *
 */

// ==============================|| LOGO SVG ||============================== //

const LogoMain = () => {
  // const theme = useTheme();
  const logo = withBasePath('/assets/images/auth/situ-main.svg');
  return (
   /**
    * if you want to use image instead of svg uncomment following, and comment out <svg> element.
    *
    * <img src={theme.palette.mode === ThemeMode.DARK ? logoDark : logo} alt="icon logo" width="100" />
    *
    */
   <img src={logo} alt="icon logo" width="100" />
  );
};

export default LogoMain;
