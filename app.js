const express = require('express')
const multer = require('multer')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        let ext = null
        switch (file.mimetype) {
            case 'image/jpeg':
                ext = '.jpeg';
                break;
            case 'image/png':
                ext = '.png';
                break;
        }
        cb(null, file.fieldname + '-' + Date.now() + ext)
    }
})

const upload = multer({ storage })

const app = express()
app.use(express.json())
app.use(cors())
app.use('/uploads', express.static('uploads'))

app.get('/', (req, res) => {
    res.json({
        msg: "hello world"
    })
})

app.post('/happy_couple', upload.single('photo'), function (req, res) {

    let imageData = {
        id: Date.now().toString(),
        url: `http://localhost:5000/${req.file.path}`,
        caption: req.body.capt
    }

    let allData = JSON.parse(fs.readFileSync('db.json'))

    allData.push(imageData)
    fs.writeFileSync('db.json', JSON.stringify(allData))

    res.json({ msg: "ok" })

})

//  get all data
app.get('/happy_couple', (req, res) => {
    let allData = JSON.parse(fs.readFileSync('db.json'))
    res.json(allData)
})

//  get a user data
app.get('/happy_couple/:id', (req, res) => {
    let id = req.params.id
    let allData = JSON.parse(fs.readFileSync('db.json'))
    let result = allData.filter(item => item.id === id)
    res.json(result)
})

//  delete image
app.delete('/happy_couple/:id', (req, res) => {
   
    let id = req.params.id

    let allData = JSON.parse(fs.readFileSync('db.json'))
    let result = allData.filter(item => item.id !== id)
    fs.writeFileSync('db.json', JSON.stringify(result))

    let file = allData.filter(item => item.id === id)

    let fileName = file[0].url.split('/')
    console.log(fileName[4]);
    fs.unlinkSync(path.join(__dirname,'uploads',fileName[4]))
    
    res.json({ msg: "success" })
})


app.listen(5000, () => console.log('server started'))
