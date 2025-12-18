'use client';

import { ReactElement } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';

// NEXT
import { SessionProvider } from 'next-auth/react';

// PROJECT IMPORT
import ThemeCustomization from 'themes';
import { ConfigProvider } from 'contexts/ConfigContext';
import RTLLayout from 'components/RTLLayout';
import Locales from 'components/Locales';
import ScrollTop from 'components/ScrollTop';

import Notistack from 'components/third-party/Notistack';
import Snackbar from 'components/@extended/Snackbar';
import Customization from 'components/customization';
import { queryClient } from 'utils/client-actions';

// ==============================|| PROVIDER WRAPPER  ||============================== //

const ProviderWrapper = ({ children }: { children: ReactElement }) => {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider>
        <ThemeCustomization>
          <RTLLayout>
            <Locales>
              <ScrollTop>
                <SessionProvider refetchInterval={0} basePath={`${basePath}/api/auth`}>
                  <Notistack>
                    <Snackbar />
                    <Customization />
                    {children}
                  </Notistack>
                </SessionProvider>
              </ScrollTop>
            </Locales>
          </RTLLayout>
        </ThemeCustomization>
      </ConfigProvider>
    </QueryClientProvider>
  );
};

export default ProviderWrapper;
