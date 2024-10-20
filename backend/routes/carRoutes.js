const express = require('express');
const upload = require('../utils/multer');
const router = express.Router();
const {isAuthenticatedUser} = require("../middleware/auth") 

const { 
    createCar, 
    getAllCars, 
    deleteCar, 
    updateCar, 
    getCarDetails 
} = require('../controllers/carControllers'); 


router.get('/Cars', getAllCars)
router.get('/Cars/:id', getCarDetails); 
router.post('/CreateCar', isAuthenticatedUser, upload.array('images', 10), createCar);
router.route('/Cars/:id' ).put(isAuthenticatedUser, upload.array('images', 10), updateCar).delete(isAuthenticatedUser, deleteCar);

module.exports = router;