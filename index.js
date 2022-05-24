const express = require('express')
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l9moh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        res.status(401).send({ message: "Unauthorized access" })
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded
        next()
    });
}

async function run() {
    try {
        await client.connect();
        const toolCollection = client.db('plex_tools').collection('tools')
        const orderCollection = client.db('plex_tools').collection('orders')
        const userCollection = client.db('plex_tools').collection('users')





        app.put('/user/:email', async (req, res) => {
            const email = req.params.email
            const user = req.body
            const filter = { email: email }
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options)
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
            res.send({ result, token })
        })
        // Get Six items
        app.get('/tools', async (req, res) => {
            const query = {}
            const tools = await toolCollection.find(query).limit(6).toArray()
            res.send(tools)
        })
        // Get All items
        app.get('/alltools', async (req, res) => {
            const query = {}
            const tools = await toolCollection.find(query).toArray()
            res.send(tools)
        })

        // find one item for puchase page
        app.get('/tool/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await toolCollection.findOne(query)
            res.send(result)
        })

        // put order in orders collection
        app.put('/order', async (req, res) => {
            const order = req.body
            const filter = { toolId: order.toolId }
            const exist = await orderCollection.findOne(filter)
            const options = { upsert: true };
            if (exist) {
                const updatedDoc = {
                    $set: {
                        quantity: exist.quantity + order.quantity
                    }
                }
                const updatedOrder = await orderCollection.updateOne(filter, updatedDoc, options)
                res.send(updatedOrder)
            }
            const result = await orderCollection.insertOne(order)
            res.send(result)
        })
    }
    finally {

    }
}
run().catch(console.dir)


app.get('/', (req, res) => {
    res.send("Hello from Plex Tools")
})
app.listen(port, () => {
    console.log("Plex app running on", port);
})