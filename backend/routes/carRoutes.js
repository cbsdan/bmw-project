const express = require('express');
const upload = require('../utils/multer');
const router = express.Router();
const {isAuthenticatedUser} = require("../middleware/auth") 

const { 
    createCar, 
    getAllCars, 
    deleteCar, 
    updateCar, 
    getSingleCar,
    getCarsByUserId
} = require('../controllers/carControllers'); 


router.get('/Cars', getAllCars)
router.get('/Cars/:id', getSingleCar); 
router.get('/my-cars/:userId', isAuthenticatedUser, getCarsByUserId); 
router.post('/CreateCar', isAuthenticatedUser, upload.array('images', 10), createCar);
router.route('/Cars/:id' ).put(isAuthenticatedUser, upload.array('images', 10), updateCar).delete(isAuthenticatedUser, deleteCar);


module.exports = router;