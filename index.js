const express = require('express');
require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000

app.get('/',(req,res)=>{
    res.send('Tech House server')
})

app.listen(port,()=>{
    console.log(`listening on port ${port}`)
})