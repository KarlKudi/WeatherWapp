import express, { response } from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';
import countries from './worldcities.json' assert { type: 'json'};

const app = express();
const port = 3000;
let data = {};
let averageTempList = [];

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));

//Creates times for each hour of the day.
function getDates(dateList){
    let list = [];
    for (let index = 0; index < dateList.length; index += 25) {
        list.push(dateList[index].slice(8,10));
    };
    data.dates = list;
    list = [];
    for (let index = 0; index < 10; index++) {
        list.push(`0${index}00`);
    };
    for (let index = 10; index < 24; index++) {
        list.push(`${index}00`);
    };
    data.times = list;
};

//Create average temperature for each day of the week
function getDayAverageTemp(tempList){
    let totalTemp = 0;
    for(let i = 0; i < 168; i += 24){ //24 hours in a day, 7 days in a week. 24 x 7 = 168 total temperatures
        for(let y = i; y < i + 24; y += 1){ //want to start counting from the week we're starting at so y = i
            totalTemp += tempList[y]; //add the value at templist[y] to the total temp
        };
        totalTemp = Math.round(totalTemp/24); //divide the total temp by the number of temperatures in a day (24) then round up or down the closest whole number
        averageTempList.push(totalTemp); //push the whole integer to an array, should end up with 7 whole numbers
        totalTemp = 0;
    };
    data.averageTemperatures = averageTempList; //create new object property setting it to list of average temperatures
};

function getAverageWeatherCode(weathercodes){
    let mf = 1;
    let compare = 1;
    let mfNum = 0;
    let list = [];
    for(let i = 0; i < weathercodes.length; i += 24){ //Splits the weatherCodes array into 7 chunks. 1 chunk = 1 day
        for(let j = i; j < i + 24; j++){
            for(let y = j + 1; y < i + 24; y++){
                if(weathercodes[j] === weathercodes[y]){
                    mf += 1;
                }
            };
            if(mf > compare){
                mfNum = weathercodes[j];
                compare = mf;
            };
            mf = 1;
        };
        list.push(mfNum)
        mf = 1;
        compare = 1;
        mfNum = 0;
    };
    data.weathercodes = list;
    console.log(data.weathercodes);
};

app.get('/',(req,res) =>{
    res.render('index.ejs');
});

app.post('/country', (req, res) =>{
    console.log(req.body.myCity);
    let city = countries.filter((hit) => hit.city === req.body.myCity);
    city = city[0];
    axios({
        method: 'get',
        url: `/forecast?latitude=${city.lat}&longitude=${city.lng}&hourly=temperature_2m,weather_code`,
        baseURL: 'https://api.open-meteo.com/v1'
    })
    .then(function (response){
        getDates(response.data.hourly.time);
        getDayAverageTemp(response.data.hourly.temperature_2m);
        getAverageWeatherCode(response.data.hourly.weather_code);
        res.render('index.ejs',{data: data});
    });
});

app.listen(port, () =>{
    console.log(`Listening on port ${port}`);
});