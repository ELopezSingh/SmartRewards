export const Colors = {
  // ── Marca ──────────────────────────────────────────────
  navy: '#0A1E42',
  yellow: '#FFD500',
 
  // ── Base ───────────────────────────────────────────────
  white: '#FFFFFF',
  black: '#000000',
 
  // ── Grises (de las variables del tema) ─────────────────
  background: '#FFFFFF',
  muted: '#ECECF0',
  mutedForeground: '#717182',
  accent: '#E9EBEF',
  inputBackground: '#F3F3F5',
  switchBackground: '#CBCED4',
  border: 'rgba(0, 0, 0, 0.1)',
 
  // ── Semánticos ─────────────────────────────────────────
  primary: '#030213',
  destructive: '#D4183D',
  destructiveForeground: '#FFFFFF',
 
  // ── Transparencias navy (útiles para overlays y textos) ─
  navyOpacity70: 'rgba(10, 30, 66, 0.7)',
  navyOpacity20: 'rgba(10, 30, 66, 0.2)',
  navyOpacity10: 'rgba(10, 30, 66, 0.1)',
} as const;
 
export const FontSize = {
  xs: 11,
  sm: 13,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;
 
export const FontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};
 
export const Radius = {
  sm: 6,   // 0.625rem - 4px ≈ 6px
  md: 8,   // 0.625rem - 2px ≈ 8px
  lg: 10,  // 0.625rem base
  xl: 14,  // 0.625rem + 4px ≈ 14px
  full: 9999,
} as const;
 
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
  '7xl': 80,
} as const;
 