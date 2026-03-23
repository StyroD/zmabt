const router = require('express').Router()
const { getProjectWorkers } = require('../queries/workers')

router.get('/:projectId', getProjectWorkers)
module.exports = router