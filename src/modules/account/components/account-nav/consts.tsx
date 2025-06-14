import {
  BoxIcon,
  DashboardIcon,
  LogoutIcon,
  SettingsIcon,
  ShippingIcon,
} from '@modules/common/icons'

// Using a clock icon for browsing history - you might want to replace with a proper icon
const HistoryIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

export const profileNavItemsGroups = [
  [
    {
      href: '/account',
      icon: <DashboardIcon className="h-6 w-6" />,
      label: 'Dashboard',
      type: 'link',
    },
    {
      href: '/account/orders',
      icon: <BoxIcon className="h-6 w-6" />,
      label: 'Order history',
      type: 'link',
    },
    {
      href: '/account/browsing-history',
      icon: <HistoryIcon className="h-6 w-6" />,
      label: 'Browsing history',
      type: 'link',
    },
  ],
  [
    {
      href: '/account/addresses',
      icon: <ShippingIcon className="h-6 w-6" />,
      label: 'Shipping details',
      type: 'link',
    },
    {
      href: '/account/profile',
      icon: <SettingsIcon className="h-6 w-6" />,
      label: 'Account settings',
      type: 'link',
    },
  ],
  [
    {
      href: '',
      type: 'logout',
      icon: <LogoutIcon className="h-6 w-6" />,
      label: 'Log out',
    },
  ],
]
