const User = require('../models/User');

const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;

exports.registerUser = async (req, res, next) => {
    try {
        console.log(`Request Body: ${JSON.stringify(req.body)},\nRequest file: ${JSON.stringify(req.file)}`);

        const { firstName, lastName, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists', // You can customize this message
                errors: ["Email already exists"]
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an avatar image'
            });
        }

        const fileTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!fileTypes.includes(req.file.mimetype)) {
            return res.status(400).json({
                success: false,
                message: 'Unsupported file type! Please upload a JPEG, JPG, or PNG image.'
            });
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'avatars',
            width: 150,
            crop: "scale"
        });

        const user = new User({
            firstName,
            lastName,
            email,
            password,
            avatar: {
                public_id: result.public_id,
                url: result.secure_url
            }
        });

        const validationError = user.validateSync();
        if (validationError) {
            const errorMessages = Object.values(validationError.errors).map(error => error.message);
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errorMessages
            });
        }

        await user.save();

        const token = user.getJwtToken();

        return res.status(201).json({
            success: true,
            message: 'Your registration is successful!',  // Add this line
            user,
            token
        });

    } catch (err) {
        console.error(err.message);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
