// src/pages/_app.tsx
import React from 'react';
import { AppProps } from 'next/app';
import { PrimeReactProvider } from 'primereact/api';
import '@/app/global.css';
import 'primereact/resources/primereact.min.css'; // PrimeReact core CSS
import 'primereact/resources/themes/saga-blue/theme.css'; // PrimeReact theme
import 'primeicons/primeicons.css'; // PrimeIcons CSS

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <PrimeReactProvider>
      <Component {...pageProps} />
    </PrimeReactProvider>
  );
}

export default MyApp;
