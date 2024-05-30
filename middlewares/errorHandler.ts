import { NextFunction, Request, Response } from "express";

const getErrorMessage = (error: any) => {
  if (typeof error === "string") return error;
  if (typeof error.message === "string") return error.message;
  return "Une erreur est survenue.";
};

export const errorHandler = (
  error: any,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  console.log("ERROR :", new Date().toLocaleString(), error);

  if (res.headersSent) return;

  res
    .status(error?.status || 500)
    .json({ message: getErrorMessage(error), error });
};
