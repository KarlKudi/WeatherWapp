import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';
import {readFile} from 'node:fs';

const app = express();
const port = 3000;
let datesTimesAndTemp = {};

app.use(express.static('public'));

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
    axios({
        method: 'get',
        url: '/forecast?latitude=51.558&longitude=-1.7812&hourly=temperature_2m',
        baseURL: 'https://api.open-meteo.com/v1'
    })
    .then(function (response){
        getDayTimeAndTemp(response.data.hourly.time, response.data.hourly.temperature_2m)
        res.render('index.ejs',{data: datesTimesAndTemp});
    });
});

app.post('/country')

app.listen(port, () =>{
    console.log(`Listening on port ${port}`)
});