const mongoose = require('mongoose');

const doctorSalaryProfileSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  degreeLevel: {
    type: String,
    enum: ['UNIVERSITY', 'MASTER', 'DOCTORATE', 'ASSOCIATE_PROFESSOR', 'PROFESSOR'],
    default: 'UNIVERSITY'
  },
  doctorCoefficient: {
    type: Number,
    required: true,
    min: 0,
    default: 1.3
  },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('DoctorSalaryProfile', doctorSalaryProfileSchema);
