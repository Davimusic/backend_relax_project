const express = require('express')
//const cors = require('cors');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const app = express()



require('dotenv').config()

app.use(express.json())
//app.use(cors());

const connectDB = require('./connectMongo')
//connectDB()
const BookModel = require('./models/book.model')

// Conexión a la base de datos
let db = null;
const getDB = async () => {
  if (!db) {
    db = await connectDB();
  }
  return db;
};



app.get('/api/mio', async (req, res) => {
    try {
      const db = await getDB();
      const collection = db.collection('primerRelaxProject');
      const data = await collection.find().toArray();

      return res.status(200).json({ data })
    } catch (error) {
      return res.status(500).json({
        msg: error.message
      })
    }
})

app.get('/api/tags', async (req, res) => { // it`s working
    try {
      const db = await getDB();
      const collection = db.collection('primerRelaxProject');
      const tags = await collection.distinct('tags');

      return res.status(200).json(tags);
    } catch (error) {
      return res.status(500).json({
        msg: error.message
      })
    }
})

app.post('/api/tipos', async (req, res) => {
  console.log('Handling request to /api/tipos');
  const db = await getDB();
  const collection = db.collection('primerRelaxProject');

  let filtro = req.body; // Ahora el filtro viene del cuerpo de la solicitud POST
  let llave = Object.keys(filtro)[0];
  let valor = filtro[llave];

  if(llave === 'tags'){
    try {
      const tags = await collection.distinct('tags');

      if(tags.includes(valor)) {
        const documentsCursor = await collection.find({
          tags: {
            $elemMatch: { $eq: valor }
          }
        });

        const documentsArray = await documentsCursor.toArray();
        console.log(`Found ${documentsArray.length} documents`);
        const responseObj = {
          documentos: documentsArray,
          llave: llave,
          otroDato: valor,
        };
        return res.status(200).json(responseObj);
      } else {
        return res.status(404).json({
          msg: 'Tag not found'
        });
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      return res.status(500).json({
        msg: error.message
      });
    }
  } else {
    console.log('The key is not "tags"');
  }
});

app.post('/api/validateUser', async (req, res) => {
  console.log('Handling request to /api/validateUser');
  const db = await getDB();
  const collection = db.collection('primerRelaxProject');

  let { email, password } = req.body; // Now the email and password come from the body of the POST request

  try {
      const user = await collection.findOne({ email: email });

      if(user) {
          bcrypt.compare(password, user.password, function(err, result) {
              if(result) {
                  console.log(`User ${user.email} authenticated successfully`);
                  return res.status(200).json({ msg: 'User authenticated successfully' });
              } else {
                  console.error('Error: Invalid email or password');
                  return res.status(404).json({ msg: 'Invalid email or password' });
              }
          });
      } else {
          console.error('Error: User not found');
          return res.status(404).json({ msg: 'User not found' });
      }
  } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ msg: error.message });
  }
});

app.post('/api/createNewUser', async (req, res) => {
  console.log('Manejando solicitud a /api/createNewUser');
  const db = await getDB();
  const collection = db.collection('primerRelaxProject');

  let filtro = req.body; // Ahora el filtro viene del cuerpo de la solicitud POST
  let llave = Object.keys(filtro)[0];
  let valor = filtro[llave];

  if(llave === 'email'){
    try {
      const emails = await collection.distinct('email');

      if(emails.includes(valor)) {
        return res.status(400).send(`${valor} ya existe`);
      } else {
        const hashedPassword = await bcrypt.hash(filtro['password'], saltRounds);
        let document = {
            email: valor,
            password: hashedPassword
        };

        const result = await db.collection('primerRelaxProject').insertOne(document);

        if (result.insertedId) {
            const responseObj = {
              msg: `${valor} fue creado exitosamente`,
              llave: llave,
              otroDato: valor,
            };
            return res.status(200).json(responseObj);
        } else {
            return res.status(500).json({
              msg: `Ha habido un problema creando el nuevo usuario ${valor}, por favor intenta de nuevo`
            });
        }
      }
    } catch (error) {
      console.error('Error insertando documento:', error);
      return res.status(500).json({
        msg: error.message
      });
    }
  } else {
    console.log('La llave no es "email"');
  }
});










app.post('/api/getTagCollection', async (req, res) => {
    try {
      const db = await getDB();
      const collection = db.collection('primerRelaxProject');
      let filtro = req.body; // Ahora el filtro viene del cuerpo de la solicitud POST
      let llave = Object.keys(filtro)[0];
      let valor = filtro[llave];

      if(llave === 'tags'){
        const documentsCursor = await collection.find({
          tags: {
            $elemMatch: { $eq: valor }
          }
        });

        const documentsArray = await documentsCursor.toArray();
        console.log(`Found ${documentsArray.length} documents`);
        return res.status(200).json(documentsArray);
      } else {
        console.log('The key is not "tags"');
      }
    } catch (error) {
      return res.status(500).json({
        msg: error.message
      })
    }
})

app.get('/api/dbname', async (req, res) => {
    try {
      const db = await getDB();
      return res.status(200).json({
        msg: 'Ok',
        dbName: db.databaseName
      })
    } catch (error) {
      return res.status(500).json({
        msg: error.message
      })
    }
})

  app.get('/', async (req, res) => {
    try {
        const data = await BookModel.find(query).skip(skip).limit(limit).sort({[orderBy]: sortBy})
        const totalItems = await BookModel.countDocuments(query)
        return res.status(200).json({
            msg: 'hola mundo',
        })
    } catch (error) {
        return res.status(500).json({
            msg: error.message
        })
    }
})

app.get('/api/v1/books', async (req, res) => {

    const { limit = 5, orderBy = 'name', sortBy = 'asc', keyword } = req.query
    let page = +req.query?.page

    if (!page || page <= 0) page = 1

    const skip = (page - 1) * +limit

    const query = {}

    if (keyword) query.name = { "$regex": keyword, "$options": "i" }

    try {
        const data = await BookModel.find(query).skip(skip).limit(limit).sort({[orderBy]: sortBy})
        const totalItems = await BookModel.countDocuments(query)
        return res.status(200).json({
            msg: 'Ok',
            data,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            limit: +limit,
            currentPage: page
        })
    } catch (error) {
        return res.status(500).json({
            msg: error.message
        })
    }
})

app.get('/api/v1/books/:id', async (req, res) => {
    try {
        const data = await BookModel.findById(req.params.id)

        if (data) {
            return res.status(200).json({
                msg: 'Ok',
                data
            })
        }

        return res.status(404).json({
            msg: 'Not Found',
        })
    } catch (error) {
        return res.status(500).json({
            msg: error.message
        })
    }
})

app.post('/api/v1/books', async (req, res) => {
    try {
        const { name, author, price, description } = req.body
        const book = new BookModel({
            name, author, price, description
        })
        const data = await book.save()
        return res.status(200).json({
            msg: 'Ok',
            data
        })
    } catch (error) {
        return res.status(500).json({
            msg: error.message
        })
    }
})

app.put('/api/v1/books/:id', async (req, res) => {
    try {
        const { name, author, price, description } = req.body
        const { id } = req.params

        const data = await BookModel.findByIdAndUpdate(id, {
            name, author, price, description
        }, { new: true })

        return res.status(200).json({
            msg: 'Ok',
            data
        })
    } catch (error) {
        return res.status(500).json({
            msg: error.message
        })
    }
})

app.delete('/api/v1/books/:id', async (req, res) => {
    try {
        await BookModel.findByIdAndDelete(req.params.id)
        return res.status(200).json({
            msg: 'Ok',
        })
    } catch (error) {
        return res.status(500).json({
            msg: error.message
        })
    }
})

const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log("Server is running on port " + PORT)
})