import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'officer', 'device'],
    required: true,
  },
  station: { type: mongoose.Schema.Types.ObjectId, ref: 'PoliceStation' },
  district: { type: mongoose.Schema.Types.ObjectId, ref: 'District' },
  province: { type: mongoose.Schema.Types.ObjectId, ref: 'Province' },
}, { timestamps: true });

export default mongoose.model('User', userSchema);