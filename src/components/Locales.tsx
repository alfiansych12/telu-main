'use client';

import { ReactNode, useEffect, useState } from 'react';

// THIRD - PARTY
import { IntlProvider, MessageFormatElement } from 'react-intl';

// PROJECT IMPORTS
import useConfig from 'hooks/useConfig';
import { I18n } from 'types/config';

// load locales files
const loadLocaleData = (locale: I18n) => {
  switch (locale) {
    case 'id':
      return import('utils/locales/id.json');
    case 'en':
    default:
      return import('utils/locales/en.json');
  }
};

// ==============================|| LOCALIZATION ||============================== //

interface Props {
  children: ReactNode;
}

const Locales = ({ children }: Props) => {
  const { i18n } = useConfig();
  const [messages, setMessages] = useState<Record<string, string> | Record<string, MessageFormatElement[]> | undefined>();

  useEffect(() => {
    loadLocaleData(i18n).then((d: { default: Record<string, string> | Record<string, MessageFormatElement[]> | undefined }) => {
      setMessages(d.default);
    });
  }, [i18n]);

  // Render children immediately to avoid hydration issues, 
  // but wrap in IntlProvider only when messages are ready.
  // We provide a fallback empty object for messages initially.
  return (
    <IntlProvider locale={i18n} defaultLocale="en" messages={messages || {}}>
      {children}
    </IntlProvider>
  );
};

export default Locales;
