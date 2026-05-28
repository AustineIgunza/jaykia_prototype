import type { IncomingMessage, ServerResponse } from "node:http";
import { routes } from "./Routes.js";
import { Database } from "./Src/Config/DB.js";
import { ErrorMsg } from "./Utilities/Logger.js";
import type { SocketIOService } from "./Src/Modules/Socket/socket.types.js";

const Router = (
  db: Database,
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
  ioSocket: SocketIOService,
) => {
  const requestUrl: URL = new URL(
      request.url!,
      `http://${request.headers.host}`,
    ),
    pathnames: string[] = requestUrl.pathname.split("/").filter(Boolean);

  response.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,OPTIONS,DELETE",
  );
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader(
    "Access-Control-Allow-Headers",
    "accept,content-type,content-length,authorization",
  );

  if (request.method == "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  request.on("error", (error) => {
    ErrorMsg(error);

    if (!response.headersSent) {
      response.writeHead(500);
      response.end(
        JSON.stringify({
          error: error.message,
        }),
      );
    }
  });

  const matchedRoute = routes.find(
    (route) => route.name.toLowerCase() == pathnames.at(1),
  );

  if (!matchedRoute) {
    response.writeHead(404);
    response.end(
      JSON.stringify({
        error: "Invalid api route",
      }),
    );
    return;
  }

  matchedRoute.controller(db, request, response, ioSocket);
};

export default Router;
