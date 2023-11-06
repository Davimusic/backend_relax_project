const mongoose = require('mongoose')
const { Schema } = mongoose

/*const bookSchema = new Schema({
  name: {
    type: String,
    require: true
  }, 
  author: String,
  price: {
    type: Number,
    require: true
  },
  description: String
}, {
    timestamps: true
})*/
const bookSchema = new Schema({
  name: {
    type: String,
    require: true
  },
  author: String,
  price: {
    type: Number,
    require: true
  },
  description: String,
  linkAudio: String,
  imagenAudio: String,
  titulo: String,
  contenido: String,
  meGusta: Boolean,
  tags: [String],
  tipo: String
}, {
    timestamps: true
})


module.exports = mongoose.model('Book', bookSchema)


