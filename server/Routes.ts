import type { IncomingMessage, ServerResponse } from "node:http";

type Route = {
  name: string;
  controller: (
    request: IncomingMessage,
    response: ServerResponse<IncomingMessage>,
  ) => {};
};

export const routes: Route[] = [];
