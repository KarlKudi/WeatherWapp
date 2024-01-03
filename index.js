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
    //Create an object for each location. Object has 3 properties cityName, latitude and longitude.
    const city = {cityName: row[0], lat: row[1], lng: row[2]};
    data.push(city);
})
.on('end', () => {
    console.log('finished');
})
.on('error', (error) =>{
    console.log(error.message);
});

app.use(express.static('public'));

app.get('/',(req,res) =>{
    res.render('index.ejs');
});

app.listen(port, () =>{
    console.log(`Listening on port ${port}`)
});