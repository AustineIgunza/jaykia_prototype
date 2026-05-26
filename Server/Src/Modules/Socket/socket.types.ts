import type { Socket } from "socket.io";
import type { PublicUserDTO } from "../Users/user.types.js";

export type AuthenticatedSocket = Socket & {
  data: {
    user: PublicUserDTO;
  };
};

export interface SocketIOService {
  establishConnection: () => void;
  emitToUser: (userId: string, event: string, data: unknown) => void;
  emitToAdmins: (event: string, data: unknown) => void;
  broadcast: (event: string, data: unknown) => void;
}
