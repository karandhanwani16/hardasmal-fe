import { useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';

/** Chart palette aligned with ledger semantic tokens in index.css */
export const CHART_COLORS_LIGHT = {
  terracotta: '#c45c3e',
  paid: '#2d6a4f',
  due: '#9c4221',
  dispatch: '#1d4e89',
  kitchen: '#b8860b',
  ledger700: '#4a443c',
  ledger200: '#e8e0d6',
  ledger100: '#f3efe9',
  surface: '#ffffff',
  tooltipBg: '#ffffff',
  tooltipText: '#1f1c18',
} as const;

export const CHART_COLORS_DARK = {
  terracotta: '#d46b4c',
  paid: '#3d8a63',
  due: '#c45c3e',
  dispatch: '#4a7eb8',
  kitchen: '#d4a84a',
  ledger700: '#a89f92',
  ledger200: '#3d3832',
  ledger100: '#2a2722',
  surface: '#242019',
  tooltipBg: '#2a2722',
  tooltipText: '#f3efe9',
} as const;

export interface ChartColors {
  terracotta: string;
  paid: string;
  due: string;
  dispatch: string;
  kitchen: string;
  ledger700: string;
  ledger200: string;
  ledger100: string;
  surface: string;
  tooltipBg: string;
  tooltipText: string;
}

/** @deprecated Use useChartColors() for theme-aware charts */
export const CHART_COLORS: ChartColors = CHART_COLORS_LIGHT;

export function getChartColors(isDark: boolean): ChartColors {
  return isDark ? CHART_COLORS_DARK : CHART_COLORS_LIGHT;
}

export function getStatusColors(colors: ChartColors): Record<string, string> {
  return {
    pending: colors.kitchen,
    confirmed: colors.dispatch,
    dispatched: colors.dispatch,
    delivered: colors.paid,
    completed: colors.paid,
    cancelled: colors.ledger700,
    partial: colors.due,
    paid: colors.paid,
  };
}

export function useChartColors(): { colors: ChartColors; statusColors: Record<string, string> } {
  const { theme } = useTheme();
  return useMemo(() => {
    const colors = getChartColors(theme === 'dark');
    return { colors, statusColors: getStatusColors(colors) };
  }, [theme]);
}
