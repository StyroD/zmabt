import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import pool from '../config/db'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { v4 as uuidv4 } from 'uuid'


export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, role } = req.body
    const passwordHash = await bcrypt.hash(password, 10)
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [username, email, passwordHash, role]
    )
    const user = result.rows[0]
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET as string)
    res.json({ token, user })
  } catch (err: any) {
    if (err.code === '23505') {
      res.status(409).json({ error: 'Username or email already exists' })
    } else {
      res.status(500).json({ error: err.message })
    }
  }
}

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    const user = result.rows[0]
    if (!user) {
      res.status(401).json({ error: 'User not found' })
      return
    }
    const match = await bcrypt.compare(password, user.password_hash)
    if (!match) {
      res.status(401).json({ error: 'Wrong password' })
      return
    }
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET as string)
    res.json({ token, user })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}


passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID as string,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0].value
    const googleId = profile.id
    const firstName = profile.name?.givenName
    const lastName = profile.name?.familyName

    let result = await pool.query('SELECT * FROM users WHERE google_id = $1', [googleId])

    if (result.rows.length === 0) {
      result = await pool.query('SELECT * FROM users WHERE email = $1', [email])

      if (result.rows.length > 0) {
        result = await pool.query(
          'UPDATE users SET google_id = $1 WHERE email = $2 RETURNING *',
          [googleId, email]
        )
      } else {
        const username = `${firstName?.toLowerCase()}.${lastName?.toLowerCase()}.${uuidv4().slice(0, 4)}`
        result = await pool.query(
          `INSERT INTO users (id, username, email, google_id, first_name, last_name, role, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, 'worker', NOW()) RETURNING *`,
          [uuidv4(), username, email, googleId, firstName, lastName]
        )
      }
    }

    return done(null, result.rows[0])
  } catch (err) {
    return done(err as Error)
  }
}))

export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false
})

export const googleCallback = [
  passport.authenticate('google', { failureRedirect: '/api/auth/google/failed', session: false }),
  (req: Request, res: Response) => {
    const user = req.user as { id: string; role: string }
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET as string)
    res.redirect(`myapp://auth?token=${token}`)
  }
]

export const googleFailed = (req: Request, res: Response) => {
  res.status(401).json({ error: 'Google authentication failed' })
}