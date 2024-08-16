const express = require('express');
require('dotenv').config()
const jwt = require('jsonwebtoken')
const app = express()
const port = process.env.PORT || 5000
const cookieParser = require('cookie-parser')
const cors = require('cors')

app.use(express.json())
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(cookieParser())


const secureRoute = (req,res,next)=>{
      const token = req.cookies.token
      jwt.verify(token,process.env.JWT_SECRET,(err,userData)=>{
          if(err){
            return res.status(401).send('unauthorized access')
          }
          else{
            req.user = userData
            return next()
          }
      })
}

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@databases1.utppk3d.mongodb.net/?retryWrites=true&w=majority&appName=databases1`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection

    const productsCollection = client.db('Tech_House').collection('Products')

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    app.get('/',(req,res)=>{
        res.send('Tech House server')
    })

    app.get('/products', secureRoute, async(req,res)=>{
          const {pages,count} = req.query
          const pagesInt = parseInt(pages)
          const countInt = parseInt(count)
          const products = await productsCollection.find().skip(countInt*pagesInt).limit(pagesInt).toArray()
          res.send(products)
    })

    app.get('/search', secureRoute, async(req,res)=>{
          const {pages,count,value} = req.query
          const pagesInt = parseInt(pages)
          const countInt = parseInt(count)
          const products = await productsCollection.find({name: {$regex: new RegExp(value,'i')}}).skip(countInt*pagesInt).limit(pagesInt).toArray()
          res.send(products)
    })
    app.get('/searchCount', secureRoute, async(req,res)=>{
          const {value} = req.query
          const products = await productsCollection.find({name: {$regex: new RegExp(value,'i')}}).toArray()
          const count = products.length
          res.send({count})
    })

    app.get('/itemsCount', secureRoute, async(req,res)=>{
          const products =  await productsCollection.find().toArray()
          const count = products.length
          res.send({count})
    })

    app.post('/token',(req,res)=>{
        const data = req.body
        const token = jwt.sign(data,process.env.JWT_SECRET, {expiresIn: '24h'})
        res.cookie('token',token, {httpOnly: true, sameSite: 'none', secure:true, }).send()
    })

    app.post('/removeToken',(req,res)=>{
        res.clearCookie('token',{httpOnly: true, sameSite: 'none', secure: true , maxAge: 0}).send()
    })
    


  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port,()=>{
    console.log(`listening on port ${port}`)
})