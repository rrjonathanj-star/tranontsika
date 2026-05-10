const express = require('express');
const passwordResetController = require('../controllers/passwordResetController');

const router = express.Router();

// Public routes
router.post('/request', passwordResetController.requestPasswordReset);
router.post('/verify-token', passwordResetController.verifyResetToken);
router.post('/reset', passwordResetController.resetPassword);

module.exports = router;