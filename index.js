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
          const {pages,count,brands,categories,sortByPrice,sortByDate,value} = req.query
          console.log(value, typeof value)
          const pagesInt = parseInt(pages)
          const countInt = parseInt(count)
          const newBrands = brands.split(',')
          const newCategories = categories.split(',')
          let query = {}
            let priceSortType = 'default'
            let dateSortType = 'default'
    
            if(sortByPrice === 'low'){
              priceSortType = 1
            }
            if(sortByPrice === 'high'){
              priceSortType = -1
            }
            if(sortByPrice === 'default'){
              priceSortType = 'default'
            }
            if(sortByDate === 'oldest'){
              dateSortType = 1
            }
            if(sortByDate === 'latest'){
              dateSortType = -1
            }
            if(sortByDate === 'default'){
              dateSortType = 'default'
            }
            if(value==='null'){
              if(newBrands[0] !== '' && newCategories[0] === ''){
                query = {brand:{$in:newBrands}}
              }
              if(newCategories[0] !== '' && newBrands[0] === ''){
                query = {category:{$in:newCategories}}
              }
              if(newBrands[0] !== '' && newCategories[0] !== ''){
                query = {brand:{$in:newBrands},category:{$in:newCategories}}
              }
     
              
            if(priceSortType == 'default' && dateSortType == 'default'){
              const products = await productsCollection.find(query).skip(countInt*pagesInt).limit(pagesInt).toArray()
              return res.send(products)
            }

            if(priceSortType == 'default' && dateSortType !== 'default'){
              const products = await productsCollection.find(query).skip(countInt*pagesInt).limit(pagesInt).sort({createdAt: dateSortType}).toArray()
              return res.send(products)
            }
            if(priceSortType !== 'default' && dateSortType == 'default'){
              const products = await productsCollection.find(query).skip(countInt*pagesInt).limit(pagesInt).sort({price: priceSortType}).toArray()
              return res.send(products)
            }

            if(priceSortType !== 'default' && dateSortType !== 'default'){
              const products = await productsCollection.find(query).skip(countInt*pagesInt).limit(pagesInt).sort({price: priceSortType, createdAt: dateSortType}).toArray()
              return res.send(products)
            }
            }
            else{
              query={name: {$regex: new RegExp(value,'i')}}
              if(newBrands[0] !== '' && newCategories[0] === ''){
                query = {brand:{$in:newBrands}, name: {$regex: new RegExp(value,'i')} }
              }
              if(newCategories[0] !== '' && newBrands[0] === ''){
                query = {category:{$in:newCategories}, name: {$regex: new RegExp(value,'i')} }
              }
              if(newBrands[0] !== '' && newCategories[0] !== ''){
                query = {brand:{$in:newBrands},category:{$in:newCategories}, name: {$regex: new RegExp(value,'i')} }
              }

            if(priceSortType == 'default' && dateSortType == 'default'){
              const products = await productsCollection.find(query).skip(countInt*pagesInt).limit(pagesInt).toArray()
              return res.send(products)
            }

            if(priceSortType == 'default' && dateSortType !== 'default'){
              const products = await productsCollection.find(query).skip(countInt*pagesInt).limit(pagesInt).sort({createdAt: dateSortType,brand:1,name:1}).toArray()
              return res.send(products)
            }
            if(priceSortType !== 'default' && dateSortType == 'default'){
              const products = await productsCollection.find(query).skip(countInt*pagesInt).limit(pagesInt).sort({price: priceSortType,brand:1,name:1}).toArray()
              return res.send(products)
            }

            if(priceSortType !== 'default' && dateSortType !== 'default'){
              const products = await productsCollection.find(query).skip(countInt*pagesInt).limit(pagesInt).sort({price: priceSortType, createdAt: dateSortType,brand:1,name:1}).toArray()
              return res.send(products)
            }
            }
       
    })


    app.get('/itemsCount', secureRoute, async(req,res)=>{
      const {brands,categories,value} = req.query
      const newBrands = brands.split(',')
      const newCategories = categories.split(',')
        let query = {}
           if(value==='null'){
          if(newBrands[0] === '' && newCategories[0]===''){
            const products =  await productsCollection.find(query).toArray()
            const count = products.length
            return res.send({count})
          }
          if(newBrands[0] !== '' && newCategories[0] === ''){
            query = {brand:{$in:newBrands}}
            const products =  await productsCollection.find(query).toArray()
            const count = products.length
            console.log(count)
            return res.send({count})
          }
          if(newCategories[0] !== '' && newBrands[0] === ''){
            query = {category:{$in:newCategories}}
            const products =  await productsCollection.find(query).toArray()
            const count = products.length
            console.log(query)
            console.log(count)
            return res.send({count})
          }
          if(newBrands[0] !== '' && newCategories[0] !== ''){
            query = {brand:{$in:newBrands}}
            const products =  await productsCollection.find(query).toArray()
            const count = products.length
            return res.send({count})
          }
        }
      
        else{
          if(newBrands[0] === '' && newCategories[0]===''){
            const products =  await productsCollection.find({name: {$regex: new RegExp(value,'i')}}).toArray()
            const count = products.length
            return res.send({count})
          }
          if(newBrands[0] !== '' && newCategories[0] === ''){
            query = {brand:{$in:newBrands}, name: {$regex: new RegExp(value,'i')}}
            const products =  await productsCollection.find(query).toArray()
            const count = products.length
            return res.send({count})
          }
          if(newCategories[0] !== '' && newBrands[0] === ''){
            query = {brand:{$in:newBrands}, name: {$regex: new RegExp(value,'i')}}
            const products =  await productsCollection.find(query).toArray()
            const count = products.length
            return res.send({count})
          }
          if(newBrands[0] !== '' && newCategories[0] !== ''){
            query = {brand:{$in:newBrands}, name: {$regex: new RegExp(value,'i')}}
            const products =  await productsCollection.find(query).toArray()
            const count = products.length
            return res.send({count})
          }
        }
     
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