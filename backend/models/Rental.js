const mongoose = require('mongoose');


const rentalSchema = new mongoose.Schema({
    car: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Cars', 
        required: true 
    },

    renter: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },

    pickUpDate: { 
        type: Date, 
        required: true 
    },
    returnDate: { 
        type: Date, 
        required: true 
    },
    status: {
            type: String,
            enum: ['Pending', 'Confirmed', 'Active', 'Returned', 'Canceled'],
            required: true
        },
    discountCode: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'DiscountCode' 
    },
    createdAt: { 
        type: Date, 
        default: Date.now, 
        required: true },
    updatedAt: { 
        type: Date, 
        default: Date.now, 
        required: true 
    }
});

module.exports = mongoose.model('Rental', rentalSchema);