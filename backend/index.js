const express = require('express')
const mongoose = require('mongoose')

const app = express()
const port = 3001

app.get('/', (req, res) => {
  res.send('Hello World!_')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

mongoose.connect('mongodb+srv://monish:nYhlDFYHctw9SoZn@cluster0.calxut2.mongodb.net/' , {
      useNewUrlParser: true,
      useUnifiedTopology: true
  }).then(()=>{
        console.log('MongoDB Connected...');}).catch((err)=>{
      console.error('MongoDB Connection Failed:', error);}
        );