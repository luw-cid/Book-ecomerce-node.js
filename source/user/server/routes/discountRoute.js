const  express = require('express');
const discountController = require('../controllers/discountController');
const asyncHandle = require('express-async-handler');

const router = express.Router();

router.post('/apply', asyncHandle(discountController.applyDiscount));
router.get('/validate/:code', asyncHandle(discountController.validateDiscountCode));
router.get('/public', asyncHandle(discountController.getPublicDiscounts));
router.get('/active', asyncHandle(discountController.getDiscounts));

module.exports = router;