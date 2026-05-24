import type { IncomingMessage, ServerResponse } from "node:http";
import type { Database } from "./Src/Config/DB.js";
import { RoleController } from "./Src/Modules/Roles/Definition/roles.controller.js";
import { UserController } from "./Src/Modules/Users/user.controller.js";
import { UserRoleController } from "./Src/Modules/Roles/User Roles/user_roles.controller.js";
import { AuthController } from "./Src/Modules/Auth/auth.controller.js";
import { PermissionController } from "./Src/Modules/Permissions/Definitions/permissions.controller.js";
import { UserPermissionController } from "./Src/Modules/Permissions/User Permissions/user_permissions.controller.js";
import { BookingController } from "./Src/Modules/Bookings/booking.controller.js";
import { RatingController } from "./Src/Modules/Ratings/rating.controller.js";
import { RefundController } from "./Src/Modules/Refunds/refund.controller.js";
import { PaymentController } from "./Src/Modules/Payments/payments.controller.js";
import { FeedbackController } from "./Src/Modules/Feedback/feedback.controller.js";

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
    name: "auth",
    controller: AuthController,
  },
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
  {
    name: "permissions",
    controller: PermissionController,
  },
  {
    name: "userpermissions",
    controller: UserPermissionController,
  },
  {
    name: "bookings",
    controller: BookingController,
  },
  {
    name: "ratings",
    controller: RatingController,
  },
  {
    name: "refunds",
    controller: RefundController,
  },
  {
    name: "payments",
    controller: PaymentController,
  },
  { name: "feedback", controller: FeedbackController },
];
