// const express = require('express')// This works synchronously, It's a common JS used with old Node JS
// OR
import express from 'express' // This works asynchronously. It'sa  module JS used with ES6+
import cors from 'cors';
import bodyParser from 'body-parser';
import 'dotenv/config';
import {emailRoute} from './routes/emailRoute.js';
import { resumeRoute } from './routes/resumeRoute.js';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Use of Express: serve when requests(GET,POST) comes and route them to Database, and lsiten them, and return response.
// Here listening to a get request, and returning the response fetched to client.
// there is a callback route -> '/' OR '/getRequest/1', and in browser we select this route, and we hit this API call
app.get('/', (req, res) => {
    res.send(req.body);
});

app.post('/uploadResume', (req, res) => {
    resumeRoute(req, res);   
    
});

app.post('/excelUpload',(req,res) => {
    emailRoute(req,res);
    res.sendStatus(200);
})

const port = process.env.PORT || 3001;// Either get the Environment variable in production level Server, or run the default port
// Now listening to the new port created
app.listen(port, () => {
    console.log(`Serve at https://expressflash.netlify.app/:${port}`);
})