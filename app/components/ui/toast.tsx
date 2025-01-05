import type { AriaToastRegionProps, AriaToastProps } from '@react-aria/toast';
import type { ToastState } from '@react-stately/toast';
import { useToastRegion, useToast } from '@react-aria/toast';
import { ToastQueue, useToastQueue } from '@react-stately/toast';
import { useRef } from 'react';
import { CircleXIcon } from 'lucide-react';
import { Button } from '~/components/ui/button';

export interface ToastContent {
  title: string;
  description?: string;
}

export const toastQueue = new ToastQueue<ToastContent>({
  maxVisibleToasts: 5,
  hasExitAnimation: true,
});

export function ToastContainer(props: AriaToastRegionProps) {
  const ref = useRef(null);
  const state = useToastQueue(toastQueue);
  const { regionProps } = useToastRegion(props, state, ref);

  return (
    <div {...regionProps} ref={ref} className="fixed right-0 bottom-0 z-30 p-2">
      {state.visibleToasts.map((toast) => (
        <Toast key={toast.key} toast={toast} state={state} />
      ))}
    </div>
  );
}

interface ToastProps<T> extends AriaToastProps<T> {
  state: ToastState<T>;
}

function Toast({ state, ...props }: ToastProps<ToastContent>) {
  const ref = useRef(null);
  const {
    toastProps,
    contentProps,
    titleProps,
    descriptionProps,
    closeButtonProps,
  } = useToast(props, state, ref);
  return (
    <div
      {...toastProps}
      ref={ref}
      className="p-2 bg-red-600 text-white rounded-md shadow-lg flex gap-2 items-center data-[animation=entering]:animate-in data-[animation=entering]:slide-in-from-right data-[animation=exiting]:animate-out data-[animation=exiting]:slide-out-to-right"
      data-animation={props.toast.animation}
      onAnimationEnd={() => {
        if (props.toast.animation === 'exiting') {
          state.remove(props.toast.key);
        }
      }}
    >
      <div {...contentProps}>
        <div {...titleProps}>{props.toast.content.title}</div>
        {props.toast.content.description ? (
          <div className="text-sm" {...descriptionProps}>
            {props.toast.content.description}
          </div>
        ) : null}
      </div>
      <Button variant="ghost" size="icon" {...closeButtonProps}>
        <CircleXIcon className="w-5 h-5" />
      </Button>
    </div>
  );
}
