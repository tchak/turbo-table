import { cva, type VariantProps } from 'class-variance-authority';
import {
  ToggleButton as AriaToggleButton,
  composeRenderProps,
  type ToggleButtonProps as AriaToggleButtonProps,
} from 'react-aria-components';

import { cn } from '~/lib/utils';

const toggleVariants = cva(
  [
    'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors dark:ring-offset-neutral-950',
    /* Disabled */
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
    /* Hover */
    'data-[hovered]:bg-neutral-100 data-[hovered]:text-neutral-500 dark:data-[hovered]:bg-neutral-800 dark:data-[hovered]:text-neutral-400',
    /* Selected */
    'data-[selected]:bg-neutral-100 data-[selected]:text-neutral-900 dark:data-[selected]:bg-neutral-800 dark:data-[selected]:text-neutral-50',
    /* Focus Visible */
    'data-[focus-visible]:outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-neutral-950 data-[focus-visible]:ring-offset-2 dark:data-[focus-visible]:ring-neutral-300',
    /* Resets */
    'focus-visible:outline-none',
  ],
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline:
          'border border-neutral-200 bg-transparent data-[hovered]:bg-neutral-100 data-[hovered]:text-neutral-900 dark:border-neutral-800 dark:data-[hovered]:bg-neutral-800 dark:data-[hovered]:text-neutral-50',
      },
      size: {
        default: 'h-10 px-3',
        sm: 'h-9 px-2.5',
        lg: 'h-11 px-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface ToggleProps
  extends AriaToggleButtonProps,
    VariantProps<typeof toggleVariants> {}

const Toggle = ({ className, variant, size, ...props }: ToggleProps) => (
  <AriaToggleButton
    className={composeRenderProps(className, (className) =>
      cn(
        toggleVariants({
          variant,
          size,
          className,
        })
      )
    )}
    {...props}
  />
);

export { Toggle, toggleVariants };
export type { ToggleProps };
