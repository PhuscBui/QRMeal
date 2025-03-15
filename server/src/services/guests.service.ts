import { ObjectId } from 'mongodb'
import ms from 'ms'
import { envConfig } from '~/config'
import { USERS_MESSAGES } from '~/constants/messages'
import { TokenType } from '~/constants/type'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import databaseService from '~/services/databases.service'
import { signToken, verifyToken } from '~/utils/jwt'

class GuestsService {
  private signAccessToken(account_id: string, role: string) {
    return signToken({
      payload: { account_id, token_type: TokenType.AccessToken, role },
      privateKey: envConfig.accessTokenSecret,
      options: { expiresIn: envConfig.guestAccessTokenExpiresIn as ms.StringValue }
    })
  }

  private signRefreshToken(account_id: string, role: string, exp?: number) {
    if (exp) {
      return signToken({
        payload: { account_id, token_type: TokenType.RefreshToken, role, exp },
        privateKey: envConfig.refreshTokenSecret
      })
    }
    return signToken({
      payload: { account_id, token_type: TokenType.RefreshToken, role },
      privateKey: envConfig.refreshTokenSecret,
      options: { expiresIn: envConfig.guestRefreshTokenExpiresIn as ms.StringValue }
    })
  }

  private signAccessAndRefreshTokens(account_id: string, role: string) {
    return Promise.all([this.signAccessToken(account_id, role), this.signRefreshToken(account_id, role)])
  }

  private decodeRefreshToken(refresh_token: string) {
    return verifyToken({
      token: refresh_token,
      secretOrPublicKey: envConfig.refreshTokenSecret
    })
  }

  async login(account_id: string, role: string) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshTokens(account_id, role)
    const { iat, exp } = await this.decodeRefreshToken(refresh_token)

    const [guest] = await Promise.all([
      await databaseService.guests.findOneAndUpdate(
        { _id: new ObjectId(account_id) },
        {
          $set: {
            refresh_token: refresh_token,
            refresh_token_exp: new Date(exp * 1000)
          },
          $currentDate: { updated_at: true }
        },
        {
          returnDocument: 'after',
          projection: {
            refresh_token: 0,
            refresh_token_exp: 0
          }
        }
      ),
      await databaseService.refreshTokens.insertOne(
        new RefreshToken({ account_id: new ObjectId(account_id), token: refresh_token, iat: iat, exp: exp })
      )
    ])

    return { access_token, refresh_token, guest }
  }

  async logout(refresh_token: string) {
    await databaseService.guests.updateOne(
      { refresh_token: refresh_token },
      {
        $set: {
          refresh_token: null,
          refresh_token_exp: null
        },
        $currentDate: { updated_at: true }
      }
    )

    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return {
      message: USERS_MESSAGES.USER_LOGOUT_SUCCESS
    }
  }

  async refreshToken({
    account_id,
    refresh_token,
    role,
    exp
  }: {
    account_id: string
    refresh_token: string
    role: string
    exp: number
  }) {
    const [access_token, new_refresh_token] = await Promise.all([
      this.signAccessToken(account_id, role),
      this.signRefreshToken(account_id, role, exp),
      databaseService.refreshTokens.deleteOne({ token: refresh_token })
    ])
    const { iat, exp: new_exp } = await this.decodeRefreshToken(new_refresh_token)

    await Promise.all([
      await databaseService.refreshTokens.deleteOne({ token: refresh_token }),
      await databaseService.refreshTokens.insertOne(
        new RefreshToken({ account_id: new ObjectId(account_id), token: new_refresh_token, iat: iat, exp: new_exp })
      ),
      await databaseService.guests.updateOne(
        { _id: new ObjectId(account_id) },
        {
          $set: {
            refresh_token: new_refresh_token,
            refresh_token_exp: new Date(new_exp * 1000)
          },
          $currentDate: { updated_at: true }
        }
      )
    ])

    return { access_token, refresh_token: new_refresh_token }
  }
}

const guestsService = new GuestsService()
export default guestsService
