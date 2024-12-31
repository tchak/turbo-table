import { Outlet, useMatches, type UIMatch } from 'react-router';
import {
  Breadcrumbs,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '~/components/ui/breadcrumbs';

export default function Layout() {
  const matches = useMatches();
  const breadcrumbs: Breadcrumb[] = [];
  for (const match of matches) {
    const breadcrumb = getBreadcrumb(match);
    if (breadcrumb) {
      breadcrumbs.push(breadcrumb);
    }
  }
  const page = breadcrumbs.pop();

  return (
    <div className="h-screen flex flex-col">
      <header className="p-2 flex-shrink-0">
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
            <BreadcrumbItem>
              <BreadcrumbPage>{page.title}</BreadcrumbPage>
            </BreadcrumbItem>
          ) : null}
        </Breadcrumbs>
      </header>
      <main className="flex flex-col flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
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
