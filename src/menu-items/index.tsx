// PROJECT IMPORTS
import { adminMenu, userMenu, supervisorMenu } from './all-page';
import participantMenu from './participant-menu';

// ==============================|| MENU ITEMS ||============================== //

export const allMenuGroups = [adminMenu, userMenu, supervisorMenu, participantMenu];

// Fungsi untuk memilih menu berdasarkan role user
const getMenuByRole = (role: string) => {
  if (role === 'participant') return { items: [participantMenu] };
  // Return all three menu groups to show with separators
  return { items: [adminMenu, userMenu, supervisorMenu] };
};

export default getMenuByRole;
