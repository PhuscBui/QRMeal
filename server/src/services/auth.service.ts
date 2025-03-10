import { envConfig } from '~/config'
import { TokenType } from '~/constants/type'
import { signToken, verifyToken } from '~/utils/jwt'
import ms from 'ms'
import databaseService from '~/services/databases.service'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'

class AuthService {
  private signAccessToken(account_id: string) {
    return signToken({
      payload: { account_id, token_type: TokenType.AccessToken },
      options: { expiresIn: envConfig.accessTokenExpiresIn as ms.StringValue }
    })
  }

  private signRefreshToken(account_id: string, exp?: number) {
    if (exp) {
      return signToken({
        payload: { account_id, token_type: TokenType.RefreshToken, exp }
      })
    }
    return signToken({
      payload: { account_id, token_type: TokenType.RefreshToken },
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as ms.StringValue }
    })
  }

  private signAccessAndRefreshTokens(account_id: string) {
    return Promise.all([this.signAccessToken(account_id), this.signRefreshToken(account_id)])
  }

  private decodeRefreshToken(refresh_token: string) {
    return verifyToken({
      token: refresh_token,
      secretOrPublicKey: envConfig.jwtSecret
    })
  }

  async login(account_id: string) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshTokens(account_id)
    const { iat, exp } = await this.decodeRefreshToken(refresh_token)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ account_id: new ObjectId(account_id), token: refresh_token, iat: iat, exp: exp })
    )
    return { access_token, refresh_token }
  }

  async logout(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return {
      message: USERS_MESSAGES.LOGOUT_SUCCESS
    }
  }

  async refreshToken({ account_id, refresh_token, exp }: { account_id: string; refresh_token: string; exp: number }) {
    const [access_token, new_refresh_token] = await Promise.all([
      this.signAccessToken(account_id),
      this.signRefreshToken(account_id, exp),
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
