import http, { IncomingMessage, Server, ServerResponse } from "http";
import { PORT } from "./Src/Config/Env.js";
import { ErrorMsg, Info, Warning } from "./Utilities/Logger.js";
import Router from "./Router.js";
import { Database } from "./Src/Config/DB.js";
import { SocketIO } from "./Src/Modules/Socket/socket.service.js";

const db = new Database();

const httpServer: Server = http.createServer(
    (request: IncomingMessage, response: ServerResponse<IncomingMessage>) =>
      Router(db, request, response, socketServer),
  ),
  socketServer = new SocketIO(httpServer, db);

httpServer.listen(PORT, () => {
  try {
    socketServer.establishConnection();
    Info(`Server connection established at port ${PORT}, Socket is also live`);
  } catch (error) {
    ErrorMsg(error as Error);
  }
});

process.on("uncaughtException", (error) => {
  Warning("Uncaught exception");
  ErrorMsg(error);
});
process.on("unhandledRejection", (reason) => {
  Warning(`Uncaught promise rejection: ${reason}`);
});
