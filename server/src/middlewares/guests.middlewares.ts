import { checkSchema } from "express-validator"
import { validate } from "~/utils/validation"
import { NextFunction, Request, Response } from 'express'
import { TokenPayload } from "~/models/requests/Account.request"
import databaseService from "~/services/databases.service"
import { ObjectId } from "mongodb"
import HTTP_STATUS from "~/constants/httpStatus"
import { USERS_MESSAGES } from "~/constants/messages"
import { Role } from "~/constants/type"


export const isGuestValidator = async (req: Request, res: Response, next: NextFunction) => {
  const { account_id } = req.decoded_authorization as TokenPayload
  const user = await databaseService.guests.findOne({ _id: new ObjectId(account_id) })
  if (!user || user.role !== Role.Guest) {
    res.status(HTTP_STATUS.FORBIDDEN).json({
      message: USERS_MESSAGES.UNAUTHORIZED
    })
    return
  }

  next()
}
