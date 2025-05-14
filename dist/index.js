"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const mongodb_1 = require("mongodb");
console.log("MONGODB_URI:", process.env.MONGODB_URI);
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
const client = new mongodb_1.MongoClient(process.env.MONGODB_URI, {
    serverApi: {
        version: mongodb_1.ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).send("works");
}));
app.get('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).send("works");
}));
app.get('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).send("works");
}));
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
app.listen(3000, () => {
    console.log("Expres server started on port 3000");
    console.log("http:localhost:3000");
});
