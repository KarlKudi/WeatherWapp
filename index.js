import express, { response } from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';
import {readFile} from 'node:fs';
import countries from './worldcities.json' assert { type: 'json'};

const app = express();
const port = 3000;
let datesTimesAndTemp = {};

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));

function getDayTimeAndTemp(dateList, tempList){
    let list = [];
    for (let index = 0; index < dateList.length; index += 25) {
        list.push(dateList[index].slice(8,10));
    }
    datesTimesAndTemp.dates = list;
    list = [];
    for (let index = 0; index < 10; index++) {
        list.push(`0${index}00`);
    }
    for (let index = 10; index < 24; index++) {
        list.push(`${index}00`);
    }
    datesTimesAndTemp.times = list;
    datesTimesAndTemp.temp = tempList;
    console.log(datesTimesAndTemp);
}

app.get('/',(req,res) =>{
    res.render('index.ejs',{data: datesTimesAndTemp});
});

app.post('/country', (req, res) =>{
    console.log(req.body.myCountry);
    let city = countries.filter((hit) => hit.city === req.body.myCountry);
    city = city[0];
    console.log(city.lat);
    axios({
        method: 'get',
        url: `/forecast?latitude=${city.lat}&longitude=${city.lng}&hourly=temperature_2m`,
        baseURL: 'https://api.open-meteo.com/v1'
    })
    .then(function (response){
        getDayTimeAndTemp(response.data.hourly.time, response.data.hourly.temperature_2m)
        res.render('index.ejs',{data: datesTimesAndTemp});
    });
})

app.listen(port, () =>{
    console.log(`Listening on port ${port}`)
});