const Rental = require("../models/Rental");

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

const createRent = async (req, res) => {
  try {
    console.log(req.body);
    const { car, renter, pickUpDate, returnDate, status } = req.body;

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
    res.status(201).json({ message: "Rental created successfully", rental });
  } catch (error) {
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

    res.json(rentals);
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
          path: 'car',
          match: { owner: ownerId }, 
          populate: {
            path: 'owner',
          },
        })
        .populate('renter')
        .populate('discountCode')
        .sort({ createdAt: -1 });
  
      const filteredRentals = rentals.filter(
        (rental) => rental.car && rental.car.owner
      );
  
      if (filteredRentals.length === 0) {
        return res.status(200).json({ message: "No rentals found for this user" });
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
