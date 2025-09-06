import { envConfig } from '~/config'
import { Role, TableStatus, TokenType } from '~/constants/type'
import { signToken, verifyToken } from '~/utils/jwt'
import ms from 'ms'
import databaseService from '~/services/databases.service'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'

class AuthService {
  private signAccessToken(account_id: string, role: string) {
    return signToken({
      payload: { account_id, token_type: TokenType.AccessToken, role },
      privateKey: envConfig.accessTokenSecret,
      options: { expiresIn: envConfig.accessTokenExpiresIn as ms.StringValue }
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
      options: { expiresIn: envConfig.refreshTokenExpiresIn as ms.StringValue }
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
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ account_id: new ObjectId(account_id), token: refresh_token, iat: iat, exp: exp })
    )
    return { access_token, refresh_token }
  }

  async logout(role: string, refresh_token: string) {
    if (role === Role.Guest) {
      const guest = await databaseService.guests.findOne({ refresh_token: refresh_token })
      await Promise.all([
        await databaseService.guests.updateOne(
          { refresh_token: refresh_token },
          {
            $set: {
              refresh_token: null,
              refresh_token_exp: null
            },
            $currentDate: { updated_at: true }
          }
        ),
        await databaseService.tables.updateOne(
          { number: guest?.table_number || -1 },
          { $set: { status: TableStatus.Available, reservation: null }, $currentDate: { updated_at: true } }
        )
      ])
    }
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return {
      message: USERS_MESSAGES.LOGOUT_SUCCESS
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
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ account_id: new ObjectId(account_id), token: new_refresh_token, iat: iat, exp: new_exp })
    )
    return { access_token, refresh_token: new_refresh_token }
  }
}

const authService = new AuthService()
export default authService
