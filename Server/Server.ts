import http, { IncomingMessage, ServerResponse } from "http";
import { PORT } from "./Src/Config/Env.js";
import { Info } from "./Utilities/Logger.js";
import Router from "./Router.js";
import { Database } from "./Src/Config/DB.js";

const db = new Database();

const httpServer = http.createServer(
  (request: IncomingMessage, response: ServerResponse<IncomingMessage>) =>
    Router(db, request, response),
);

httpServer.listen(PORT, () => {
  Info(`Server connection established at port ${PORT}`);
});
