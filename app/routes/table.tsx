import type { Route, Info } from './+types/table';
import { redirect, Await, useFetcher } from 'react-router';
import { Suspense } from 'react';

import { TurboTable } from '~/components/turbo-table/turbo-table';
import { ProgressBar } from '~/components/ui/progress';

import { getTable, getRows, updateView } from '~/core/store.client';
import { ViewSchema } from '~/core/schema';
import type { BreadcrumbFn } from './layout';

export function meta({ data }: Route.MetaArgs) {
  if (data) {
    return [{ title: `Turbo Table | ${data.table.name}` }];
  }
  return [{ title: 'Turbo Table' }];
}

export const handle = {
  breadcrumb(data) {
    return { title: data.table.name, path: `/table/${data.table.id}` };
  },
} satisfies { breadcrumb: BreadcrumbFn<Info['loaderData']> };

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const table = await getTable(params.id);
  if (!table) {
    throw redirect('/');
  }
  const rows = getRows(params.id);
  return { table, rows };
}

export async function clientAction({
  params,
  request,
}: Route.ClientActionArgs) {
  const data = await request.json();
  const view = ViewSchema.parse(data);
  await updateView(params.id, view);
  return { ok: true };
}

export default function TableRoute({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher();
  return (
    <Suspense
      fallback={
        <ProgressBar
          className="max-w-md mx-auto mt-4 truncate"
          isIndeterminate
          label={`Loading "${loaderData.table.name}"`}
          showValue={false}
          barClassName="h-2"
        />
      }
    >
      <Await resolve={loaderData.rows}>
        {(rows) => (
          <TurboTable
            columns={loaderData.table.columns}
            data={rows}
            view={loaderData.table.view}
            onChange={(view) => {
              fetcher.submit(ViewSchema.parse(view), {
                method: 'POST',
                encType: 'application/json',
              });
            }}
          />
        )}
      </Await>
    </Suspense>
  );
}
