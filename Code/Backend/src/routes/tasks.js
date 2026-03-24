const router = require('express').Router()
const { getTasks, getTasksByProjectId } = require('../queries/tasks')

router.get('/', getTasks)
router.get('/:id', getTasksByProjectId)

module.exports = router