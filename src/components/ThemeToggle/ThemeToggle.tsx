'use client';

import { ToggleGroup, ToggleGroupItem } from '@konopskidev/ui';
import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

const THEME_OPTIONS = [
  { value: 'light', label: 'Light theme', Icon: SunIcon },
  { value: 'system', label: 'System theme', Icon: MonitorIcon },
  { value: 'dark', label: 'Dark theme', Icon: MoonIcon },
] as const;

const DEFAULT_THEME = 'system';

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Segmented light/system/dark switch.
 *
 * The stored preference is unknown while rendering on the server, so the first
 * paint always shows "system" — the same output the server produced — and the
 * real value takes over once mounted. The options deliberately carry no
 * tooltips: a tooltip trigger wrapper replaces the toggle's `data-state`, which
 * leaves the control showing no active selection.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isMounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  return (
    <ToggleGroup
      aria-label="Color theme"
      type="single"
      variant="outline"
      size="sm"
      spacing={0}
      value={isMounted ? theme : DEFAULT_THEME}
      onValueChange={(value) => value && setTheme(value)}
    >
      {THEME_OPTIONS.map(({ value, label, Icon }) => (
        <ToggleGroupItem key={value} value={value} aria-label={label} title={label}>
          <Icon />
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
