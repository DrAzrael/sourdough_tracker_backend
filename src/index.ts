import * as dotenv from "dotenv";
dotenv.config();

import bcrypt from 'bcryptjs';
import express from "express";
import bodyParser from "body-parser";
import cors, { CorsOptions } from "cors";
import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb';
import { User, VillageStat, Village, VillageStatType, UserSchema, UserState } from "./item.model";
import { checkToken, genToken } from "./auth";
import { assignStatTypes, getLatestStatsByType } from "./functions";
import axios from 'axios';
import { date, z } from 'zod';
import { LoginRequestSchema, RegisterRequestSchema, VillageDeleteSchema, VillagePostSchema, VillagePutSchema, VillageGetSchema, VillageStatsGetSchema, VillageStatHistoryGetSchema, VIllageStatPostSchema, VillageStatPutSchema, VillageStatDeleteSchema } from "./zod-schemas";
import cookieParser from 'cookie-parser';
const app = express();
const corsOptions: CorsOptions = {
    origin: ['http://localhost:5173', 'https://sourdoughtracker.vercel.app'],
    credentials: true
}
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser())

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
                    res.cookie('jwt_token', token, {maxAge: 30*24*60*60})
                    res.status(200).json({ 
                        message: "Login successful.", 
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
        const validationResult = VillageGetSchema.safeParse(req.body);
        if (validationResult.success) {
            const {x, y} = validationResult.data;
            const db = client.db(process.env.DB_NAME!);
            
            const village = await db.collection<Village>('villages')
            .findOne({
                x: x,
                y: y
            })
            if (village){
                res.status(200).json({ village: village });
            }
            else{
                res.status(404).json({ message: "Village not found." });
            }


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

        res.status(200).json({ villages: villages });

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
                .findOne({
                    x: x,
                    y: y
                })
            if (!village){
                const user = await db.collection<UserSchema>('users').findOne({
                    login: req.user
                })
                if (user){
                    const user_state = await db.collection<UserState>('user_stats').findOne({
                        _id: new ObjectId(user.user_state.toString())
                    })

                    if (user_state){
                        if (user_state.clearance_level >= 1){
                            const newVillage: Village = {
                                _id: new ObjectId,
                                mayor: mayor,
                                name: name,
                                x: x,
                                y: y
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
    else{

        res.status(400).json({ 
            message: "Validation error",
            errors: validationResult.error.errors 
        });
    }
});


app.put('/villages', checkToken, async (req, res) => {
    const validationResult = VillagePutSchema.safeParse(req.body);
    if (validationResult.success) {
        const { x, y, mayor, name } = validationResult.data;
        try {
            const db = client.db(process.env.DB_NAME!);
            
            // Check if village exists
            const village = await db.collection<Village>('villages').findOne({
                x: x,
                y: y
            });
            
            if (village) {
                // Check user permissions
                const user = await db.collection<UserSchema>('users').findOne({
                    login: req.user
                });
                
                if (user) {
                    const user_state = await db.collection<UserState>('users').findOne({
                        _id: new ObjectId(user.user_state)
                    });

                    if (user_state) {
                        if (user_state.clearance_level >= 1) {
                            // Prepare update object with only provided fields
                            const updateData: Partial<Village> = {};
                            if (mayor !== undefined) updateData.mayor = mayor;
                            if (name !== undefined) updateData.name = name;
                            
                            // Update the village
                            await db.collection<Village>('villages').updateOne(
                                { _id: village._id },
                                { $set: updateData }
                            );
                            
                            res.status(200).json({ message: "Village updated successfully." });
                        } else {
                            res.status(403).json({ message: "Insufficient clearance level." });
                        }
                    } else {
                        res.status(500).json({ message: "Corrupted user data." });
                    }
                } else {
                    res.status(404).json({ message: "User not found." });
                }
            } else {
                res.status(404).json({ message: "Village not found." });
            }
        } catch (error) {
            console.error("Village update error", error);
            res.status(500).json({ message: "Internal server error" });
        }
    } else {
        res.status(400).json({ 
            message: "Validation error",
            errors: validationResult.error.errors 
        });
    }
});


app.delete('/villages', checkToken, async (req, res) => {
    const validationResult = VillageDeleteSchema.safeParse(req.body);
    if(validationResult.success){
        const {x, y} = validationResult.data;
        try {
            const db = client.db(process.env.DB_NAME!);
            
            // Check if village exists
            const village = await db.collection<Village>('villages').findOne({
                x: x,
                y: y
            });
            
            if (village) {
                // Check user permissions
                const user = await db.collection<UserSchema>('users').findOne({
                    login: req.user
                });
                
                if (user) {
                    const user_state = await db.collection<UserState>('users').findOne({
                        _id: new ObjectId(user.user_state)
                    });

                    if (user_state) {
                        if (user_state.clearance_level >= 1) {
                            // Delete the village
                            await db.collection<Village>('villages').deleteOne({
                                _id: village._id
                            });
                            
                            res.status(200).json({ message: "Village deleted successfully." });
                        } else {
                            res.status(403).json({ message: "Insufficient clearance level." });
                        }
                    } else {
                        res.status(500).json({ message: "Corrupted user data." });
                    }
                } else {
                    res.status(404).json({ message: "User not found." });
                }
            } else {
                res.status(404).json({ message: "Village not found." });
            }
        } catch (error) {
            console.error("Village deletion error", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
    else{
        res.status(400).json({ 
            message: "Validation error",
            errors: validationResult.error.errors 
        });
    }
});

// stats=======================

app.get('/stat_history', async (req, res) => {
    try {
        const validationResult = VillageStatHistoryGetSchema.safeParse(req.body);
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
        const validationResult = VillageStatsGetSchema.safeParse(req.body);
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
    const validationResult = VIllageStatPostSchema.safeParse(req.body);
    if(validationResult.success){
        const {stat_type_id, village_id, value} = validationResult.data;
        try{
            const db = client.db(process.env.DB_NAME!);
            const village = await db.collection<Village>('villages').findOne({
                _id: new ObjectId(village_id)
            });
            
            if (village) {
                // Check user permissions
                const user = await db.collection<UserSchema>('users').findOne({
                    login: req.user
                });
                
                if (user) {
                    const user_state = await db.collection<UserState>('users').findOne({
                        _id: new ObjectId(user.user_state)
                    });

                    if (user_state) {
                        if (user_state.clearance_level >= 1) {
                            const stat_type = await db.collection<VillageStatType>('stat_types').findOne({
                                _id: new ObjectId(stat_type_id)
                            });
                            if(stat_type){
                                const newVillageStat: VillageStat = {
                                    _id: new ObjectId,
                                    stat_type_id: new ObjectId(stat_type_id),
                                    village_id:  new ObjectId(village_id),
                                    reporter_id: new ObjectId(user._id),
                                    report_date_time: new Date(),
                                    value: value
                                }
                                
                                res.status(200).json({ message: "Village stat added successfully." });
                            }else{
                                res.status(404).json({ message: "Stat type not found." });
                            }
                        } else {
                            res.status(403).json({ message: "Insufficient clearance level." });
                        }
                    } else {
                        res.status(500).json({ message: "Corrupted user data." });
                    }
                } else {
                    res.status(404).json({ message: "User not found." });
                }
            } else {
                res.status(404).json({ message: "Village not found." });
            }

        }catch(error){
            console.error("Village stat data append", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
    else{

        res.status(400).json({ 
            message: "Validation error",
            errors: validationResult.error.errors 
        });
    }
});


app.put('/village_stats', checkToken, async (req, res) => {
    const validationResult = VillageStatPutSchema.safeParse(req.body);
    if(validationResult.success){
        const {_id, stat_type_id, village_id, value} = validationResult.data;
        try{
            const db = client.db(process.env.DB_NAME!);
            
            const existingStat = await db.collection<VillageStat>('village_stats').findOne({
                _id: new ObjectId(_id)
            });
            
            if (existingStat){
                const user = await db.collection<UserSchema>('users').findOne({
                    login: req.user
                });
                
                if (user){
                    const user_state = await db.collection<UserState>('users').findOne({
                        _id: new ObjectId(user.user_state)
                    });

                    if (user_state){
                        const isOriginalReporter = existingStat.reporter_id.equals(user._id);
                        const hasHighClearance = user_state.clearance_level >= 2;
                        
                        if (isOriginalReporter || hasHighClearance){
                            const updateData: Partial<VillageStat> = {};
                            if (stat_type_id) updateData.stat_type_id = new ObjectId(stat_type_id);
                            if (village_id) updateData.village_id = new ObjectId(village_id);
                            if (value) updateData.value = value;
                            updateData.report_date_time = new Date();

                            await db.collection<VillageStat>('village_stats').updateOne(
                                { _id: existingStat._id },
                                { $set: updateData }
                            );
                            
                            res.status(200).json({ message: "Village stat updated."});
                        }
                        else{
                            res.status(403).json({ message: "Not original reporter or insufficient clearance."});
                        }
                    }
                    else{
                        res.status(500).json({ message: "Corrupted user data."});
                    }
                }
                else{
                    res.status(404).json({ message: "User not found."});
                }
            }
            else{
                res.status(404).json({ message: "Village stat not found."});
            }
            

        }catch(error){
            console.error("Village stat update", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
    else{
        res.status(400).json({ 
            message: "Validation error",
            errors: validationResult.error.errors 
        });
    }
});

//deletes only a single entry
app.delete('/village_stats', checkToken, async (req, res) => {
    const validationResult = VillageStatDeleteSchema.safeParse(req.body);
    if(validationResult.success){
        const {_id} = validationResult.data;
        try{
            const db = client.db(process.env.DB_NAME!);
            
            const villageStat = await db.collection<VillageStat>('village_stats').findOne({
                _id: new ObjectId(_id)
            });
            
            if (villageStat){
                const user = await db.collection<UserSchema>('users').findOne({
                    login: req.user
                });
                
                if (user){
                    const user_state = await db.collection<UserState>('users').findOne({
                        _id: new ObjectId(user.user_state)
                    });

                    if (user_state){
                        const isOriginalReporter = villageStat.reporter_id.equals(user._id);
                        const hasHighClearance = user_state.clearance_level >= 2;
                        
                        if (isOriginalReporter || hasHighClearance){
                            await db.collection<VillageStat>('village_stats').deleteOne({
                                _id: villageStat._id
                            });
                            
                            res.status(200).json({ message: "Village stat deleted."});
                        }
                        else{
                            res.status(403).json({ message: "Not original reporter or insufficient clearance."});
                        }
                    }
                    else{
                        res.status(500).json({ message: "Corrupted user data."});
                    }
                }
                else{
                    res.status(404).json({ message: "User not found."});
                }
            }
            else{
                res.status(404).json({ message: "Village stat not found."});
            }
            

        }catch(error){
            console.error("Village stat deletion", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
    else{
        res.status(400).json({ 
            message: "Validation error",
            errors: validationResult.error.errors 
        });
    }
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