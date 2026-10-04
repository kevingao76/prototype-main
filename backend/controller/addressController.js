import express from 'express';
import Address from '../models/addressModel.js'; // adjust the path accordingly

const router = express.Router();

/**
 * Create a new address
 * @param {string} req.body.country - The country of the address
 * @param {string} req.body.city - The city of the address
 * @param {string} req.body.zipCode - The zip code of the address
 * @param {string} req.body.street - The street of the address
 * @param {string} req.body.houseNumber - The house number of the address
 * @returns {Object} The new address object or an error message
 * @throws {Error} If the address could not be created
 */
router.post('/create', async (req, res) => {
    const { country, city, zipCode, street, houseNumber } = req.body;
    try {
        const newAddress = Address.create(
            {
                country: country,
                city: city,
                zipCode: zipCode,
                street: street,
                houseNumber: houseNumber
            }
        );
        res.status(201).json(savedAddress);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * Retrieve all addresses
 */
router.get('/getAll', async (req, res) => {
    try {
        const addresses = await Address.find();
        res.status(200).json(addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * Retrieve an address by ID
 * @param {string} req.params.id - The ID of the address to retrieve
 */
router.get('/byId/:id', async (req, res) => {
    try {
        const address = await Address.findById(req.params.id);
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }
        res.status(200).json(address);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * Update an address by ID
 * @param {string} req.params.id - The ID of the address to update
 */
router.put('/update/:id', async (req, res) => {
    try {
        const updatedAddress = await Address.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedAddress) {
            return res.status(404).json({ message: 'Address not found' });
        }
        res.status(200).json(updatedAddress);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * Delete an address by ID
 * @param {string} req.params.id - The ID of the address to delete
 */
router.delete('/delete/:id', async (req, res) => {
    try {
        const deletedAddress = await Address.findByIdAndDelete(req.params.id);
        if (!deletedAddress) {
            return res.status(404).json({ message: 'Address not found' });
        }
        res.status(200).json({ message: 'Address deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
