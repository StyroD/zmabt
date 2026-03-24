const router = require('express').Router()
const { getUsers, createUser, getUserById } = require('../queries/users')

router.get('/', getUsers)
router.post('/', createUser)
router.get('/:id', getUserById)

module.exports = router