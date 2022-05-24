const express = require('express')
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l9moh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const toolCollection = client.db('plex_tools').collection('tools')

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
        app.get('/tools/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await toolCollection.findOne(query)
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