import { AppProps } from 'next/app';
import '../styles/globals.scss';
import Head from 'next/head';

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      <Head>
        <title>spacetraveling</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
