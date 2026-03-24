const router = require('express').Router()
const { registerUser, loginUser, getMe } = require('../queries/auth')
const authMiddleware = require('../middleware/auth')

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/me', authMiddleware, getMe)

module.exports = router