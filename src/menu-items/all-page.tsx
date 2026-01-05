// THIRD - PARTY
import { FormattedMessage } from 'react-intl';

// ASSETS
import {
  Category,
  People,
  DocumentText,
  Location,
  User,
  Eye,
  Setting2
} from 'iconsax-react';

// TYPE
import { NavItemType } from 'types/menu';

// ICONS
const icons = {
  dashboard: Category,
  managementData: People,
  reports: DocumentText,
  mapSettings: Location,
  profile: User,
  monitoring: Eye,
  settings: Setting2
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
      icon: icons.dashboard,
      url: '/dashboard'
    },
    {
      id: 'Management Data',
      title: <FormattedMessage id="Management Data" />,
      type: 'item',
      icon: icons.managementData,
      url: '/ManagementData'
    },
    {
      id: 'Reports Monitoring',
      title: <FormattedMessage id="Reports Monitoring" />,
      type: 'item',
      icon: icons.reports,
      url: '/ReportsMonitoring'
    },
    {
      id: 'Map Settings',
      title: <FormattedMessage id="Map Settings" />,
      type: 'item',
      icon: icons.mapSettings,
      url: '/MapSettings'
    },
    {
      id: 'Profileadmin',
      title: <FormattedMessage id="Profile" />,
      type: 'item',
      icon: icons.profile,
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
      icon: icons.dashboard,
      url: '/dashboarduser'
    },
    {
      id: 'Profiluser',
      title: <FormattedMessage id="Profile" />,
      type: 'item',
      icon: icons.profile,
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
      icon: icons.dashboard,
      url: '/dashboardsuper'
    },
    {
      id: 'Monitoringsuper',
      title: <FormattedMessage id="Monitoring" />,
      type: 'item',
      icon: icons.monitoring,
      url: '/Monitoringsuper'
    },
    {
      id: 'Profilesuper',
      title: <FormattedMessage id="Profile" />,
      type: 'item',
      icon: icons.profile,
      url: '/Profilesuper'
    }
  ]
};

// ==============================|| EXPORT ALL MENUS ||============================== //

export { adminMenu, userMenu, supervisorMenu };
export default adminMenu;
