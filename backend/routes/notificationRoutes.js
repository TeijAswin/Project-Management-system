const express = require('express');
const router = express.Router();
const { testDailyDigest, sendProjectDeadlineAlert } = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.post('/test-daily', testDailyDigest);
router.post('/send-deadline/:projectId', sendProjectDeadlineAlert);

module.exports = router;
