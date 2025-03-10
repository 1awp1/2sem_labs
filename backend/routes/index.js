
import express from "express"
import passport from "passport";

const router = express.Router();

// Защищенный маршрут
router.get('/protected', passport.authenticate('local', { session: false }), (req, res) => {
    res.json({ message: 'Это защищенный маршрут.' });
});

export default router;
