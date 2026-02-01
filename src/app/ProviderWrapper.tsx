'use client';

import { ReactNode, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';

// NEXT
import { SessionProvider } from 'next-auth/react';

// PROJECT IMPORT
import ThemeCustomization from 'themes';
import { ConfigProvider } from 'contexts/ConfigContext';
import RTLLayout from 'components/RTLLayout';
import Locales from 'components/Locales';

import Notistack from 'components/third-party/Notistack';
import Snackbar from 'components/@extended/Snackbar';
import CustomAlert from 'components/@extended/CustomAlert';
import Customization from 'components/customization';
import { createQueryClient } from 'utils/client-actions';

// ==============================|| PROVIDER WRAPPER  ||============================== //

const ProviderWrapper = ({ children }: { children: ReactNode }) => {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider>
        <ThemeCustomization>
          <RTLLayout>
            <Locales>
              <SessionProvider refetchInterval={0} basePath={`${basePath}/api/auth`}>
                <Notistack>
                  <Snackbar />
                  <CustomAlert />
                  <Customization />
                  {children}
                </Notistack>
              </SessionProvider>
            </Locales>
          </RTLLayout>
        </ThemeCustomization>
      </ConfigProvider>
    </QueryClientProvider>
  );
};

export default ProviderWrapper;
