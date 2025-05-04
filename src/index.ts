import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(cors());
app.use(bodyParser.json());


app.get("/", (req, res)=>{
    res.status(200).json({ response: "works" });
});

app.listen(3000, ()=>{
    console.log("Expres server started on port 3000");
});

