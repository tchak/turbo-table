import { cva, type VariantProps } from 'class-variance-authority';
import {
  FieldError as AriaFieldError,
  type FieldErrorProps as AriaFieldErrorProps,
  Group as AriaGroup,
  type GroupProps as AriaGroupProps,
  Label as AriaLabel,
  type LabelProps as AriaLabelProps,
  Text as AriaText,
  type TextProps as AriaTextProps,
  composeRenderProps,
} from 'react-aria-components';

import { cn } from '~/lib/utils';

const labelVariants = cva([
  'text-sm font-medium leading-none',
  /* Disabled */
  'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-70',
  /* Invalid */
  'group-data-[invalid]:text-red-500 dark:group-data-[invalid]:text-red-900',
]);

const Label = ({ className, ...props }: AriaLabelProps) => (
  <AriaLabel className={cn(labelVariants(), className)} {...props} />
);

function FormDescription({ className, ...props }: AriaTextProps) {
  return (
    <AriaText
      className={cn(
        'text-sm text-neutral-500 dark:text-neutral-400',
        className
      )}
      {...props}
      slot="description"
    />
  );
}

function FieldError({ className, ...props }: AriaFieldErrorProps) {
  return (
    <AriaFieldError
      className={cn(
        'text-sm font-medium text-red-500 dark:text-red-900',
        className
      )}
      {...props}
    />
  );
}

const fieldGroupVariants = cva('', {
  variants: {
    variant: {
      default: [
        'relative flex h-10 w-full items-center overflow-hidden rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white dark:border-neutral-800 dark:bg-neutral-950 dark:ring-offset-neutral-950',
        /* Focus Within */
        'data-[focus-within]:outline-none data-[focus-within]:ring-2 data-[focus-within]:ring-neutral-950 data-[focus-within]:ring-offset-2 dark:data-[focus-within]:ring-neutral-300',
        /* Disabled */
        'data-[disabled]:opacity-50',
      ],
      ghost: '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

interface GroupProps
  extends AriaGroupProps,
    VariantProps<typeof fieldGroupVariants> {}

function FieldGroup({ className, variant, ...props }: GroupProps) {
  return (
    <AriaGroup
      className={composeRenderProps(className, (className) =>
        cn(fieldGroupVariants({ variant }), className)
      )}
      {...props}
    />
  );
}

export {
  Label,
  labelVariants,
  FieldGroup,
  fieldGroupVariants,
  FieldError,
  FormDescription,
};
