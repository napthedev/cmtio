import "../styles/globals.css";

import type { AppProps } from "next/app";
import Head from "next/head";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider
      defaultTheme="system"
      attribute="class"
      forcedTheme={pageProps.theme || null}
    >
      <SessionProvider session={pageProps.session}>
        <Head>
          <link rel="shortcut icon" href="/icon.png" type="image/x-icon" />
        </Head>
        <Component {...pageProps} />
      </SessionProvider>
    </ThemeProvider>
  );
}

export default MyApp;
