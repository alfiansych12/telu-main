// THIRD - PARTY
import { FormattedMessage } from 'react-intl';

// ASSETS
import { DocumentCode2 } from 'iconsax-react';

// TYPE
import { NavItemType } from 'types/menu';

// ICONS
const icons = {
  samplePage: DocumentCode2
};

// ==============================|| MENU ITEMS - SUPERVISOR PAGE ||============================== //

const supervisorPages: NavItemType = {
  id: 'menu-supervisor',
  title: <FormattedMessage id="menu.supervisor" />,
  type: 'group',
  children: [
    {
      id: 'dashboard-supervisor',
      title: <FormattedMessage id="dashboard.supervisor" />,
      type: 'item',
      icon: icons.samplePage,
      url: '/dashboard-supervisor'
      // access: ['Supervisor'] // contoh akses khusus supervisor
    }
  ]
};

export default supervisorPages;
