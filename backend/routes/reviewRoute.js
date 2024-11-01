const express = require('express');
const router = express.Router();
const upload = require('../utils/multer');
const { isAuthenticatedUser, isAdmin } = require("../middleware/auth");

const { 
  getAllReview,
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview 
} = require('../controllers/reviewController'); 

router.get('/admin/reviews/', isAdmin, getAllReview);
router.get('/reviews/:carId', getReviews);
router.get('/reviews/review/:reviewId', getReview);
router.post('/reviews/create', isAuthenticatedUser, upload.array('images'), createReview);
router.put('/reviews/:reviewId', isAuthenticatedUser, upload.array('images'), updateReview);
router.delete('/reviews/:reviewId', isAuthenticatedUser, deleteReview);

module.exports = router;
