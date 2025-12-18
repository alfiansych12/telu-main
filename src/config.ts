// NEXT
import { Roboto } from 'next/font/google';

// TYPES
import { DefaultConfigProps, MenuOrientation, ThemeDirection, ThemeMode } from 'types/config';

// ==============================|| THEME CONSTANT ||============================== //
export const roleAccess = {
  GS: ['*'],
  TW: ['*'],
  FD: ['*'],
  BD: ['*'],
  SA: ['*']
  // BD: ['/dashboard', '/api', '/scope'],
};
export const APP_DEFAULT_PATH = '/dashboard';
export const HORIZONTAL_MAX_ITEM = 6;
export const DRAWER_WIDTH = 280;
export const MINI_DRAWER_WIDTH = 90;
export const HEADER_HEIGHT = 74;
const roboto = Roboto({ subsets: ['latin'], weight: ['300', '400', '500', '700'] });

// ==============================|| THEME CONFIG ||============================== //

const config: DefaultConfigProps = {
  fontFamily: roboto.style.fontFamily,
  i18n: 'en',
  menuOrientation: MenuOrientation.VERTICAL,
  menuCaption: true,
  miniDrawer: false,
  container: false,
  mode: ThemeMode.LIGHT,
  presetColor: 'default',
  themeDirection: ThemeDirection.LTR,
  themeContrast: false
};

export default config;
