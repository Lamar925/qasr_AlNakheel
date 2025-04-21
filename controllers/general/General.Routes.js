const express = require('express');
const { getDashboardDetails, getAboutStatistics } = require('./General.Controller');

const router = express.Router();


router.get('/', getDashboardDetails);
router.get('/about/statistics', getAboutStatistics)

module.exports = router;