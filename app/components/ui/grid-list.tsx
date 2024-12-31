import { GripHorizontal } from 'lucide-react';
import {
  Button as AriaButton,
  GridList as AriaGridList,
  GridListItem as AriaGridListItem,
  type GridListItemProps as AriaGridListItemProps,
  type GridListProps as AriaGridListProps,
  composeRenderProps,
} from 'react-aria-components';

import { cn } from '~/lib/utils';
import { Checkbox } from '~/components/ui/checkbox';

export function GridList<T extends object>({
  children,
  ...props
}: AriaGridListProps<T>) {
  return (
    <AriaGridList
      {...props}
      className={composeRenderProps(props.className, (className) =>
        cn(
          'jolly-GridList group flex flex-col gap-2 overflow-auto rounded-md border border-neutral-200 bg-white p-1 text-neutral-950 shadow-md outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50',
          /* Empty */
          'data-[empty]:p-6 data-[empty]:text-center data-[empty]:text-sm',
          className
        )
      )}
    >
      {children}
    </AriaGridList>
  );
}

export function GridListItem({
  children,
  className,
  ...props
}: AriaGridListItemProps) {
  let textValue = typeof children === 'string' ? children : undefined;
  return (
    <AriaGridListItem
      textValue={textValue}
      className={composeRenderProps(className, (className) =>
        cn(
          'jolly-GridListItem relative flex w-full cursor-default select-none items-center gap-3 rounded-sm px-2 py-1.5 text-sm outline-none',
          /* Disabled */
          'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          /* Focus Visible */
          'data-[focus-visible]:z-10 data-[focus-visible]:outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-neutral-950 data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-white dark:data-[focus-visible]:ring-neutral-300 dark:data-[focus-visible]:ring-offset-neutral-950',
          /* Hovered */
          'data-[hovered]:bg-neutral-100 data-[hovered]:text-neutral-900 dark:data-[hovered]:bg-neutral-800 dark:data-[hovered]:text-neutral-50',
          /* Selected */
          'data-[selected]:bg-neutral-100 data-[selected]:text-neutral-900 dark:data-[selected]:bg-neutral-800 dark:data-[selected]:text-neutral-50',
          /* Dragging */
          'data-[dragging]:opacity-60',
          className
        )
      )}
      {...props}
    >
      {composeRenderProps(children, (children, renderProps) => (
        <>
          {/* Add elements for drag and drop and selection. */}
          {renderProps.allowsDragging && (
            <AriaButton slot="drag">
              <GripHorizontal className="size-4" />
            </AriaButton>
          )}
          {renderProps.selectionMode === 'multiple' &&
            renderProps.selectionBehavior === 'toggle' && (
              <Checkbox slot="selection" />
            )}
          {children}
        </>
      ))}
    </AriaGridListItem>
  );
}
