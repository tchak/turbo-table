import { FileTrigger, Text } from 'react-aria-components';
import { UploadIcon } from 'lucide-react';
import type { DropEvent } from 'react-aria';
import { Link } from '~/components/ui/link';
import { DropZone } from '~/components/ui/dropzone';

export function TurboUpload({
  label,
  onSelect,
  description,
  className,
  isDisabled,
  acceptedFileTypes = [],
  maxFileSize = 5 * 1024 * 1024,
}: {
  label: string;
  onSelect: (files: File[]) => void;
  description?: string;
  className?: string;
  isDisabled?: boolean;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
}) {
  const onDrop = (event: DropEvent) => {
    const item = event.items
      .filter((item) => item.kind == 'file')
      .find((item) => acceptedFileTypes.includes(item.type));
    if (item) {
      item.getFile().then((file) => {
        if (file.size <= maxFileSize) {
          onSelect([file]);
        }
      });
    }
  };
  return (
    <DropZone onDrop={onDrop} className={className} isDisabled={isDisabled}>
      <UploadIcon
        aria-hidden="true"
        className="mx-auto size-16 text-gray-400"
      />
      <FileTrigger
        onSelect={(fileList) => {
          const files = Array.from(fileList ?? []).filter(
            (file) => file.size <= maxFileSize
          );
          if (files.length > 0) {
            onSelect(files);
          }
        }}
        acceptedFileTypes={acceptedFileTypes}
      >
        <Link variant="outline" isDisabled={isDisabled}>
          {label}
        </Link>
      </FileTrigger>
      {description ? (
        <Text slot="label" className="text-xs/5 text-gray-400">
          {description}
        </Text>
      ) : null}
    </DropZone>
  );
}
