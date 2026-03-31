/**
 * Client Theme Provider
 * 
 * Automatically applies a client theme on mount.
 * This ensures all components from the component library use the specified client's color scheme.
 * 
 * Available themes: 'default', 'tvg', 'otherclient' (see palettes.json for full list)
 */

'use client';

import { useEffect, useState } from 'react';
import { apply_client_theme } from '@kyndryl-design/component-library';

interface ClientThemeProviderProps {
  children: React.ReactNode;
  clientId?: string;
  autoApply?: boolean;
}

export function ClientThemeProvider({ 
  children, 
  clientId = 'tvg',
  autoApply = true 
}: ClientThemeProviderProps) {
  const [themeApplied, setThemeApplied] = useState(false);

  useEffect(() => {
    if (autoApply && clientId) {
      const applyTheme = async () => {
        try {
          const result = await apply_client_theme(clientId);
          if (result.success) {
            setThemeApplied(true);
            console.log(`Theme applied for client "${clientId}":`, result.message);
          } else {
            console.warn(`Failed to apply theme for client "${clientId}":`, result.message);
          }
        } catch (error) {
          console.error(`Error applying theme for client "${clientId}":`, error);
        }
      };

      applyTheme();
    }
  }, [autoApply, clientId]);

  return <>{children}</>;
}
