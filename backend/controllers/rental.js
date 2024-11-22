const Rental = require("../models/Rental");
const Review = require("../models/Review");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/User");
const Car = require("../models/Cars");

const isCarOnRental = async (carId) => {
  try {
    const statuses = ["Pending", "Confirmed", "Active"];
    const rental = await Rental.findOne({
      car: carId,
      status: { $in: statuses },
    });
    return rental ? true : false;
  } catch (error) {
    console.error("Error checking car rental status:", error);
    throw new Error("Error checking car rental status");
  }
};

const calculateRentalDays = (pickUpDate, returnDate) => {
  if (!pickUpDate || !returnDate) {
    return 0;
  }
  const pickUp = new Date(pickUpDate);
  const returnD = new Date(returnDate);
  const timeDiff = Math.abs(returnD - pickUp);
  const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return diffDays;
};

const formatDate = (dateStr) => {
  const dateObj = new Date(dateStr);

  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  const formattedDate = dateObj.toLocaleString("en-US", options);
  const [datePart, timePart] = formattedDate.split(", ");
  return `${datePart.replace(/\//g, "-")} ${timePart}`;
};

const createRent = async (req, res) => {
  try {
    const {
      car,
      renter,
      pickUpDate,
      returnDate,
      status,
      paymentMethod,
      paymentStatus,
    } = req.body;

    if (!car || !renter || !pickUpDate || !returnDate || !status) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const carOnRental = await isCarOnRental(car);
    if (carOnRental) {
      return res.status(400).json({ message: "Car is currently on rental." });
    }

    const rental = new Rental(req.body);

    const validationError = rental.validateSync();
    if (validationError) {
      const errorsArray = Object.keys(validationError.errors).map((key) => ({
        field: key,
        message: validationError.errors[key].message,
      }));
      return res
        .status(400)
        .json({ message: "Validation errors", errors: errorsArray });
    }

    await rental.save();

    const carDetails = await Car.findById(car);
    const renterDetails = await User.findById(renter);

    if (!carDetails || !renterDetails) {
      return res.status(400).json({ message: "Car or Renter not found" });
    }

    const rentalDays = calculateRentalDays(pickUpDate, returnDate);
    const pricePerDay = carDetails.pricePerDay;
    const totalPayment = rentalDays * pricePerDay;

    const formattedPickUpDate = formatDate(pickUpDate);
    const formattedReturnDate = formatDate(returnDate);

    const rentalInfo = `
        <table border="1" cellpadding="10" cellspacing="0">
        <thead>
            <tr>
            <th colspan="2">Booking Details</th>
            </tr>
        </thead>
        <tbody>
            <tr>
            <td>Car</td>
            <td>${carDetails.brand} ${carDetails.model} (${carDetails.year})</td>
            </tr>
            <tr>
            <td>Type</td>
            <td>${carDetails.vehicleType}</td>
            </tr>
            <tr>
            <td>Capacity</td>
            <td>${carDetails.seatCapacity}</td>
            </tr>
            <tr>
            <td>Fuel</td>
            <td>${carDetails.fuel}</td>
            </tr>
            <tr>
            <td>Transmission</td>
            <td>${carDetails.transmission}</td>
            </tr>
            <tr>
            <td>Status</td>
            <td>${status}</td>
            </tr>
            <tr>
            <td>Pick-up Date</td>
            <td>${formattedPickUpDate}</td>
            </tr>
            <tr>
            <td>Return Date</td>
            <td>${formattedReturnDate}</td>
            </tr>
            <tr>
            <td>Price Per Day</td>
            <td>₱${pricePerDay}</td>
            </tr>
            <tr>
            <td>Rental Day/s</td>
            <td>${rentalDays}</td>
            </tr>
            <tr>
            <td>Payment</td>
            <td>₱${totalPayment}</td>
            </tr>
            <tr>
            <td>Mode of Payment</td>
            <td>${paymentMethod}</td>
            </tr>
            <tr>
            <td>Payment Status</td>
            <td>${paymentStatus}</td>
            </tr>
            <tr>
            <td>Owner</td>
            <td>${renterDetails.firstName} ${renterDetails.lastName}</td>
            </tr>
            <tr>
            <td>Owner Email Address</td>
            <td>${renterDetails.email}</td>
            </tr>
            <tr>
            <td>Pick Up Location</td>
            <td>${carDetails.pickUpLocation}</td>
            </tr>
            <tr>
            <td>Terms and Conditions</td>
            <td>${carDetails.termsAndConditions || "N/A"}</td>
            </tr>
        </tbody>
        </table>
      `;

    const emailOptions = {
      email: renterDetails.email,
      subject: "BMW Bookings",
      message: `
          Dear ${renterDetails.firstName},\n\n
          Your booking for the car ${carDetails.brand} ${carDetails.model} (${carDetails.year}) has been confirmed.\n\n
          Booking Details:\n
          ${rentalInfo}\n
          Thank you for choosing BMW Rentals!\n
        `,
    };

    sendEmail(emailOptions).catch((emailError) => {
      console.error("Failed to send email:", emailError);
    });

    res.status(201).json({
      message: "Rental created successfully",
      rental,
      rentalDetails: rentalInfo,
    });
  } catch (error) {
    console.error("Error creating rental:", error);
    res.status(500).json({ message: "Error creating rental", error });
  }
};

const updateRent = async (req, res) => {
  try {
    const { id } = req.params;
    const rental = await Rental.findByIdAndUpdate(id, req.body, { new: true });
    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }
    res.json({ message: "Rental updated successfully", rental });
  } catch (error) {
    res.status(500).json({ message: "Error updating rental", error });
  }
};

const deleteRent = async (req, res) => {
  try {
    const { id } = req.params;
    const rental = await Rental.findByIdAndDelete(id);
    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }
    res.json({ message: "Rental deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting rental", error });
  }
};

// Get all rental details
const getAllRentDetails = async (req, res) => {
  try {
    const rentals = await Rental.find()
      .populate({
        path: "car",
        populate: { path: "owner" },
      })
      .populate("renter discountCode")
      .sort({ createdAt: -1 });

    res.json(rentals);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving rentals", error });
  }
};

const myRentals = async (req, res) => {
  try {
    const { renterId } = req.params;

    // Fetch rentals first
    const rentals = await Rental.find({ renter: renterId })
      .populate({
        path: "car",
        populate: { path: "owner" },
      })
      .populate("renter discountCode")
      .sort({ createdAt: -1 });

    if (rentals.length === 0) {
      return res
        .status(200)
        .json({ message: "No rentals found for this user" });
    }

    // Fetch reviews only for this renter and the rental's ID
    const rentalsWithReviews = await Promise.all(
      rentals.map(async (rental) => {
        // Fetch reviews where renter matches and rental ID matches
        const reviews = await Review.find({
          rental: rental._id,
          renter: renterId,
        });

        // Calculate the average rating if reviews exist
        const averageRating = reviews.length
          ? reviews.reduce((sum, review) => sum + review.rating, 0) /
            reviews.length
          : null;

        return {
          ...rental.toObject(),
          reviews, // Include reviews for each rental
          averageRating, // Add average rating
        };
      })
    );

    res.json(rentalsWithReviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving rentals", error });
  }
};

const myCarRental = async (req, res) => {
  try {
    const { ownerId } = req.params;

    const rentals = await Rental.find()
      .populate({
        path: "car",
        match: { owner: ownerId },
        populate: {
          path: "owner",
        },
      })
      .populate("renter")
      .populate("discountCode")
      .sort({ createdAt: -1 });

    const filteredRentals = rentals.filter(
      (rental) => rental.car && rental.car.owner
    );

    if (filteredRentals.length === 0) {
      return res
        .status(200)
        .json({ message: "No rentals found for this user" });
    }

    res.json(filteredRentals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving rentals", error });
  }
};

const getRentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const rental = await Rental.findById(id)
      .populate({
        path: "car",
        populate: { path: "owner" },
      })
      .populate("renter discountCode")
      .sort({ createdAt: -1 });
    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }
    res.json(rental);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving rental", error });
  }
};

const getRentalsByCarId = async (req, res) => {
  try {
    const { carId } = req.params;

    const rentals = await Rental.find({ car: carId })
      .populate({
        path: "car",
        populate: { path: "owner" },
      })
      .populate("renter discountCode")
      .sort({ createdAt: -1 });

    if (rentals.length === 0) {
      return res.status(404).json({ message: "No rentals found for this car" });
    }

    res.json(rentals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving rentals", error });
  }
};

module.exports = {
  createRent,
  updateRent,
  deleteRent,
  getAllRentDetails,
  getRentDetails,
  myRentals,
  myCarRental,
  getRentalsByCarId,
};
