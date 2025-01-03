import { useEffect } from 'react';
import { redirect, useFetcher, type FormEncType } from 'react-router';
import * as Result from 'true-myth/result';
import { Task } from 'true-myth/task';
import { z } from 'zod';
import { fromZodError, ValidationError } from 'zod-validation-error';

import { toastQueue } from '~/components/ui/toast';
import { deserialize, serialize, type JSONValue } from '~/lib/json';

export function useActionFetcher() {
  const fetcher = useFetcher<SubmissionError>();
  useEffect(() => {
    if (fetcher.data?.error) {
      toastQueue.add(
        { message: fetcher.data.error.message },
        { timeout: 10 * 1000 }
      );
    }
  }, [fetcher.data?.error]);

  return {
    submit: (data: JSONValue) => {
      const formData = serialize(data);
      const encType: FormEncType = [...formData.values()].some(
        (item) => item instanceof File
      )
        ? 'multipart/form-data'
        : 'application/x-www-form-urlencoded';
      fetcher.submit(formData, { method: 'post', encType });
    },
    isSubmitting: fetcher.state != 'idle',
  };
}

export function createActionTask<T>(
  promise: Promise<T>,
  errorMessage?: string
): Task<T, ValidationError> {
  return Task.tryOrElse(
    promise,
    onError(errorMessage ?? 'Failed to execute action')
  );
}

export function createActionResult<T>(
  callback: () => T,
  errorMessage?: string
): Result.Result<T, ValidationError> {
  return Result.tryOrElse(
    onError(errorMessage ?? 'Failed to execute action'),
    callback
  );
}

function onError(errorMessage: string): (cause: unknown) => ValidationError {
  return (cause) => {
    if (import.meta.env.DEV && cause) {
      console.error(cause);
    }
    return new ValidationError(errorMessage, { cause });
  };
}

export function processSubmission<Schema extends z.ZodTypeAny>({
  request,
  schema,
  resolve,
}: {
  request: Request;
  schema: Schema;
  resolve: (
    data: z.output<Schema>
  ) =>
    | Task<string | true, ValidationError>
    | Result.Result<string | true, ValidationError>;
}): Promise<SubmissionResult> {
  return parseWithZod(request, schema)
    .andThen((data) => {
      const taskOrResult = resolve(data);
      if (Result.isInstance(taskOrResult)) {
        return Task.fromResult(taskOrResult);
      }
      return taskOrResult;
    })
    .match<SubmissionResult>({
      Resolved: (success) =>
        success == true ? { success } : redirect(success),
      Rejected: (error) => ({ error }),
    });
}

export type SubmissionResult =
  | ReturnType<typeof redirect>
  | SubmissionSuccess
  | SubmissionError;

export type SubmissionSuccess = { success: true };
export type SubmissionError = { error: ValidationError };

function parseFormData(request: Request): Task<JSONValue, ValidationError> {
  const contentType = request.headers.get('content-type') as
    | FormEncType
    | undefined;
  if (contentType?.startsWith('application/json')) {
    return Task.tryOrElse(
      request.json(),
      (error) => new ValidationError('Failed to parse JSON', { cause: error })
    );
  } else if (
    contentType?.startsWith('application/x-www-form-urlencoded') ||
    contentType?.startsWith('multipart/form-data')
  ) {
    return Task.tryOrElse(
      request.formData(),
      (error) =>
        new ValidationError('Failed to parse FormData', { cause: error })
    ).map((formData) => deserialize(formData));
  }
  return Task.rejected(
    new ValidationError('Unsupported Content-Type', {
      cause: { contentType },
    })
  );
}

function parseWithZod<Schema extends z.ZodTypeAny>(
  request: Request,
  schema: Schema
): Task<z.output<Schema>, ValidationError> {
  return parseFormData(request).andThen((json) => {
    const result = schema.safeParse(json);
    if (result.success) {
      return Task.resolved(result.data);
    }
    return Task.rejected(fromZodError(result.error, { prefix: null }));
  });
}
