import { Router } from 'express'

const authRouter = Router()

/**
 * Description. Login route
 * Path:  /auth/login
 * Method: POST
 * Request: { email: string, password: string }
 */
authRouter.post('/login', (req, res) => {
  res.send('login')
})

export default authRouter
