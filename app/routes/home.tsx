import type { Route } from './+types/home';
import { redirect, useFetcher } from 'react-router';
import { TrashIcon } from 'lucide-react';
import { Button } from '~/components/ui/button';

import { TurboUpload } from '~/components/turbo-upload';
import { GridList, GridListItem } from '~/components/ui/grid-list';

import { getTables, importTable, deleteTable } from '~/core/store.client';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Turbo Table' }];
}

export async function clientLoader({}: Route.ClientLoaderArgs) {
  const tables = await getTables();
  return { tables };
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const action = formData.get('action');
  if (action == 'import') {
    const file = formData.get('file');
    if (file && file instanceof File) {
      const tableId = await importTable(file);
      return redirect(`/table/${tableId}`);
    }
    return { error: 'No file provided' };
  } else if (action == 'delete') {
    const tableId = formData.get('tableId');
    if (typeof tableId == 'string') {
      await deleteTable(tableId);
      return redirect('/');
    }
    return { error: 'No table ID provided' };
  }
  return { error: 'No action provided' };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher();
  const importTable = (files: File[]) => {
    const file = files.at(0);
    if (file) {
      const formData = new FormData();
      formData.append('action', 'import');
      formData.append('file', file);
      fetcher.submit(formData, {
        method: 'POST',
        encType: 'multipart/form-data',
      });
    }
  };
  const deleteTable = (tableId: string) => {
    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('tableId', tableId);
    fetcher.submit(formData, {
      method: 'POST',
    });
  };
  const isSubmitting = fetcher.state == 'submitting';

  return (
    <div className="flex flex-col gap-10 px-4">
      <GridList
        aria-label="Tables list"
        items={loaderData.tables}
        renderEmptyState={() => <div className="p-4">No files</div>}
      >
        {(table) => (
          <GridListItem textValue={table.name} href={`/table/${table.id}`}>
            <div className="flex items-center justify-between w-full">
              <div>{table.name}</div>
              <Button
                variant="destructive"
                size="icon"
                onPress={() => deleteTable(table.id)}
                isPending={isSubmitting}
              >
                <TrashIcon />
              </Button>
            </div>
          </GridListItem>
        )}
      </GridList>
      <TurboUpload
        label="Upload a file"
        onSelect={importTable}
        description="Or drag and drop CSV, XLSX, ODS, Numbers up to 5MB"
        acceptedFileTypes={acceptedFileTypes}
        maxFileSize={maxFileSize}
        className="w-1/3 mx-auto py-6 h-auto gap-6"
        isDisabled={isSubmitting}
      />
    </div>
  );
}

const maxFileSize = 5 * 1024 * 1024; // 10MB
const acceptedFileTypes = [
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.apple.numbers',
];
