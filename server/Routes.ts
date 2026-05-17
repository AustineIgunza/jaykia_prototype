import type { IncomingMessage, ServerResponse } from "node:http";
import { RoleController } from "./Src/Modules/Roles/Definition/roles.controller.js";
import type { Database } from "./Src/Config/DB.js";

type Route = {
  name: string;
  controller: (
    database: Database,
    request: IncomingMessage,
    response: ServerResponse<IncomingMessage>,
  ) => void;
};

export const routes: Route[] = [
  {
    name: "roles",
    controller: RoleController,
  },
];
