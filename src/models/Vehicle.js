import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  registrationNumber: { type: String, required: true, unique: true },
  driverName: { type: String, required: true },
  driverNIC: { type: String, required: true, unique: true },
  phone: { type: String },
  district: { type: mongoose.Schema.Types.ObjectId, ref: 'District', required: true },
  province: { type: mongoose.Schema.Types.ObjectId, ref: 'Province', required: true },
  deviceUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Vehicle', vehicleSchema);