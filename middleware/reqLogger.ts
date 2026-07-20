import { Request, Response, NextFunction } from "express";

const timestamp = new Date().toISOString()

const reqLogger = (req: Request, res: Response, next: NextFunction): void => {
  console.log(`${req.method} request made to ${req.url} on ${req.ip} at ${timestamp}`)
  next()
}

export default reqLogger