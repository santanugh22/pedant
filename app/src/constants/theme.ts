export const colors = {
  primary: '#0E6E71', // deep teal — CTAs, active tab, bold numbers, key icons
  primaryDark: '#0A5457', // pressed state of primary
  primaryTint: '#E8F5F3', // light mint background — banners, badges, refer card
  textPrimary: '#17293A', // dark navy — headings, primary text
  textSecondary: '#6B7785', // gray — labels, captions, secondary text
  background: '#F6F8F9', // overall screen background
  surface: '#FFFFFF', // card backgrounds
  border: '#E7EBEE', // hairline dividers
  divider: '#F0F3F5',
  success: '#0E6E71',
  warning: '#D97706',
  danger: '#DC2626',
  gold: '#D4A017', // 1st place
  silver: '#9AA5B1', // 2nd place
  bronze: '#B5651D', // 3rd place
  star: '#0E6E71',
  chipBg: '#F0F4F7',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const typography = {
  h1: { fontSize: 20, fontWeight: '700' as const, color: colors.textPrimary },
  h2: { fontSize: 16, fontWeight: '700' as const, color: colors.textPrimary },
  h3: { fontSize: 15, fontWeight: '600' as const, color: colors.textPrimary },
  body: { fontSize: 14, fontWeight: '400' as const, color: colors.textPrimary, lineHeight: 20 },
  bodyMedium: { fontSize: 14, fontWeight: '500' as const, color: colors.textPrimary },
  caption: { fontSize: 12, fontWeight: '400' as const, color: colors.textSecondary },
  captionBold: { fontSize: 12, fontWeight: '600' as const, color: colors.textSecondary },
  statValue: { fontSize: 22, fontWeight: '700' as const, color: colors.textPrimary },
  statLabel: { fontSize: 12, fontWeight: '500' as const, color: colors.textSecondary },
};
