import * as dotenv from "dotenv";
dotenv.config();

import bcrypt from 'bcryptjs';
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb';
import { User, VillageStat, Village, VillageStatType, UserSchema, UserState } from "./item.model";
import { checkToken, genToken } from "./auth";
import { assignStatTypes, getLatestStatsByType, getLatestVillages } from "./functions";
import axios from 'axios';
import { z } from 'zod';
import { LoginRequestSchema, RegisterRequestSchema, VillagePostSchema, VillageRequestSchema, VillageStatHistoryRequestSchema, VillageStatsRequestSchema } from "./zod-schemas";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const client = new MongoClient(process.env.MONGODB_URI!, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


app.get('/', async (req, res) => {
    res.status(200).send("Server is running");
});

// Authentication endpoints
app.post('/login', async (req, res) => {
    try {
        const validationResult = LoginRequestSchema.safeParse(req.body)
        if (validationResult.success){
            const { login, password } = validationResult.data;
            const db = client.db(process.env.DB_NAME!);
            const user = await db.collection<User>('users').findOne({ login });
            
            if (user) {
                const passwordMatch = await bcrypt.compare(password, user.pass);
                if (passwordMatch) {
                    const token = genToken(user);
                    res.status(200).json({ 
                        message: "Login successful.", 
                        token,
                        user: {
                            login: user.login,
                            roblox_username: user.roblox_username
                        }
                    });

                }
                else{
                    res.status(401).json({ message: "Invalid credentials." });
                }
            }
            else{
                res.status(404).json({ message: "User not found." });
            }
            
        }
        else{
            res.status(400).json({ message: "Incorrect user data." });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

app.post('/register', async (req, res) => {
        try {
            const validationResult = RegisterRequestSchema.safeParse(req.body)
            if(validationResult.success){
                const { username, login, password } = validationResult.data;
                try {
                    const response = await axios.post(
                        'https://users.roblox.com/v1/usernames/users',
                        { "usernames": [username] }
                    );
                    const data = response.data.data;
                    if (data.length == 0){
                        res.status(404).json({ message: "Roblox user not found" });
                    }
                    else if (data.length != 0) {
                        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (regex.test(login)){
                            const db = client.db(process.env.DB_NAME!);
                            const existingUser = await db.collection('users').findOne({
                                $or: [
                                    { login: login },
                                    { roblox_username: username } 
                                ]
                            });
                            
                            if (!existingUser) {
                                const hashedPassword = await bcrypt.hash(password, 10);
                                await db.collection('users').insertOne({
                                    login,
                                    pass: hashedPassword,
                                    roblox_username: username,
                                    user_state: new ObjectId('683568f18ca8e061bce38346')
                                });
                                res.status(201).json({ message: "User created successfully." });
                            }
                            else{
                                res.status(409).json({ message: "User already exists." });
                            }
                        }
                        else{
                            res.status(400).json({ message: "Incorrect email." });
                        }
                    }
                    else{
                        res.status(500).json({ message: "Internal server error." });
                    }
                }catch (error)
                {
                    console.error("Registration error:", error);
                    res.status(500).json({ message: "Internal server error." });
                }
            }
            
        } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Internal srever error." });
    }
});

// New token verification endpoint
app.get('/verify-token', checkToken, (req, res) => {
    // If middleware passes, token is valid
    res.status(200).json({ 
        valid: true,
        user: req.user  // The login from the token
    });
});

// village==================
app.get('/village', async (req, res) => {
    try {
        const validationResult = VillageRequestSchema.safeParse(req.body);
        if (validationResult.success) {
            const {x, y} = validationResult.data;
            const db = client.db(process.env.DB_NAME!);
            
            const stat_history = await db.collection<VillageStat>('village_stats')
            .find({
                x: x,
                y: y
            })
            .sort({ report_date_time: 1 }) 
            .toArray(); 

            const stat_types = await db.collection<VillageStatType>('stat_types')
            .find({})
            .toArray();
            const assigned_stats = assignStatTypes(stat_history, stat_types);

            res.status(200).json({ stats: assigned_stats });
        }
        else{

            res.status(400).json({ 
                message: "Validation error",
                errors: validationResult.error.errors 
            });
        }
        
    }catch(error){
        console.error("Stat data retival", error);
        res.status(500).json({ message: "Internal server error" });
    }
});



app.get('/villages', async (req, res) => {
    try {
        const db = client.db(process.env.DB_NAME!);

        const villages = await db.collection<Village>('villages').find({}).toArray()
        
        const fresh_data = getLatestVillages(villages)
        res.status(200).json({ villages: fresh_data });

    }catch(error){
        console.error("Village data retival", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


app.post('/villages', checkToken, async (req, res) => {
    const validationResult = VillagePostSchema.safeParse(req.body);
    if(validationResult.success){
        const {x, y, mayor, name} = validationResult.data;
        try{
            const db = client.db(process.env.DB_NAME!);
            
            const village = await db.collection<Village>('villages')
                .find({
                    x: x,
                    y: y
                })
                .sort({ edit_datetime: -1 })
                .toArray()
            if (!village[0]){
                const user = await db.collection<UserSchema>('users').findOne({
                    login: req.user
                })
                if (user){
                    const user_state = await db.collection<UserState>('users').findOne({
                        _id: new ObjectId(user.user_state)
                    })

                    if (user_state){
                        if (user_state.clearance_level >= 1){
                            const newVillage: Village = {
                                _id: new ObjectId,
                                mayor: mayor,
                                name: name,
                                x: x,
                                y: y,
                                editor_id: new ObjectId(user._id),
                                edit_datetime: new Date()
                            }
                            await db.collection<Village>('villages').insertOne(newVillage);
                            


                            res.status(200).json({ message: "Village added."});
                        }
                        else{
                            res.status(500).json({ message: "Incorrect user clearance level."});
                        }
                    }
                    else{
                        res.status(500).json({ message: "Corrupted user data."});
                    }


                    
                }
            }
            else{
                res.status(400).json({ message: "Village already exsists."});
            }
            

        }catch(error){
            console.error("Village data append", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
});


app.put('/villages', checkToken, async (req, res) => {
    
});


app.delete('/villages', checkToken, async (req, res) => {

});

// stats=======================

app.get('/stat_history', async (req, res) => {
    try {
        const validationResult = VillageStatHistoryRequestSchema.safeParse(req.body);
        if (validationResult.success) {
            const {village_id, stat_type_id} = validationResult.data;
            const db = client.db(process.env.DB_NAME!);
            
            const stat_history = await db.collection<VillageStat>('village_stats')
            .find({
                village_id: new ObjectId(village_id),
                stat_type_id: new ObjectId(stat_type_id)
            })
            .sort({ report_date_time: 1 }) 
            .toArray();

            const stat_types = await db.collection<VillageStatType>('stat_types')
            .find({})
            .toArray();
            const assigned_stats = assignStatTypes(stat_history, stat_types);

            res.status(200).json({ stats: assigned_stats });
        }
        else{

            res.status(400).json({ 
                message: "Validation error",
                errors: validationResult.error.errors 
            });
        }
        
    }catch(error){
        console.error("Stat data retival", error);
        res.status(500).json({ message: "Internal server error" });
    }
    
    // res.status(200).send("all updates of a specyfic stat for a specyfic village");
});


app.get('/village_stats', async (req, res) => {
    try {
        const validationResult = VillageStatsRequestSchema.safeParse(req.body);
        if (validationResult.success){
            const {village_id} = validationResult.data;
            const db = client.db(process.env.DB_NAME!);

            const stats_data = await db.collection<VillageStat>('village_stats').find({
                village_id: new ObjectId(village_id)
            }).toArray()
            const fresh_data = getLatestStatsByType(stats_data);

            const stat_types = await db.collection<VillageStatType>('stat_types')
            .find({})
            .toArray();

            const assigned_stats = assignStatTypes(fresh_data, stat_types);

            res.status(200).json({ stats: assigned_stats });
        }else{
            res.status(400).json({ 
                message: "Validation error",
                errors: validationResult.error.errors 
            });
        }
        
        

    }catch(error){
        console.error("Stat data retival", error);
        res.status(500).json({ message: "Internal server error" });
    }
    // res.status(200).send("list of current stats of a specyfic village");
});


app.post('/village_stats', checkToken, async (req, res) => {
});


app.put('/village_stats', checkToken, async (req, res) => {

});


app.delete('/village_stats', checkToken, async (req, res) => {

});




// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
});


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    try {
        await client.connect();
        console.log(`Server running on port ${PORT}`);
        console.log(`http://localhost:${PORT}`);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Failed to connect to MongoDB", error);
        process.exit(1);
    }
});