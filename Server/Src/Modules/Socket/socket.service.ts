import type { Server } from "http";
import { Server as SocketServer } from "socket.io";
import type { createBookingDTO } from "../Bookings/booking.types.js";

export class SocketIO {
  public ioSocket: SocketServer;

  constructor(public httpServer: Server) {
    this.ioSocket = new SocketServer(httpServer, {
      connectTimeout: 45000,
    });

    this.ioSocket.on("booking application", (bookingData: createBookingDTO) => {
      this.ioSocket.emit("booking broadcast");
    });
  }

  establishConnection() {
    this.ioSocket.listen(this.httpServer);
  }

  async sendMessage(message: any) {}
}
