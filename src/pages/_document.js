import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="ru">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100;300;400;500;600;700;900&family=Lato:wght@100;300;400;500;600;700;900&family=Montserrat:wght@100;300;400;500;600;700;900&family=Nunito:wght@100;300;400;500;600;700;900&family=Open+Sans:wght@100;300;400;500;600;700;900&family=Poppins:wght@100;300;400;500;600;700;900&family=Raleway:wght@100;300;400;500;600;700;900&family=Roboto:wght@100;300;400;500;600;700;900&family=Source+Sans+Pro:wght@100;300;400;500;600;700;900&family=Ubuntu:wght@100;300;400;500;600;700;900&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
} 