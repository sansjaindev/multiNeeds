const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        const data = jwt.verify(token, 'SECRET_KEY');
        req.userId = data.userId;
        req.userRole = data.role;
        next();
    } catch {
        res.status(401).json({ message: 'Invalid token' });
    }
};


router.post('/signup', async (req, res) => {
    try {
        const { name, username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const user = new User({ name, username, password });
        await user.save();

        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).send({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, 'SECRET_KEY');
        res.send({ token });
    } catch (err) {
        res.status(400).send(err);
    }
});

router.post('/admin-login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).send({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, 'SECRET_KEY');
        res.send({ token });
    } catch (err) {
        res.status(400).send(err);
    }
})

router.get('/isLoggedIn', authMiddleware, (req, res) => {
    res.json({ loggedIn: true, role: req.userRole });
});

module.exports = router;
