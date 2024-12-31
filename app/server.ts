import { createMiddleware } from 'hono/factory';
import { secureHeaders } from 'hono/secure-headers';
import { timing } from 'hono/timing';
import { createHonoServer } from 'react-router-hono-server/bun';

const requestId = (options?: { headerName?: string; maxLength?: number }) => {
  const headerName = options?.headerName ?? 'x-request-id';
  const maxLength = options?.maxLength ?? 255;
  return createMiddleware(async (c, next) => {
    const requestId = c.req.header(headerName);
    c.res.headers.set(
      headerName,
      requestId && requestId.length < maxLength
        ? requestId
        : crypto.randomUUID()
    );
    return next();
  });
};

const server = await createHonoServer({
  configure(app) {
    app.use(requestId());
    app.use(secureHeaders());
    app.use(timing());
  },
});

export default server;
