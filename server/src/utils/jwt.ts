import jwt from 'jsonwebtoken'
import { envConfig } from '~/config'
import { TokenPayload } from '~/models/requests/Account.request'

export const signToken = ({
  payload,
  privateKey = envConfig.jwtSecret,
  options = {
    algorithm: 'HS256'
  }
}: {
  payload: object | string | Buffer
  privateKey?: string
  options?: jwt.SignOptions
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (err, token) => {
      if (err) {
        reject(err)
      } else {
        resolve(token as string)
      }
    })
  })
}

export const verifyToken = ({
  token,
  secretOrPublicKey = envConfig.jwtSecret
}: {
  token: string
  secretOrPublicKey?: string
}) => {
  return new Promise<TokenPayload>((resolve, reject) => {
    jwt.verify(token, secretOrPublicKey, (err, decoded) => {
      if (err) {
        throw reject(err)
      } else {
        resolve(decoded as TokenPayload)
      }
    })
  })
}
