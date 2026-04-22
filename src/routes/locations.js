import express from 'express';
import LocationPing from '../models/LocationPing.js';
import Vehicle from '../models/Vehicle.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/locations/ping:
 *   post:
 *     summary: Submit a GPS location ping (tuk-tuk device)
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vehicle: { type: string }
 *               latitude: { type: number }
 *               longitude: { type: number }
 *               speed: { type: number }
 *     responses:
 *       201: { description: Ping recorded }
 */
router.post('/ping', authenticate, authorize('device', 'admin'), async (req, res) => {
  try {
    const { vehicle, latitude, longitude, speed } = req.body;
    const veh = await Vehicle.findById(vehicle);
    if (!veh) return res.status(404).json({ message: 'Vehicle not found' });

    const ping = await LocationPing.create({
      vehicle,
      latitude,
      longitude,
      speed,
      district: veh.district,
      province: veh.province,
    });
    res.status(201).json({ message: 'Ping recorded', ping });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/locations/last/{vehicleId}:
 *   get:
 *     summary: Get last known location of a tuk-tuk
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Last known location }
 */
router.get('/last/:vehicleId', authenticate, async (req, res) => {
  try {
    const ping = await LocationPing.findOne({ vehicle: req.params.vehicleId })
      .sort({ timestamp: -1 })
      .populate('vehicle', 'registrationNumber driverName')
      .populate('district', 'name')
      .populate('province', 'name');
    if (!ping) return res.status(404).json({ message: 'No location found' });
    res.json(ping);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/locations/history/{vehicleId}:
 *   get:
 *     summary: Get movement history of a tuk-tuk
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: from
 *         schema: { type: string }
 *         description: Start date (ISO format)
 *       - in: query
 *         name: to
 *         schema: { type: string }
 *         description: End date (ISO format)
 *     responses:
 *       200: { description: Movement history }
 */
router.get('/history/:vehicleId', authenticate, async (req, res) => {
  try {
    const filter = { vehicle: req.params.vehicleId };
    if (req.query.from || req.query.to) {
      filter.timestamp = {};
      if (req.query.from) filter.timestamp.$gte = new Date(req.query.from);
      if (req.query.to) filter.timestamp.$lte = new Date(req.query.to);
    }
    const pings = await LocationPing.find(filter)
      .sort({ timestamp: -1 })
      .populate('district', 'name')
      .populate('province', 'name');
    res.json({ count: pings.length, pings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/locations/active:
 *   get:
 *     summary: Get all active tuk-tuks with last known location
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: province
 *         schema: { type: string }
 *       - in: query
 *         name: district
 *         schema: { type: string }
 *     responses:
 *       200: { description: Active vehicles with locations }
 */
router.get('/active', authenticate, async (req, res) => {
  try {
    const filter = {};
    if (req.query.province) filter.province = req.query.province;
    if (req.query.district) filter.district = req.query.district;

    const vehicles = await Vehicle.find({ ...filter, isActive: true });
    const results = await Promise.all(vehicles.map(async (v) => {
      const last = await LocationPing.findOne({ vehicle: v._id }).sort({ timestamp: -1 });
      return { vehicle: v, lastLocation: last || null };
    }));
    res.json({ count: results.length, results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;