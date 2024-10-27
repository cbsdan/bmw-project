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
                message: 'Email already exists', 
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
            message: 'Your registration is successful!', 
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


exports.loginUser = async (req, res, next) => {
    const { email, password } = req.body;
    
    console.log(req.body);
    // Check if email and password are entered
    if (!email || !password) {
        return res.status(400).json({ error: 'Please enter email & password' });
    }

    try {
        // Finding user in database
        let user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid Email' });
        }

        // Check if password is correct
        const isPasswordMatched = await user.comparePassword(password);
        if (!isPasswordMatched) {
            return res.status(401).json({ message: 'Wrong Password' });
        }

        const token = user.getJwtToken();

        return res.status(200).json({
            success: true,
            user,
            token,
        });
    } catch (error) {
        console.error(error); 
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find()

        if (!users) {
            return res.status(400).json({message: "no users found"})

        }
        return res.status(200).json({
            success: true,
            users
        })
    } catch (error) {
        console.error(error); 
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.getUserDetails = async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(400).json({ message: `User does not found with id: ${req.params.id}` })  
    }

    return res.status(200).json({
        success: true,
        user
    })
}

exports.updateUser = async (req, res, next) => {
    try {
        console.log(`Request Body: ${JSON.stringify(req.body)}`);

        const newUserData = {};
        if (req.body.firstName) newUserData.firstName = req.body.firstName;
        if (req.body.lastName) newUserData.lastName = req.body.lastName;
        if (req.body.email) newUserData.email = req.body.email;
        if (req.body.role) newUserData.role = req.body.role;

        const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
            new: true,
            runValidators: true,
        });
    
        if (!user) {
            return res.status(400).json({ message: `User not updated ${req.params.id}` });
        }
    
        return res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

