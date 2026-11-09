import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/** Web document shell — prevent stretched mobile column on wide desktops. */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: responsiveRoot }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveRoot = `
html, body, #root {
  height: 100%;
  margin: 0;
  background: #0A1931;
}
body {
  overflow-x: hidden;
}
#root {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}
`;
