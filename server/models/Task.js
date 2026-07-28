const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  dueDate:     { type: Date },
  priority:    { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status:      { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
