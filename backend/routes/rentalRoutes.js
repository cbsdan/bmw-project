const express = require('express');
const router = express.Router();
const { isAuthenticatedUser } = require("../middleware/auth");

const {
    createRent,
    getAllRentDetails,
    getRentDetails,
    updateRent,
    deleteRent
} = require('../controllers/rental');

router.get('/rentals', isAuthenticatedUser, getAllRentDetails);
router.get('/rentals/:id', getRentDetails);
router.post('/createRental', createRent);
router.route('/rentals/:id')
    .put( updateRent)
    .delete( deleteRent);

module.exports = router;
