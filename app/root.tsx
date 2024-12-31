import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useHref,
  useNavigate,
  useMatch,
} from 'react-router';
import { I18nProvider, RouterProvider } from 'react-aria-components';
import { useMemo } from 'react';

import type { Route } from './+types/root';
import stylesheet from './app.css?url';

export const links: Route.LinksFunction = () => [
  { rel: 'stylesheet', href: stylesheet },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const isTable = !!useMatch('/table/:id');
  return (
    <html
      lang={DEFAULT_LOCALE}
      className={`bg-white dark:bg-gray-950 h-full ${
        isTable ? 'overflow-hidden' : ''
      }`}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <PlausibleScript />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const navigate = useNavigate();
  return (
    <I18nProvider locale={DEFAULT_LOCALE}>
      <RouterProvider navigate={navigate} useHref={useHref}>
        <Outlet />
      </RouterProvider>
    </I18nProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details =
      error.status === 404
        ? 'The requested page could not be found.'
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}

const DEFAULT_LOCALE = 'en';

function PlausibleScript() {
  const props = useMemo(() => {
    const PLAUSIBLE_URL = import.meta.env.VITE_PLAUSIBLE_URL;
    const PLAUSIBLE_DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN;
    if (PLAUSIBLE_URL && PLAUSIBLE_DOMAIN) {
      return { 'data-domain': PLAUSIBLE_DOMAIN, src: PLAUSIBLE_URL };
    }
    return null;
  }, []);
  if (props) {
    return <script defer {...props} />;
  }
  return null;
}
