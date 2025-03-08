import { Request, Response, NextFunction, RequestHandler } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function wrapRequestHandler<P = ParamsDictionary>(handler: RequestHandler<P, any, any, any>) {
  return async (req: Request<P>, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
