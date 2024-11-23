const User = require('../models/User');

const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;

exports.registerUser = async (req, res, next) => {
    try {
        console.log(`Request Body: ${JSON.stringify(req.body)},\nRequest file: ${JSON.stringify(req.file)}`);

        const { uid, firstName, lastName, email } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists',
                errors: ["Email already exists"]
            });
        }

        let avatar = {
            public_id: null,
            url: null
        };

        if (req.file) {
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

            avatar = {
                public_id: result.public_id,
                url: result.secure_url
            };
        }

        const user = new User({
            uid,
            firstName,
            lastName,
            email,
            avatar
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



exports.getUser = async (req, res, next) => {
    const { uid } = req.body;  
    
    console.log(req.body);
    if (!uid) {
        return res.status(400).json({ message: 'Please provide UID' });
    }

    try {
        let user = await User.findOne({ uid });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error(error); 
        return res.status(500).json({ message: 'Internal Server Error' });
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
exports.updateMyProfile = async (req, res, next) => {
    try {
        console.log(`Req.files: ${JSON.stringify(req.file)}`)
        const newUserData = {};

        if (req.body.firstName) newUserData.firstName = req.body.firstName;
        if (req.body.lastName) newUserData.lastName = req.body.lastName;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(400).json({ message: `User not found ${req.params.id}` });
        }

        if (user.avatar && user.avatar.public_id) {
            await cloudinary.uploader.destroy(user.avatar.public_id);
        }

        if (req.file) {
            const fileTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!fileTypes.includes(req.file.mimetype)) {
                return res.status(400).json({
                    success: false,
                    message: 'Unsupported file type! Please upload a JPEG, JPG, or PNG image.'
                });
            }
            
            const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, {
                folder: 'avatars',
                width: 150,
                crop: 'scale',
            });

            newUserData.avatar = {
                url: cloudinaryResponse.secure_url,
                public_id: cloudinaryResponse.public_id,
            };
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, newUserData, {
            new: true,
            runValidators: true,
        });

        if (!updatedUser) {
            return res.status(400).json({ message: `User not updated ${req.params.id}` });
        }

        return res.status(200).json({
            success: true,
            user: updatedUser
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

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

exports.updateUserAvatar = async (req, res) => {
    try {
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
            crop: 'scale',
        });

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: `User not found with id: ${req.params.id}`
            });
        }

        user.avatar = {
            public_id: result.public_id,
            url: result.secure_url,
        };

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Avatar updated successfully!',
            user
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.updateUserPassword = async (req, res) => {
    const { newPassword } = req.body;
    console.log(req.body);

    try {
        if (!newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a new password'
            });
        }

        const user = await User.findById(req.params.id).select('+password'); 
        if (!user) {
            return res.status(404).json({
                success: false,
                message: `User not found with id: ${req.params.id}`
            });
        }

        user.password = newPassword; 

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Password updated successfully!'
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};