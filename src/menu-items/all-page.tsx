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
  title: <FormattedMessage id="Menu" />,
  type: 'group',
  children: [
      {
      id: 'Profileadmin',
      title: <FormattedMessage id="Admin - Profile" />,
      type: 'item',
      icon: icons.samplePage,
      url: '/Profileadmin'
      // access: ['BD', 'SA']  //contoh untuk menambahkan item ke navbar
    },

    {
      id: 'dashboard',
      title: <FormattedMessage id="Admin - Dashboard" />,
      type: 'item',
      icon: icons.samplePage,
      url: '/dashboard'
      // access: ['BD', 'SA']  //contoh untuk menambahkan item ke navbar
    },
    {
      id: 'Management Data',
      title: <FormattedMessage id="Admin - Management Data" />,
      type: 'item',
      icon: icons.samplePage,
      url: '/ManagementData'
      // access: ['BD', 'SA']  //contoh untuk menambahkan item ke navbar
    },
    {
      id: 'Reports Monitoring',
      title: <FormattedMessage id="Admin -Reports Monitoring" />,
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
          title: <FormattedMessage id="User - Dashboard" />, 
          type: 'item',
          icon: icons.samplePage,
          url: '/dashboarduser'
        },

        {
          id: 'Profiluser',
          title: <FormattedMessage id="User - Profile" />, 
          type: 'item',
          icon: icons.samplePage,
          url: '/Profilepart'
        },
        {
          id: 'Dashboardsuper',
          title: <FormattedMessage id="Supervisor - Dashboard" />, 
          type: 'item',
          icon: icons.samplePage,
          url: '/dashboardsuper'
        },

        {
          id: 'Monitoringsuper',
          title: <FormattedMessage id="Supervisor - Monitoring" />, 
          type: 'item',
          icon: icons.samplePage,
          url: '/Monitoringsuper'
        },

          {
          id: 'Profilesuper',
          title: <FormattedMessage id="Supervisor - Profile" />, 
          type: 'item',
          icon: icons.samplePage,
          url: '/Profilesuper'
        },
  ]
};

export default allPages;
