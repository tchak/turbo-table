import type { Route } from './+types/home';
import { TrashIcon } from 'lucide-react';
import { z } from 'zod';

import { Button } from '~/components/ui/button';
import { TurboUpload } from '~/components/turbo-upload';
import { GridList, GridListItem } from '~/components/ui/grid-list';

import { getTables, importTable, deleteTable } from '~/core/store.client';
import { processSubmission, useActionFetcher } from '~/lib/action';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Turbo Table' }];
}

export async function clientLoader({}: Route.ClientLoaderArgs) {
  return { tables: await getTables() };
}

export function clientAction({ request }: Route.ClientActionArgs) {
  return processSubmission({
    request,
    schema,
    resolve(data) {
      switch (data.action) {
        case 'import':
          return importTable(data.file).map((tableId) => `/table/${tableId}`);
        case 'delete': {
          return deleteTable(data.tableId).map(() => '/');
        }
      }
    },
  });
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { isSubmitting, submit } = useActionFetcher();

  return (
    <div className="flex flex-col gap-10 px-4">
      <GridList
        aria-label="Tables list"
        items={loaderData.tables}
        renderEmptyState={() => <div className="p-4">No files</div>}
      >
        {(table) => (
          <GridListItem textValue={table.name} href={`/table/${table.id}`}>
            <div className="flex items-center justify-between gap-4 w-full">
              <div className="truncate">{table.name}</div>
              <Button
                variant="destructive"
                size="icon"
                onPress={() => submit({ action: 'delete', tableId: table.id })}
                isPending={isSubmitting}
                className="flex-shrink-0"
              >
                <TrashIcon />
              </Button>
            </div>
          </GridListItem>
        )}
      </GridList>
      <TurboUpload
        label="Upload a file"
        onSelect={(files) => {
          const file = files.at(0);
          if (file) {
            submit({ action: 'import', file });
          }
        }}
        description="Or drag & drop CSV, XLSX, ODS, Numbers up to 5MB"
        acceptedFileTypes={acceptedFileTypes}
        maxFileSize={maxFileSize}
        className="mx-auto py-6 h-auto gap-6 min-w-full md:min-w-96"
        isDisabled={isSubmitting}
      />
    </div>
  );
}

const maxFileSize = 5 * 1024 * 1024; // 5MB
const acceptedFileTypes = [
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.apple.numbers',
];

const schema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('import'), file: z.instanceof(File) }),
  z.object({ action: z.literal('delete'), tableId: z.string().uuid() }),
]);
