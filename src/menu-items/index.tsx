// PROJECT IMPORTS
import { adminMenu, userMenu, supervisorMenu } from './all-page';
import participantMenu from './participant-menu';

// ==============================|| MENU ITEMS ||============================== //

export const allMenuGroups = [adminMenu, userMenu, supervisorMenu, participantMenu];

// Fungsi untuk memilih menu berdasarkan role user
const getMenuByRole = (role: string) => {
  if (role === 'admin') return { items: [adminMenu] };
  if (role === 'supervisor') return { items: [supervisorMenu] };
  if (role === 'participant') return { items: [userMenu] };

  // Default fallback
  return { items: [userMenu] };
};

export default getMenuByRole;
