import mongoose from 'mongoose';

const locationPingSchema = new mongoose.Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  speed: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
  district: { type: mongoose.Schema.Types.ObjectId, ref: 'District' },
  province: { type: mongoose.Schema.Types.ObjectId, ref: 'Province' },
}, { timestamps: true });

// Index for fast time-based queries
locationPingSchema.index({ vehicle: 1, timestamp: -1 });
locationPingSchema.index({ district: 1, timestamp: -1 });
locationPingSchema.index({ province: 1, timestamp: -1 });

export default mongoose.model('LocationPing', locationPingSchema);