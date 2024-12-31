import { cva, type VariantProps } from 'class-variance-authority';
import {
  Button as AriaButton,
  composeRenderProps,
  type ButtonProps as AriaButtonProps,
} from 'react-aria-components';

import { cn } from '~/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors dark:ring-offset-neutral-950',
    /* Disabled */
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
    /* Focus Visible */
    'data-[focus-visible]:outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-neutral-950 data-[focus-visible]:ring-offset-2 dark:data-[focus-visible]:ring-neutral-300',
    /* Resets */
    'focus-visible:outline-none',
  ],
  {
    variants: {
      variant: {
        default:
          'bg-neutral-900 text-neutral-50 data-[hovered]:bg-neutral-900/90 dark:bg-neutral-50 dark:text-neutral-900 dark:data-[hovered]:bg-neutral-50/90',
        destructive:
          'bg-red-500 text-neutral-50 data-[hovered]:bg-red-500/90 dark:bg-red-900 dark:text-neutral-50 dark:data-[hovered]:bg-red-900/90',
        outline:
          'border border-neutral-200 bg-white data-[hovered]:bg-neutral-100 data-[hovered]:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:data-[hovered]:bg-neutral-800 dark:data-[hovered]:text-neutral-50',
        secondary:
          'bg-neutral-100 text-neutral-900 data-[hovered]:bg-neutral-100/80 dark:bg-neutral-800 dark:text-neutral-50 dark:data-[hovered]:bg-neutral-800/80',
        ghost:
          'data-[hovered]:bg-neutral-100 data-[hovered]:text-neutral-900 dark:data-[hovered]:bg-neutral-800 dark:data-[hovered]:text-neutral-50',
        link: 'text-neutral-900 underline-offset-4 data-[hovered]:underline dark:text-neutral-50',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface ButtonProps
  extends AriaButtonProps,
    VariantProps<typeof buttonVariants> {}

const Button = ({ className, variant, size, ...props }: ButtonProps) => {
  return (
    <AriaButton
      className={composeRenderProps(className, (className) =>
        cn(
          buttonVariants({
            variant,
            size,
            className,
          })
        )
      )}
      {...props}
    />
  );
};

export { Button, buttonVariants };
export type { ButtonProps };
