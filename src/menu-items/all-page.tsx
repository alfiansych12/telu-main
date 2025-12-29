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

// ==============================|| MENU ITEMS - ADMIN MENU ||============================== //

const adminMenu: NavItemType = {
  id: 'admin-menu',
  title: <FormattedMessage id="Menu Admin" />,
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: <FormattedMessage id="Dashboard" />,
      type: 'item',
      icon: icons.samplePage,
      url: '/dashboard'
    },
    {
      id: 'Management Data',
      title: <FormattedMessage id="Management Data" />,
      type: 'item',
      icon: icons.samplePage,
      url: '/ManagementData'
    },
    {
      id: 'Reports Monitoring',
      title: <FormattedMessage id="Reports Monitoring" />,
      type: 'item',
      icon: icons.samplePage,
      url: '/ReportsMonitoring'
    },
    {
      id: 'Profileadmin',
      title: <FormattedMessage id="Profile" />,
      type: 'item',
      icon: icons.samplePage,
      url: '/Profileadmin'
    }
  ]
};

// ==============================|| MENU ITEMS - USER MENU ||============================== //

const userMenu: NavItemType = {
  id: 'user-menu',
  title: <FormattedMessage id="Menu Users" />,
  type: 'group',
  children: [
    {
      id: 'Dashboarduser',
      title: <FormattedMessage id="Dashboard" />,
      type: 'item',
      icon: icons.samplePage,
      url: '/dashboarduser'
    },
    {
      id: 'Profiluser',
      title: <FormattedMessage id="Profile" />,
      type: 'item',
      icon: icons.samplePage,
      url: '/Profilepart'
    }
  ]
};

// ==============================|| MENU ITEMS - SUPERVISOR MENU ||============================== //

const supervisorMenu: NavItemType = {
  id: 'supervisor-menu',
  title: <FormattedMessage id="Menu Supervisors" />,
  type: 'group',
  children: [
    {
      id: 'Dashboardsuper',
      title: <FormattedMessage id="Dashboard" />,
      type: 'item',
      icon: icons.samplePage,
      url: '/dashboardsuper'
    },
    {
      id: 'Monitoringsuper',
      title: <FormattedMessage id="Monitoring" />,
      type: 'item',
      icon: icons.samplePage,
      url: '/Monitoringsuper'
    },
    {
      id: 'Profilesuper',
      title: <FormattedMessage id="Profile" />,
      type: 'item',
      icon: icons.samplePage,
      url: '/Profilesuper'
    }
  ]
};

// ==============================|| EXPORT ALL MENUS ||============================== //

export { adminMenu, userMenu, supervisorMenu };
export default adminMenu;
