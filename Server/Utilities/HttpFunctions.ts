import type { IncomingMessage, ServerResponse } from "http";

type ResponseMessage = {
  success: boolean;
  errorCode: number;
  response: {
    message: string;
  };
};

const maxReqBodySize = 1e6;

export function sendErrorMessage(
  statusCode: number,
  message: string,
  response: ServerResponse<IncomingMessage>,
) {
  const responseMsg: ResponseMessage = {
    success: false,
    errorCode: 1,
    response: {
      message: message,
    },
  };

  if (!response.headersSent)
    response.writeHead(statusCode, {
      "Content-type": "application/json",
    });
  response.end(JSON.stringify(responseMsg));
}

export function sendResponseMessage(
  statusCode: number,
  message: any,
  response: ServerResponse<IncomingMessage>,
) {
  const responseMsg: ResponseMessage = {
    success: true,
    errorCode: 0,
    response: {
      message: message,
    },
  };

  if (!response.headersSent)
    response.writeHead(statusCode, {
      "Content-type": "application/json",
    });
  response.end(JSON.stringify(responseMsg));
}

export const getRequestBody = async (request: IncomingMessage) => {
  return new Promise((resolve, reject) => {
    let unparsedReqBody: string = "";

    request.on("data", (data: Buffer) => {
      unparsedReqBody += data.toString();

      if (unparsedReqBody.length > maxReqBodySize)
        reject(new Error("Exceeded maximum request body limit size"));
    });

    request.on("end", () => {
      try {
        if (!unparsedReqBody || unparsedReqBody.length <= 0) {
          resolve({});
          return;
        }

        resolve(JSON.parse(unparsedReqBody));
      } catch (error) {
        reject(new Error("Invalid JSON format"));
      }
    });

    request.on("error", (error) => reject(error));

    resolve(JSON.parse(unparsedReqBody));
  });
};
