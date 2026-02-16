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
  Setting2,
  Award,
  Scanner,
  ArchiveBook,
  Notification,
  Additem,
  TextBlock,
  UserAdd
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
  settings: Setting2,
  assessment: Award,
  scanner: Scanner,
  arsip: ArchiveBook,
  notifications: Notification,
  registration: Additem,
  formBuilder: TextBlock,
  applications: UserAdd
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
      id: 'Arsip',
      title: <FormattedMessage id="Arsip Institusi" />,
      type: 'item',
      icon: icons.arsip,
      url: '/arsip'
    },
    {
      id: 'Map Settings',
      title: <FormattedMessage id="Map Settings" />,
      type: 'item',
      icon: icons.mapSettings,
      url: '/MapSettings'
    },
    {
      id: 'Certificate Scanner',
      title: <FormattedMessage id="Certificate Scanner" />,
      type: 'item',
      icon: icons.scanner,
      url: '/CertificateScanner'
    },
    {
      id: 'Notification Settings',
      title: <FormattedMessage id="Notification Settings" />,
      type: 'collapse',
      icon: icons.notifications,
      children: [
        {
          id: 'Notification Templates',
          title: <FormattedMessage id="Message Templates" />,
          type: 'item',
          url: '/admin/notification-templates'
        },
        {
          id: 'Telegram Notifications',
          title: <FormattedMessage id="Telegram Logs" />,
          type: 'item',
          url: '/admin/telegram-notifications'
        }
      ]
    },
    {
      id: 'Registration System',
      title: <FormattedMessage id="Digital Registration" />,
      type: 'collapse',
      icon: icons.registration,
      children: [
        {
          id: 'Form Builder',
          title: <FormattedMessage id="Form Builder" />,
          type: 'item',
          icon: icons.formBuilder,
          url: '/admin/registration/forms'
        },
        {
          id: 'Applications',
          title: <FormattedMessage id="Registrasi Masuk" />,
          type: 'item',
          icon: icons.applications,
          url: '/admin/registration/applications'
        }
      ]
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
      id: 'Assessmentsuper',
      title: <FormattedMessage id="Rekap Penilaian" />,
      type: 'item',
      icon: icons.assessment,
      url: '/assessmentsuper'
    },
    {
      id: 'AttendanceReport',
      title: <FormattedMessage id="Rekap Kehadiran" />,
      type: 'item',
      icon: icons.reports,
      url: '/AttendanceReport'
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
