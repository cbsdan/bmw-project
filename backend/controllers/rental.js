const Rental = require('../models/Rental');

const createRent = async (req, res) => {
    try {
        console.log(req.body)
        const { car, renter, pickUpDate, returnDate, status } = req.body;

        if (!car || !renter || !pickUpDate || !returnDate || !status) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const rental = new Rental(req.body);
        
        const validationError = rental.validateSync();
        if (validationError) {
            const errorsArray = Object.keys(validationError.errors).map(key => ({
                field: key,
                message: validationError.errors[key].message,
            }));
            return res.status(400).json({ message: 'Validation errors', errors: errorsArray });
        }

        await rental.save();
        res.status(201).json({ message: 'Rental created successfully', rental });
    } catch (error) {
        res.status(500).json({ message: 'Error creating rental', error });
    }
};

const updateRent = async (req, res) => {
    try {
        const { id } = req.params;
        const rental = await Rental.findByIdAndUpdate(id, req.body, { new: true });
        if (!rental) {
            return res.status(404).json({ message: 'Rental not found' });
        }
        res.json({ message: 'Rental updated successfully', rental });
    } catch (error) {
        res.status(500).json({ message: 'Error updating rental', error });
    }
};

const deleteRent = async (req, res) => {
    try {
        const { id } = req.params;
        const rental = await Rental.findByIdAndDelete(id);
        if (!rental) {
            return res.status(404).json({ message: 'Rental not found' });
        }
        res.json({ message: 'Rental deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting rental', error });
    }
};

// Get all rental details
const getAllRentDetails = async (req, res) => {
    try {
        const rentals = await Rental.find().populate({
            path: 'car',
            populate: { path: 'owner' }
          }).populate('renter discountCode');
          
        res.json(rentals);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving rentals', error });
    }
};

// Get rental details by ID
const getRentDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const rental = await Rental.findById(id).populate({
            path: 'car',
            populate: { path: 'owner' }
          }).populate('renter discountCode');
        if (!rental) {
            return res.status(404).json({ message: 'Rental not found' });
        }
        res.json(rental);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving rental', error });
    }
};

module.exports = {
    createRent,
    updateRent,
    deleteRent,
    getAllRentDetails,
    getRentDetails
};
