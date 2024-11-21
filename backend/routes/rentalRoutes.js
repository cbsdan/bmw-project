const express = require("express");
const router = express.Router();
const { isAuthenticatedUser } = require("../middleware/auth");

const {
  createRent,
  getAllRentDetails,
  getRentDetails,
  updateRent,
  myRentals,
  deleteRent,
  getRentalsByCarId
} = require("../controllers/rental");

router.get("/rentals", isAuthenticatedUser, getAllRentDetails);
router.get("/rentals/:id", isAuthenticatedUser, getRentDetails);
router.post("/createRental", isAuthenticatedUser, createRent);
router.get("/my-rentals/:renterId", isAuthenticatedUser, myRentals);
router.get("/car-rentals/:carId", getRentalsByCarId);
router
  .route("/rentals/:id")
  .put(isAuthenticatedUser, updateRent)
  .delete(isAuthenticatedUser, deleteRent);

module.exports = router;
