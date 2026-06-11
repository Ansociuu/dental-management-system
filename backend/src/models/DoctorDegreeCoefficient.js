const mongoose = require('mongoose');

const doctorDegreeCoefficientSchema = new mongoose.Schema({
  degreeLevel: {
    type: String,
    enum: ['UNIVERSITY', 'MASTER', 'DOCTORATE', 'ASSOCIATE_PROFESSOR', 'PROFESSOR'],
    required: true,
    unique: true,
    index: true
  },
  degreeLabel: {
    type: String,
    required: true,
    trim: true
  },
  coefficient: {
    type: Number,
    required: true,
    min: 0
  },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('DoctorDegreeCoefficient', doctorDegreeCoefficientSchema);
