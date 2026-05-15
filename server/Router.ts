import type { IncomingMessage, ServerResponse } from "node:http";
import { routes } from "./Routes.js";

const Router = (
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl: URL = new URL(
      `http://${request.headers.host}`,
      request.url!,
    ),
    pathnames: string[] = requestUrl.pathname.split("/").filter(Boolean);

  response.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,OPTIONS,DELETE",
  );
  response.setHeader("Access-Control-Allow-Origins", "*");
  response.setHeader(
    "Access-Control-Allow-Headers",
    "accept,content-type,content-length",
  );

  if (request.method == "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  routes.forEach((route) => {
    if (route.name.toLowerCase() == pathnames.at(1)) {
      route.controller(request, response);
      return;
    }
  });

  response.writeHead(404);
  response.end(
    JSON.stringify({
      error: "Invalid api route",
    }),
  );
  return;
};

export default Router;
