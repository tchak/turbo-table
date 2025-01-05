import { Outlet, useMatches, useMatch, type UIMatch } from 'react-router';
import {
  Breadcrumbs,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '~/components/ui/breadcrumbs';

export default function Layout() {
  const isTable = !!useMatch('/table/:id');
  return (
    <div className="h-full flex flex-col">
      <header className="p-4 flex-shrink-0">
        <Navigation />
      </header>
      <main
        className={`flex flex-col flex-1 ${isTable ? 'overflow-hidden' : ''}`}
      >
        <Outlet />
      </main>
    </div>
  );
}

function Navigation() {
  const matches = useMatches();
  const breadcrumbs: Breadcrumb[] = [];
  for (const match of matches) {
    const breadcrumb = getBreadcrumb(match);
    if (breadcrumb) {
      breadcrumbs.push(breadcrumb);
    }
  }

  if (breadcrumbs.length) {
    const page = breadcrumbs.pop();

    return (
      <Breadcrumbs>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Turbo Table</BreadcrumbLink>
          <BreadcrumbSeparator />
        </BreadcrumbItem>
        {breadcrumbs.map(({ title, path }) => (
          <BreadcrumbItem key={path}>
            <BreadcrumbLink href={path}>{title}</BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
        ))}
        {page ? (
          <BreadcrumbItem className="max-w-60 sm:max-w-md md:max-w-xl">
            <BreadcrumbPage className="truncate">{page.title}</BreadcrumbPage>
          </BreadcrumbItem>
        ) : null}
      </Breadcrumbs>
    );
  } else {
    return (
      <Breadcrumbs>
        <BreadcrumbItem>
          <BreadcrumbPage>Turbo Table</BreadcrumbPage>
        </BreadcrumbItem>
      </Breadcrumbs>
    );
  }
}

type Breadcrumb = { title: string; path: string };
export type BreadcrumbFn<T = unknown> = (data: T) => Breadcrumb;
type BreadcrumbHandle = { breadcrumb: BreadcrumbFn };

function isBreadcrumb(handle: unknown): handle is BreadcrumbHandle {
  return !!(
    handle &&
    typeof handle == 'object' &&
    'breadcrumb' in handle &&
    typeof handle?.breadcrumb == 'function'
  );
}

function getBreadcrumb(match: UIMatch): Breadcrumb | false {
  const handle = match.handle;
  if (isBreadcrumb(handle)) {
    return handle.breadcrumb(match.data);
  }
  return false;
}
