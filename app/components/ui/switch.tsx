import {
  Switch as AriaSwitch,
  type SwitchProps as AriaSwitchProps,
  composeRenderProps,
} from 'react-aria-components';

import { cn } from '~/lib/utils';

const Switch = ({ children, className, ...props }: AriaSwitchProps) => (
  <AriaSwitch
    className={composeRenderProps(className, (className) =>
      cn(
        'group inline-flex items-center gap-2 text-sm font-medium leading-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-70',
        className
      )
    )}
    {...props}
  >
    {composeRenderProps(children, (children) => (
      <>
        <div
          className={cn(
            'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors',
            /* Focus Visible */
            'group-data-[focus-visible]:outline-none group-data-[focus-visible]:ring-2 group-data-[focus-visible]:ring-neutral-950 group-data-[focus-visible]:ring-offset-2 group-data-[focus-visible]:ring-offset-white dark:group-data-[focus-visible]:ring-neutral-300 dark:group-data-[focus-visible]:ring-offset-neutral-950',
            /* Disabled */
            'group-data-[disabled]:cursor-not-allowed group-data-[disabled]:opacity-50',
            /* Selected */
            'bg-neutral-200 group-data-[selected]:bg-neutral-900 dark:bg-neutral-800 dark:group-data-[selected]:bg-neutral-50',
            /* Readonly */
            'group-data-[readonly]:cursor-default',
            /* Resets */
            'focus-visible:outline-none'
          )}
        >
          <div
            className={cn(
              'pointer-events-none block size-5 rounded-full bg-white shadow-lg ring-0 transition-transform dark:bg-neutral-950',
              /* Selected */
              'translate-x-0 group-data-[selected]:translate-x-5'
            )}
          />
        </div>
        {children}
      </>
    ))}
  </AriaSwitch>
);

export { Switch };
