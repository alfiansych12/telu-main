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
// ==============================|| MENU ITEMS - PARTICIPANT MENU ||============================== //
const participantMenu: NavItemType = {
  id: 'Participant-menu',
  title: <FormattedMessage id="Participant Menu" />, 
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: <FormattedMessage id="dashboard" />, 
      type: 'item',
      icon: icons.samplePage,
      url: '/dashboard'
    },
    {
      id: 'Reports Monitoring',
      title: <FormattedMessage id="Reports Monitoring" />, 
      type: 'item',
      icon: icons.samplePage,
      url: '/ReportsMonitoring'
    }
    // Tambahkan menu khusus participant di sini jika perlu
  ]
};

export default participantMenu;
