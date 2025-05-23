const mongoose = require('mongoose')

// Holds information for each project, takes in name and due date
// and creates a new project in the database
const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  due: { type: String }, //optional date for project completion, doesn't need to be strict
  tasks: [
    {
      title: String,
      done: { type: Boolean, default: false }
    }
  ]
})

module.exports = mongoose.model('Project', projectSchema)
