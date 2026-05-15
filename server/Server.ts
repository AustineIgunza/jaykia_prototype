import http, { IncomingMessage, ServerResponse } from "http";
import { PORT } from "./Src/Config/Env.js";
import { Info } from "./Utilities/Logger.js";
import Router from "./Router.js";

const httpServer = http.createServer(
  (request: IncomingMessage, response: ServerResponse<IncomingMessage>) =>
    Router(request, response),
);

httpServer.listen(PORT, () => {
  Info(`Server connection established at port ${PORT}`);
});
