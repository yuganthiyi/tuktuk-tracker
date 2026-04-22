import mongoose from 'mongoose';

const districtSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  province: { type: mongoose.Schema.Types.ObjectId, ref: 'Province', required: true },
}, { timestamps: true });

export default mongoose.model('District', districtSchema);