import express from 'express';
import Province from '../models/Province.js';
import District from '../models/District.js';
import PoliceStation from '../models/PoliceStation.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/admin/provinces:
 *   get:
 *     summary: Get all provinces
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: List of provinces }
 */
router.get('/provinces', authenticate, async (req, res) => {
  try {
    const provinces = await Province.find();
    res.json(provinces);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/admin/districts:
 *   get:
 *     summary: Get all districts
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: province
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of districts }
 */
router.get('/districts', authenticate, async (req, res) => {
  try {
    const filter = {};
    if (req.query.province) filter.province = req.query.province;
    const districts = await District.find(filter).populate('province', 'name');
    res.json(districts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/admin/stations:
 *   get:
 *     summary: Get all police stations
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: district
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of stations }
 */
router.get('/stations', authenticate, async (req, res) => {
  try {
    const filter = {};
    if (req.query.district) filter.district = req.query.district;
    const stations = await PoliceStation.find(filter)
      .populate('district', 'name')
      .populate('province', 'name');
    res.json(stations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;