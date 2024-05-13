import express, { response } from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';
import { readFile } from 'fs/promises';
import countries from './worldcities.json' assert { type: 'json'};
import world from './world.json' assert {type:'json'};

const app = express();
const port = 3000;
const json = JSON.parse(
    await readFile(
        new URL('./world.json', import.meta.url)
    )
);
let data = {};

// Testing git fetch

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));

//Creates times for each hour of the day.
// function getDates(dateList){
//     let list = [];
//     for (let index = 0; index < dateList.length; index += 25) {
//         list.push(dateList[index].slice(8,10));
//     };
//     data.dates = list;
//     list = [];
//     for (let index = 0; index < 10; index++) {
//         list.push(`0${index}00`);
//     };
//     for (let index = 10; index < 24; index++) {
//         list.push(`${index}00`);
//     };
    
//     data.times = list;
//     console.log(list)
//     return data;
// };

function getDateAndDay(){
    const d = new Date(); //get todays date
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let weekOrder = [];
    let weekDates = [];
    let reset = d.getDay(); //variable for once Saturday is reach in weekDays array. Reset the week in for loop
    let iterator = 0; // variable to start from Sunday once Saturday has been reached in for loop
    let maxDay; // is set in switch statement depending on month of the year. maxDay is set to 31 for 0 "January"
    let maxDayMet = false; //When for loop reachs the maxday this is turned to true
    let newMonth = 1; //Variable used to create first day of the month and so on

    //Switch statement to set maxDay based on month of the year January being 0
    switch (d.getMonth()) {
        case 0:
            maxDay = 31;
            break;
        case 1:
            //If statement to account for leap year
            if(d.getFullYear() % 4 === 0){
                maxDay = 29;
                break;
            }else{
                maxDay = 28;
            };
        case 2:
            maxDay = 31;
            break;
        case 3:
            maxDay = 30;
            break;
        case 4:
            maxDay = 31;
            break;
        case 5:
            maxDay = 30;
            break;
        case 6:
            maxDay = 31;
            break;
        case 7:
            maxDay = 31;
            break;
        case 8:
            maxDay = 30;
            break;
        case 9:
            maxDay = 31;
            break;
        case 10:
            maxDay = 30;
            break;
        case 11:
            maxDay = 31;
            break;
        default:
            break;
    }

    //for loop to create weekOrder Mon,Tue,Wed and create the dates
    for(let i = 0; i < 8; i++){
        if (maxDayMet && reset < 7){
            weekOrder.push(weekDays[d.getDay() + i]);
            weekDates.push(newMonth);
            newMonth++;

            reset++;
        }else if(maxDayMet){
            weekOrder.push(weekDays[iterator]);
            weekDates.push(newMonth);
            newMonth++;
            iterator++;
        }
        else if(reset < 7){
            weekOrder.push(weekDays[d.getDay() + i]);
            weekDates.push(d.getDate() + i);
            reset++;
            if(d.getDate() + i === maxDay){
                maxDayMet = true;
            }
        }else{
            weekOrder.push(weekDays[iterator]);
            weekDates.push(d.getDate() + i);
            iterator++;
            if(d.getDate() + i === maxDay){
                maxDayMet = true;
            }
        }
    };
    console.log(weekOrder);
    console.log(weekDates)
}
getDateAndDay();

//Create average temperature for each day of the week
function getDayAverageTemp(tempList){
    let averageTempList = [];
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
    return data;
};

function getAverageWeatherCode(weathercodes){
    let mf = 1;
    let compare = 1;
    let mfNum = 0;
    let list = [];
    for(let i = 0; i < weathercodes.length; i += 24){ //Splits the weatherCodes array into 7 chunks. 1 chunk = 1 day
        for(let j = i; j < i + 24; j++){ // Selects value in array to compare
            for(let y = j + 1; y < i + 24; y++){ // Compares selected value to all the values after it in array
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
    return data.weathercodes = list;
};

app.get('/',(req,res) =>{
    res.render('index.ejs');
});

app.post('/country', (req, res) =>{
    let city = countries.filter((hit) => hit.city === req.body.myCity);
    city = city[0];
    axios({
        method: 'get',
        url: `/forecast?latitude=${city.lat}&longitude=${city.lng}&hourly=temperature_2m,weather_code`,
        baseURL: 'https://api.open-meteo.com/v1'
    })
    .then(function (response){
        // getDates(response.data.hourly.time);
        getDayAverageTemp(response.data.hourly.temperature_2m);
        getAverageWeatherCode(response.data.hourly.weather_code);
        res.render('index.ejs',{data: data});
    });
});

app.listen(port, () =>{
    console.log(`Listening on port ${port}`);
});