import {SubServiceType} from "../models/subServiceTypeModel.js";

/**
 * Retrieves the object to a specific subServiceType by its ID
 * @param {String} req.params.id - request object
 * @returns SubServiceType object
 */
export const getSubServiceById = async (req, res) => {
  try {
    const subService = await SubServiceType.findById(req.params.id);
    if (!subService) {
      return res.status(404).json({ message: 'SubService not found' });
    }
    res.json(subService);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
