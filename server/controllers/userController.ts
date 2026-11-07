import { Request, Response } from 'express';
import User from '../models/User';

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const syncUser = async (req: Request, res: Response) => {
    // This endpoint can be called after frontend login to ensure user exists in DB
    try {
        const { firebaseUid, email } = req.body;

        let user = await User.findOne({ firebaseUid });
        if (!user) {
            user = new User({ firebaseUid, email });
            await user.save();
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};
