import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';
import { parse } from 'csv-parse';
import fs from 'fs';

const app = express();
const port = 3000;
const data = [];
const parser = parse({
    delimiter: ','
});

fs.createReadStream('./worldcities.csv')
.pipe(parse({delimiter: ',', from_line: 2}))
.on('data', (row) =>{
    data.push(row);
})
.on('end', () => {
    console.log('finished');
    console.log(data);
})
.on('error', (error) =>{
    console.log(error.message);
});

app.use(express.static('public'));

app.get('/',(req,res) =>{
    
});

app.listen(port, () =>{
    console.log(`Listening on port ${port}`)
});