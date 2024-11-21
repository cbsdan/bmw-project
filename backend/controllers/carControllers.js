const Cars = require('../models/Cars');
const cloudinary = require('cloudinary');
const Rental = require('../models/Rental');
const FavoriteCar = require('../models/FavoriteCar');


exports.createCar = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No images uploaded.'
            });
        }

        let imagesLinks = [];

        for (let file of req.files) {
            try {
                const result = await cloudinary.v2.uploader.upload(file.path, {
                    folder: 'Cars',
                    width: 150,
                    crop: 'scale'
                });

                imagesLinks.push({
                    public_id: result.public_id,
                    url: result.secure_url
                });
            } catch (error) {
                console.log('Error uploading to Cloudinary:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error uploading images to Cloudinary',
                    error: error.message
                });
            }
        }

        req.body.images = imagesLinks;

        const {
            model,
            brand,
            year,
            seatCapacity,
            fuel,
            mileage,
            transmission,
            displacement,
            vehicleType,
            pricePerDay,
            isAutoApproved,
            description,
            termsAndConditions,
            pickUpLocation,
            owner,
            isActive
        } = req.body;

        const carData = {
            images: imagesLinks, 
            model,
            brand,
            year,
            seatCapacity,
            fuel,
            mileage,
            transmission,
            displacement,
            vehicleType,
            pricePerDay,
            isAutoApproved,
            description,
            termsAndConditions,
            pickUpLocation,
            owner,
            isActive
        };

        const car = await Cars.create(carData);

        res.status(201).json({
            success: true,
            message: 'Car created successfully!',
            car
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error creating car',
            error: err.message
        });
    }
};


exports.getAllCars = async (req, res) => {
    try {
      const cars = await Cars.find();
  
      const carsWithImages = cars.map(car => {
        return {
          ...car.toObject(), 
          images: car.images.map(image => image.url)
        };
      });
  
      res.status(200).json(carsWithImages); 
    } catch (error) {
      console.error('Error fetching cars:', error); 
      res.status(500).json({ message: 'Error fetching cars', error: error.message });
    }
  };
  

  exports.deleteCar = async (req, res) => {
    try {
        const carId = req.params.id;
        const deletedCar = await Cars.findByIdAndDelete(carId); 
        
        if (!deletedCar) {
            return res.status(404).json({ message: 'Car not found' }); 
        }
        
        await FavoriteCar.deleteMany({ carId });

        await Rental.deleteMany({ carId });

        res.status(200).json({ message: 'Car deleted successfully', deletedCar }); 
    } catch (error) {
        console.error('Error deleting car:', error); 
        res.status(500).json({ message: 'Error deleting car', error: error.message }); 
    }
};

exports.updateCar = async (req, res, next) => {
    try {
        console.log(req.body)
        console.log(req.files)

        let car = await Cars.findById(req.params.id);
        
        if (!car) {
            return res.status(404).json({
                success: false,
                message: 'Car not found'
            });
        }

        if (req.files && req.files.length > 0) {
            for (let i = 0; i < car.images.length; i++) {
                await cloudinary.v2.uploader.destroy(car.images[i].public_id);
            }

            let imagesLinks = [];

            for (let file of req.files) {
                const result = await cloudinary.v2.uploader.upload(file.path, {
                    folder: 'Cars',
                    width: 150,
                    crop: 'scale'
                });

                imagesLinks.push({
                    public_id: result.public_id,
                    url: result.secure_url
                });
            }

            req.body.images = imagesLinks;
        }

        car = await Cars.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        });

        return res.status(200).json({
            success: true,
            car
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error updating car',
            error: err.message
        });
    }
};



exports.getSingleCar = async (req, res) => {
    try {
        const { id } = req.params;
        const car = await Cars.findById(id).populate('owner');
        
        if (!car) {
            return res.status(404).json({
                success: false,
                message: 'Car not found',
            });
        }

        const { 
            _id, model, brand, year, seatCapacity, fuel, mileage, transmission, displacement, 
            vehicleType, pricePerDay, isAutoApproved, description, termsAndConditions, 
            pickUpLocation, owner, images 
        } = car;

        return res.status(200).json({
            success: true,
            car: {
                _id, model, brand, year, seatCapacity, fuel, mileage, transmission, displacement, 
                vehicleType, pricePerDay, isAutoApproved, description, termsAndConditions, 
                pickUpLocation, owner, images
            },
        });
    } catch (error) {
        console.error('Error fetching car details:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

exports.getCarsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        const cars = await Cars.find({ owner: userId }).populate('owner');

        if (!cars || cars.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No cars found for this user',
            });
        }

        const carsWithImages = cars.map(car => ({
            ...car.toObject(),
            images: car.images.map(image => image.url)
        }));

        return res.status(200).json({
            success: true,
            cars: carsWithImages,
        });
    } catch (error) {
        console.error('Error fetching cars by user ID:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};