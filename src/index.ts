import * as dotenv from "dotenv";
dotenv.config();

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { MongoClient, ServerApiVersion, Db } from 'mongodb';

import { Village } from "./item.model";

console.log("MONGODB_URI:", process.env.MONGODB_URI);

const app = express();
app.use(cors());
app.use(bodyParser.json());

const client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get('/', async (req, res)=>{
    res.status(200).send("works")
})

app.get('/login', async (req, res)=>{
    res.status(200).send("works")
})

app.get('/register', async (req, res)=>{
    res.status(200).send("works")
})

// app.get('/village/:x/:y', async (req, res) => {
//     const db = client.db(process.env.DB_NAME);
//     const village = await db.collection('villages')
//         .findOne({ 
//             x: Number(req.params.x), 
//             y: Number(req.params.y) 
//         });
//     res.status(200).json(village);
// });

// app.post('/village', async (req, res) => {
//     const db = client.db(process.env.DB_NAME);

//     const temp = await db.collection('villages')
//         .findOne({ 
//             x: Number(req.body.x), 
//             y: Number(req.body.y) 
//         });

//     if (temp != null){
//         await db.collection('villages').insertOne({
//             x: Number(req.body.x),
//             y: Number(req.body.y),
//             image: String(req.body.image),
//             name: String(req.body.name),
//             slogan: String(req.body.slogan),
//             mayor: String(req.body.mayor),
//             confirmed: Boolean(req.body.confirmed)
//         });
//         res.status(200).send("village added");
//     }
//     else{
//         res.status(409).send("village already registered");
//     }
// });



// app.get('/', async (req, res)=>{
//     res.status(200).send("works");
// });

// app.get('/info/:x/:y/:type_id/all', async (req, res)=>{
//     const db = client.db(process.env.DB_NAME);
//     const village = await db.collection('info')
//         .find({                          
//             x: Number(req.params.x), 
//             y: Number(req.params.y),
//             type_id: Number(req.params.type_id)
//         }).sort({ date: -1 }).toArray();
//     res.status(200).json(village);
// });

// app.get('/info/:x/:y/:type_id', async (req, res)=>{
//     const db = client.db(process.env.DB_NAME);
//     const village = await db.collection('info')
//         .findOne({                          
//             x: Number(req.params.x), 
//             y: Number(req.params.y),
//             type_id: Number(req.params.type_id)

//         }, {
//             sort: { _id: -1 } 
//         });
//     res.status(200).json(village);
// });

// app.post('/info', async (req, res) => {
//     const db = client.db(process.env.DB_NAME);
//     await db.collection('info').insertOne({
//         x: Number(req.body.x),
//         y: Number(req.body.y),
//         type_id: Number(req.body.type_id),
//         value: Number(req.body.value),
//         edit_date: Date.now()
//     });
//     res.status(200).send('info added');
// });

app.listen(3000, ()=>{
    console.log("Expres server started on port 3000");
    console.log("http:localhost:3000");
});

