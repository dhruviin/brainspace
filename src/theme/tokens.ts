export interface ThemeColors {
  bg: string;
  surface: string;
  surface2: string;
  surface3: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  recovery: string;
}

export const MidnightDark: ThemeColors = {
  bg: '#000000',
  surface: '#101216',
  surface2: '#16181C',
  surface3: '#202327',
  textPrimary: '#FFFFFF',
  textSecondary: '#9299A3',
  border: '#292D32',
  accent: '#1D9BF0',
  success: '#00BA7C',
  warning: '#F5B942',
  danger: '#F4212E',
  recovery: '#A78BFA',
};

export const ArcticLight: ThemeColors = {
  bg: '#F7F8FA',
  surface: '#FFFFFF',
  surface2: '#F0F2F5',
  surface3: '#E7EAEE',
  textPrimary: '#111318',
  textSecondary: '#69717D',
  border: '#E3E6EA',
  accent: '#1688D4',
  success: '#079B6C',
  warning: '#C98B16',
  danger: '#D92F3A',
  recovery: '#8062D9',
};

export const setupPalette = {
  night: { ...MidnightDark, bg: '#090A12', surface: '#12151E', border: '#2B303D', textPrimary: '#F6F7FA', textSecondary: '#A7AEBD', accent: '#77B9FF' },
  day: { ...ArcticLight, bg: '#F7F8FA', textSecondary: '#525D6D', accent: '#205FA7' },
};

export const Typography = {
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  semiBold: 'Poppins-SemiBold',
  bold: 'Poppins-Bold',
  extraBold: 'Poppins-ExtraBold',
};

export const Fonts = Typography;
