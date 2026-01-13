var express = require('express');
var cors = require('cors');
var { MongoClient } = require('mongodb');
var app = express();
var url = "mongodb://localhost:27017/";

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Put CORS BEFORE any routes
app.use(cors({
    origin: 'http://localhost:3000', // your React dev server
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false // set to true ONLY if you use cookies/Authorization with cross-origin
}));

app.options('*', cors());
app.use(express.static(__dirname));
app.listen(5000, function () { console.log('listening on 5000'); });

(async () => {
    try {
        const client = new MongoClient(url);
        await client.connect();
        const dbo = client.db('mydb');

        app.post("/GetData", async function (req, res) {
            try {
                const cus = await dbo.collection('ScheduleData').find({}).toArray();
                res.json(cus);
            } catch (err) {
                res.status(500).json({ error: 'DB error', details: err.message });
            }
        });

        app.post("/BatchData", async function (req, res) {
            try {
                let eventData = [];
                if (req.body.action === "insert" || (req.body.action === "batch" && req.body.added && req.body.added.length > 0)) {
                    (req.body.action === "insert") ? eventData.push(req.body.value) : eventData = req.body.added;
                    for (let a = 0; a < eventData.length; a++) {
                        eventData[a].StartTime = new Date(eventData[a].StartTime);
                        eventData[a].EndTime = new Date(eventData[a].EndTime);
                        await dbo.collection('ScheduleData').insertOne(eventData[a]);
                    }
                }
                if (req.body.action === "update" || (req.body.action === "batch" && req.body.changed && req.body.changed.length > 0)) {
                    (req.body.action === "update") ? eventData.push(req.body.value) : eventData = req.body.changed;
                    for (let b = 0; b < eventData.length; b++) {
                        delete eventData[b]._id;
                        eventData[b].StartTime = new Date(eventData[b].StartTime);
                        eventData[b].EndTime = new Date(eventData[b].EndTime);
                        await dbo.collection('ScheduleData').updateOne({ "Id": eventData[b].Id }, { $set: eventData[b] });
                    }
                }
                if (req.body.action === "remove" || (req.body.action === "batch" && req.body.deleted && req.body.deleted.length > 0)) {
                    (req.body.action === "remove") ? eventData.push({ Id: req.body.key }) : eventData = req.body.deleted;
                    for (let c = 0; c < eventData.length; c++) {
                        await dbo.collection('ScheduleData').deleteOne({ "Id": eventData[c].Id });
                    }
                }
                res.json(req.body);
            } catch (err) {
                res.status(500).json({ error: 'DB error', details: err.message });
            }
        });

        // Optional: handle SIGINT to close client
        process.on('SIGINT', async () => {
            await client.close();
            process.exit(0);
        });

    } catch (err) {
        console.error('Mongo connection failed:', err);
        process.exit(1);
    }
})();

