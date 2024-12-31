import {
  ProgressBar as AriaProgressBar,
  type ProgressBarProps as AriaProgressBarProps,
  composeRenderProps,
} from 'react-aria-components';

import { cn } from '~/lib/utils';

import { Label, labelVariants } from './field';

interface ProgressProps extends AriaProgressBarProps {
  barClassName?: string;
  fillClassName?: string;
}

const Progress = ({
  className,
  barClassName,
  fillClassName,
  children,
  ...props
}: ProgressProps) => (
  <AriaProgressBar
    className={composeRenderProps(className, (className) =>
      cn('w-full', className)
    )}
    {...props}
  >
    {composeRenderProps(
      children,
      (children, { percentage, isIndeterminate }) => (
        <>
          {children}
          <div
            className={cn(
              'relative h-4 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800',
              barClassName
            )}
          >
            <div
              className={cn(
                `size-full flex-1 bg-neutral-900 dark:bg-neutral-50 ${
                  isIndeterminate
                    ? 'animate-in duration-1000 [--tw-enter-translate-x:calc(0px-100%)] slide-out-to-right-full repeat-infinite ease-out'
                    : 'transition-all'
                }`,
                fillClassName
              )}
              style={{
                transform: `translateX(-${
                  isIndeterminate ? 0 : 100 - (percentage || 0)
                }%)`,
              }}
            />
          </div>
        </>
      )
    )}
  </AriaProgressBar>
);

interface ProgressBarProps extends ProgressProps {
  label?: string;
  showValue?: boolean;
}

function ProgressBar({
  label,
  className,
  showValue = true,
  ...props
}: ProgressBarProps) {
  return (
    <Progress
      className={composeRenderProps(className, (className) =>
        cn('group flex flex-col gap-2', className)
      )}
      {...props}
    >
      {({ valueText }) => (
        <div className="flex w-full justify-between">
          <Label>{label}</Label>
          {showValue && <span className={labelVariants()}>{valueText}</span>}
        </div>
      )}
    </Progress>
  );
}

export { Progress, ProgressBar };
export type { ProgressProps, ProgressBarProps };
