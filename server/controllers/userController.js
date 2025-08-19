const router = require('express').Router();
const User = require('../models/user');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/get-logged-user', authMiddleware, async (req, res) => {
    try{
        const user = await User.findOne({_id: req.userId});

        res.send({
            message: 'User fetched successfully', 
            success: true,
            data: user
        });

    } catch(err){ 
        res.status(400).send({
            message: err.message,
            success: false

        })
    }
});


// Update user profile (firstname and lastname)
router.put('/update-profile', authMiddleware, async (req, res) => {
    try {
        const { firstname, lastname } = req.body;
        
        if (!firstname || !lastname) {
            return res.status(400).send({
                message: 'First name and last name are required',
                success: false
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            { 
                firstname: firstname.trim(),
                lastname: lastname.trim()
            },
            { 
                new: true, 
                runValidators: true 
            }
        );

        if (!updatedUser) {
            return res.status(404).send({
                message: 'User not found',
                success: false
            });
        }

        res.send({
            message: 'Profile updated successfully',
            success: true,
            data: updatedUser
        });

    } catch (err) {
        res.status(400).send({
            message: err.message,
            success: false
        });
    }
});


// Debug
router.get('/test', (req, res) => {
    res.send({
        message: 'User routes are working!',
        success: true
    });
});

module.exports = router;
