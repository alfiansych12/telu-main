// PROJECT IMPORTS
import allPages from './all-page';
import participantMenu from './participant-menu';
import useUser from 'hooks/useUser';

// TYPES
import { NavItemType } from 'types/menu';

// ==============================|| MENU ITEMS ||============================== //


// Fungsi untuk memilih menu berdasarkan role user
const getMenuByRole = (role: string) => {
  if (role === 'participant') return { items: [participantMenu] };
  return { items: [allPages] };
};

export default getMenuByRole;
