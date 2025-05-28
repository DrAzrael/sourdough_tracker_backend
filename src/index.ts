import * as dotenv from "dotenv";
dotenv.config();

import bcrypt from 'bcryptjs';
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb';
import { User, RegisterRequest, LoginRequest } from "./item.model";
import { checkToken, genToken } from "./auth";
import axios from 'axios';

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
        const { login, password }: LoginRequest = req.body;
        
        if (login || password) {
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
            res.status(400).json({ message: "Login and password are required." });
        }

        
    } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({ message: "Internal server error." });
        }
    });

    app.post('/register', async (req, res) => {
        try {
            const { username, login, password }: RegisterRequest = req.body;
        
        if (username && login && password) {
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
        else{
            res.status(400).json({ message: "All fields are required." });
        }
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Internal server error." });
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

// Protected example endpoint
app.get('/protected', checkToken, (req, res) => {
    res.status(200).json({ 
        message: "You've accessed protected content!",
        user: req.user
    });
});

//data gets
app.get('/villages', async (req, res) => {
    res.status(200).send("list of stats of all village");

});

app.get('/village_stats', async (req, res) => {
    res.status(200).send("list of stats of a specyfic village");
});

app.get('/stat_hisotry', async (req, res) => {
    res.status(200).send("all updates of a specyfic stat for a specyfic village");
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