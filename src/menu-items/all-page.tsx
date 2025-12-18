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

// ==============================|| MENU ITEMS - SAMPLE PAGE ||============================== //

const allPages: NavItemType = {
  id: 'Admin-menu',
  title: <FormattedMessage id="Admin Menu" />,
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: <FormattedMessage id="dashboard" />,
      type: 'item',
      icon: icons.samplePage,
      url: '/dashboard'
      // access: ['BD', 'SA']  //contoh untuk menambahkan item ke navbar
    },
    {
      id: 'Management Data',
      title: <FormattedMessage id="Management Data" />,
      type: 'item',
      icon: icons.samplePage,
      url: '/ManagementData'
      // access: ['BD', 'SA']  //contoh untuk menambahkan item ke navbar
    },
    {
      id: 'Reports Monitoring',
      title: <FormattedMessage id="Reports Monitoring" />,
      type: 'item',
      icon: icons.samplePage,
      url: '/ReportsMonitoring'
      // access: ['BD', 'SA']  //contoh untuk menambahkan item ke navbar
    }
    // ,    {
    //   id: 'Units Management',
    //   title: <FormattedMessage id="Units Management" />,
    //   type: 'item',
    //   icon: icons.samplePage,
    //   url: '/UnitsManagement'
    //   // access: ['BD', 'SA']  //contoh untuk menambahkan item ke navbar
    // }
      ,{
          id: 'Dashboarduser',
          title: <FormattedMessage id="Dashboarduser" />, 
          type: 'item',
          icon: icons.samplePage,
          url: '/dashboarduser'
        },
  ]
};

export default allPages;
