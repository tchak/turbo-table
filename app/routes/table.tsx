import type { Route, Info } from './+types/table';
import { redirect, Await, useFetcher } from 'react-router';
import { Suspense } from 'react';

import { TurboTable } from '~/components/turbo-table/turbo-table';
import { ProgressBar } from '~/components/ui/progress';

import { getTable, getRows, updateView } from '~/core/store.client';
import { ViewSchema } from '~/core/schema';
import { processSubmission, useActionFetcher } from '~/lib/action';
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

export function clientAction({ params, request }: Route.ClientActionArgs) {
  return processSubmission({
    request,
    schema: ViewSchema,
    resolve: (data) => updateView(params.id, data).map(() => true),
  });
}

export default function TableRoute({ loaderData }: Route.ComponentProps) {
  const { submit } = useActionFetcher();
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
              submit(view);
            }}
          />
        )}
      </Await>
    </Suspense>
  );
}
