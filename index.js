import express, { response } from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';

const app = express();
const port = 3000;
let data;
let lat, lon;

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
}
getDateAndDay();

const getLatLon = (city) => {
    return axios({
        method: 'get',
        url: `/direct?q=${city}&limit=1&appid=847c0921fceffedbb2ec528b8f8755f1`,
        baseURL: 'http://api.openweathermap.org/geo/1.0'
    })
    .then((response)=>{
        lat = response.data[0].lat;
        lon = response.data[0].lon;
    })
}

const getWeatherData = () =>{
    return axios({
        method: 'get',
        url: `/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`,
        baseURL: 'https://api.open-meteo.com/v1'
    })
}

app.get('/',(req,res) =>{
    console.log("route running")
    res.render('index.ejs');
});

app.post('/country', (req, res) =>{
    getLatLon(req.body.myCity)
    .then(() =>{ getWeatherData()
        .then((response) => {
            console.log(response.data.daily.weather_code);
            res.render('index.ejs',{data: data});
        })
    });
});

app.listen(port, () =>{
    console.log(`Listening on port ${port}`);
});