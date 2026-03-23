const router = require('express').Router()
const { getProjects, getProjectById } = require('../queries/projects')

router.get('/', getProjects)
router.get('/:id', getProjectById)

module.exports = router