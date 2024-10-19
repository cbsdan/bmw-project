const express = require('express');
const router = express.Router();
const upload = require("../utils/multer");
const {isAuthenticatedUser} = require("../middleware/auth") 

const { 
    createDiscount,
    getDiscounts,
    getDiscountById,
    updateDiscount,
    deleteDiscount
} = require('../controllers/discountCode');

router.get('/discounts', isAuthenticatedUser, getDiscounts);
router.get('/discounts/:id', isAuthenticatedUser, getDiscountById);
router.post('/create-discount', isAuthenticatedUser, upload.single('logo'), createDiscount);
router.put('/discount/:id', isAuthenticatedUser, upload.single('logo'), updateDiscount);
router.delete('/discount/:id', isAuthenticatedUser,  deleteDiscount);


module.exports = router;
