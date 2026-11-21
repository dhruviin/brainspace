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
  bg: '#121212',
  surface: '#181818',
  surface2: '#242424',
  surface3: '#2A2A2A',
  textPrimary: '#FFFFFF',
  textSecondary: '#B3B3B3',
  border: 'rgba(255, 255, 255, 0.06)',
  accent: '#1DB954',
  success: '#1DB954',
  warning: '#FFA42B',
  danger: '#E91429',
  recovery: '#1DB954',
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
