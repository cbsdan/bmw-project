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
router.get('/rentals/:id', isAuthenticatedUser, getRentDetails);
router.post('/createRental', isAuthenticatedUser, createRent);
router.route('/rentals/:id')
    .put( isAuthenticatedUser, updateRent)
    .delete( isAuthenticatedUser, deleteRent);

module.exports = router;
