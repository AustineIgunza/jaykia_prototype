import type { IncomingMessage, ServerResponse } from "node:http";
import { RoleController } from "./Src/Modules/Roles/Definition/roles.controller.js";
import type { Database } from "./Src/Config/DB.js";
import { UserController } from "./Src/Modules/Users/user.controller.js";
import { UserRoleController } from "./Src/Modules/Roles/User Roles/user_roles.controller.js";

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
    name: "users",
    controller: UserController,
  },
  {
    name: "roles",
    controller: RoleController,
  },
  {
    name: "userroles",
    controller: UserRoleController,
  },
];
