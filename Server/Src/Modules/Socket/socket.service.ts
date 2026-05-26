import type { Server } from "http";
import { Socket, Server as SocketServer } from "socket.io";
import { ErrorMsg, Info, Warning } from "../../../Utilities/Logger.js";
import { decode_access_token } from "../../../Utilities/jwt.js";
import type { PublicUserDTO } from "../Users/user.types.js";
import { type AuthenticatedSocket } from "./socket.types.js";
import { type SocketIOService } from "./socket.types.js";
import type { Database } from "../../Config/DB.js";

import { UserRoleRepo } from "../Roles/User Roles/user_roles.repository.js";
import { UserRolesServ } from "../Roles/User Roles/user_roles.service.js";
import type { Booking, createBookingDTO } from "../Bookings/booking.types.js";

const Rooms = {
  user: (userId: string) => `user:${userId}`,
  admins: "admins",
} as const;

export class SocketIO implements SocketIOService {
  public ioSocket: SocketServer;

  constructor(
    public httpServer: Server,
    private database: Database,
  ) {
    this.ioSocket = new SocketServer(httpServer, {
      connectTimeout: 45000,
    });

    this.establishMiddleware();
    this.establishEvents();
  }

  establishConnection() {
    this.ioSocket.listen(this.httpServer);
  }

  private establishMiddleware() {
    this.ioSocket.use((Socket, next) => {
      try {
        const token = Socket.handshake.auth?.token as string | undefined;

        if (token)
          return next(new Error("Authentication required, token not provided"));

        const user = decode_access_token(token!);
        if (!(user as PublicUserDTO).id)
          return next(new Error("Invalid auth token provided"));

        Socket.data.user = user as PublicUserDTO;
        next();
      } catch (error) {
        Warning(`Socket auth failed: ${(error as Error).message}`);
        next(new Error("Unauthorized"));
      }
    });
  }

  private establishEvents() {
    this.ioSocket.on("connection", async (socket: Socket) => {
      const authSocket: AuthenticatedSocket = socket,
        { id, username } = authSocket.data.user;

      Info(`Connected: ${username} (${id}) — socket ${socket.id}`);

      socket.join(Rooms.user(id));

      const userRolesRepo = new UserRoleRepo(this.database),
        userRolesService = new UserRolesServ(userRolesRepo),
        socketUserRoles = await userRolesService.getUserRoles(id);

      if (socketUserRoles.roles.includes("admin")) {
        socket.join(Rooms.admins);
        Info(`${username} connected`);
      }

      socket.on("booking:new", (bookingData: createBookingDTO) => {
        Info(
          `Booking received from ${username}: ${JSON.stringify(bookingData)}`,
        );

        // Notify all admins
        this.ioSocket.to(Rooms.admins).emit("booking:incoming", {
          booking: bookingData,
          submittedBy: { id, username },
          receivedAt: new Date().toISOString(),
        });

        // Confirm receipt back to the user who submitted
        socket.emit("booking:acknowledged", {
          message: "Your booking has been received and is being reviewed",
        });
      });

      socket.on(
        "booking:statusUpdate",
        (payload: {
          userId: string;
          bookingId: string;
          status: string;
          message?: string;
        }) => {
          if (!socketUserRoles.roles.includes("admin")) {
            socket.emit("error", { message: "Not authorised" });
            return;
          }

          Info(
            `Admin ${username} updated booking ${payload.bookingId} → ${payload.status}`,
          );

          // Send the update directly to the affected user's room
          this.ioSocket.to(Rooms.user(payload.userId)).emit("booking:updated", {
            bookingId: payload.bookingId,
            status: payload.status,
            message: payload.message ?? `Your booking is now ${payload.status}`,
            updatedAt: new Date().toISOString(),
          });
        },
      );

      socket.on("booking:deletion", (bookingDetails: Booking) => {
        Info(`Booking of id: ${bookingDetails.id} deleted successfully`);

        this.ioSocket.to(Rooms.admins).emit("booking:deleted", bookingDetails);
      });

      socket.on("disconnect", (reason) => {
        Info(`Disconnected: ${username} (${id}) — reason: ${reason}`);
      });

      socket.on("error", (err) => {
        ErrorMsg(err as Error);
      });
    });
  }

  emitToUser(userId: string, event: string, data: unknown): void {
    this.ioSocket.to(Rooms.user(userId)).emit(event, data);
  }

  emitToAdmins(event: string, data: unknown): void {
    this.ioSocket.to(Rooms.admins).emit(event, data);
  }

  broadcast(event: string, data: unknown): void {
    this.ioSocket.emit(event, data);
  }
}
