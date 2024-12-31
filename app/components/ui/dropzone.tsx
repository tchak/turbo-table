import {
  DropZone as AriaDropZone,
  type DropZoneProps as AriaDropZoneProps,
  composeRenderProps,
} from 'react-aria-components';

import { cn } from '~/lib/utils';

const DropZone = ({ className, ...props }: AriaDropZoneProps) => (
  <AriaDropZone
    className={composeRenderProps(className, (className) =>
      cn(
        'flex h-[150px] w-[300px] flex-col items-center justify-center gap-2 rounded-md border border-neutral-200 border-dashed text-sm ring-offset-white dark:border-neutral-800 dark:ring-offset-neutral-950',
        /* Drop Target */
        'data-[drop-target]:border-solid data-[drop-target]:border-neutral-900 data-[drop-target]:bg-neutral-100 dark:data-[drop-target]:border-neutral-50 dark:data-[drop-target]:bg-neutral-800',
        /* Focus Visible */
        'data-[focus-visible]:outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-neutral-950 data-[focus-visible]:ring-offset-2 dark:data-[focus-visible]:ring-neutral-300',
        className
      )
    )}
    {...props}
  />
);

export { DropZone };
