const Review = require('../models/Review');
const Rental = require('../models/Rental'); 

const getAllReview = async (req, res) => {
  try {
    const reviews = await Review.find().populate('renter rental');
    res.status(200).json({message: "Fetched reviews successfully", reviews});
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reviews', error: err.message });
  }
};

const getReviews = async (req, res) => {
    try {
      const { carId } = req.params;
  
      const rentals = await Rental.find({ car: carId });

      if (!rentals.length) {
        return res.status(404).json({ message: 'No rentals found for this car' });
      }
  
      const rentalIds = rentals.map(rental => rental._id);
      const reviews = await Review.find({ rental: { $in: rentalIds } }).populate('renter rental');
  
      res.status(200).json({ message: "Fetched reviews successfully", reviews });
    } catch (err) {
      res.status(500).json({ message: 'Error fetching reviews', error: err.message });
    }
  };

const getReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId).populate('renter rental');
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.status(200).json({message: "Fetched review successfully", review});
  } catch (err) {
    res.status(500).json({ message: 'Error fetching review', error: err.message });
  }
};

const createReview = async (req, res) => {
  try {
    const { rental, renter, rating, comment } = req.body;
    const images = req.files.map(file => ({
      public_id: file.filename,
      url: file.path
    }));

    const review = new Review({
      rental,
      renter,
      rating,
      comment,
      images
    });

    const error = review.validateSync();
    if (error) {
      const errorsArray = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ errors: errorsArray, message: "Validation Errors" });
    }

    await review.save();
    res.status(201).json({ message: 'Review created successfully', review });
  } catch (err) {
    res.status(500).json({ message: 'Error creating review', error: err.message });
  }
};

const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const updates = {};
    if (rating) updates.rating = rating;
    if (comment) updates.comment = comment;

    if (req.files) {
      updates.images = req.files.map(file => ({
        public_id: file.filename,
        url: file.path
      }));
    }

    const review = await Review.findByIdAndUpdate(reviewId, updates, { new: true });
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const error = review.validateSync();
    if (error) {
      const errorsArray = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ errors: errorsArray, message: "Validation Errors" });
    }

    res.status(200).json({ message: 'Review updated successfully', review });
  } catch (err) {
    res.status(500).json({ message: 'Error updating review', error: err.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting review', error: err.message });
  }
};

module.exports = {
  getAllReview,
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview
};
