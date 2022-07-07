const date = new Date();
const today = convertDateToString(date);
const weeks = ['ПН', 'ВТ', 'СР','ЧТ', 'ПТ', 'СБ', 'ВС'];
const default_colors = {r: 0, g: 0, b: 0, a: 0, hex: '#000000'};

let chosen_date = today;
let chosen_week = getWeek(date);
let data_colors = {};

fetch('data/colors.json').then((answer)=>{
    if (answer.ok){
        answer.json().then((json) =>{
            data_colors = json;
            drawCalendar();
        });
    }
});

function drawCalendar(){
    drawCalendarLeftPart();
    drawCalendarRightPart();
}
function drawCalendarLeftPart(){
    drawWeekHeader();
    let table = document.getElementById('left-table');
    let table_html = '<tbody>';

    for(let i=0; i<7; i++){
        const date_str = chosen_week[i];
        let color = data_colors[date_str] ? convertRgbToHex(data_colors[date_str]) : default_colors.hex;
        table_html += '<tr><td>'+ getSwitcherHtml(date_str) +'</td><td class="table__cell"><div class="table__data">' + weeks[i] + '</div></td>' +
                       '<td class="table__cell"><div class="table__data">' + date_str + '</div></td>' + 
                       '<td><input id="'+ date_str + '"value="'+ color + '"  class="table__data" type="color" onchange="handleColorPicker(\''+ date_str +'\')" /></td>' + '</tr>';
    }
    table_html += '</tbody>';
    table.innerHTML = table_html;
}

function drawCalendarRightPart(){
    drawMonthHeader();
    let arr = chosen_date.split('-');
    let date = new Date(arr[2], arr[1] - 1, 1);
    let html = '<tr>';
    for (let i=0; i<7; i++){
        html += '<th class="table__cell">' + weeks[i] + '</th>'
    }
    html += '</tr>';
    for(let i=0; i<6; i++){
        let week = getWeek(date);
        html += '<tr>';
        for(let w of week){
    
            let style = '';
            let x = data_colors[w];
            if (x && x.a){
                style = ' style="background-color: rgba(' + x.r + ',' + x.g + ','  + x.b + ',' + x.a + '); color: rgb(' + (255 - x.r) + ',' + (255 - x.g) + ','  + (255 - x.b) + ');"'
            }

            let arr2 = w.split('-');
            let off_class = '';
            if (arr[1] !== arr2[1]){
                off_class = ' off';
            }
            html += '<td class="table__cell table__calendar-cell' + off_class + '"' + style + ' onclick="setNewDate(\'' + w + '\')">'+ arr2[0] + '</td>';
        }
        date.setDate(date.getDate() + 7);
        html += '</tr>';
    }
    let elem = document.getElementById('right-table');
    elem.innerHTML = html;
}

function handleColorPicker(id){
    let elem = document.getElementById(id);
    const rgb = convertHexToRgb(elem.value);
    data_colors[id] = {
        r: rgb.r, 
        g: rgb.g,
        b: rgb.b,
        a: data_colors[id] ? data_colors[id].a : default_colors.a
    }
    saveFile('data/colors.json');
    drawCalendarRightPart();
}
function handleSwitcher(date_str){
    if (!data_colors[date_str]){
        data_colors[date_str]={
            r: default_colors.r,
            g: default_colors.g,
            b: default_colors.b,
            a: default_colors.a
        }
    }
    data_colors[date_str].a = 1 - data_colors[date_str].a;
    saveFile('data/colors.json');
    drawCalendarRightPart();
}

function getSwitcherHtml(date_str){
    let checked = data_colors[date_str] ? data_colors[date_str].a : default_colors.a;
    checked = checked ? 'checked' : '';
    return '<label class="switch"><input ' + checked + ' onclick="handleSwitcher(\''+ date_str +'\')" type="checkbox"><span class="slider round"></span></label>';
}

function convertDateToString(date){
    let day = date.getDate();
    let month = date.getMonth() + 1;

    if (day < 10){
        day = '0' + day;
    }
    if (month < 10){
        month = '0' + month;
    }
    return  day + '-' + month + '-' + date.getFullYear();
}

function getWeek(date){
    let day = date.getDay();
    let monday = date.getDate() - day + (day == 0 ? -6 : 1);

    date.setDate(monday);
    let result = [convertDateToString(date)];

    for(let i=1; i<7; i++){
        let next_day = date.getDate() + 1;
        date.setDate(next_day);
        result.push(convertDateToString(date));
    }

    return result;
}

function switchWeek(weekOffset){
    let arr = chosen_date.split('-');
    let day = Number(arr[0]) + weekOffset * 7;
    let month = arr[1] - 1;
    let year = arr[2];

    let date = new Date(year, month, day);
    chosen_date = convertDateToString(date);
    chosen_week = getWeek(date);
    drawCalendar();
}

function switchMonth(monthOffset){
    let arr = chosen_date.split('-');
    let day = arr[0];
    let month = arr[1] - 1 + monthOffset;
    let year = arr[2];

    let date = new Date(year, month, day);
    chosen_date = convertDateToString(date);
    chosen_week = getWeek(date);
    drawCalendar();
}

function convertHexToRgb(hex){ 
    return {
        r: parseInt(hex.slice(1, 3), 16),
        g: parseInt(hex.slice(3, 5), 16),
        b: parseInt(hex.slice(5, 7), 16)
    };
}

function numberToHex(num){
    let hex = num.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function convertRgbToHex(rgb){
    return '#' + numberToHex(rgb.r) + numberToHex(rgb.g) + numberToHex(rgb.b);
}

function drawWeekHeader(){
    const date1 = chosen_week[0].split('-');
    const date2 = chosen_week[6].split('-');    
    const months = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая','Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];
    let elem = document.getElementById('date-header');

    return elem.innerHTML = date1[0] + ' ' + months[date1[1] - 1] + ' — ' + date2[0] + ' ' + months[date2[1] - 1];
}

function drawMonthHeader(){
    const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май','Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    let arr = chosen_date.split('-');
    let mon = arr[1] - 1;
    let year = arr[2];
    let elem = document.getElementById('mon-header');

    return  elem.innerHTML = months[mon] + ' ' + year;
}

function setNewDate(date_str){
    let arr = date_str.split('-');
    let date = new Date(arr[2], arr[1] - 1, arr[0]);
    
    chosen_date = convertDateToString(date);
    chosen_week = getWeek(date);
    drawCalendar();
}

function saveFile(url){
    fetch(url, {method: "POST", headers: {'Content-Type': 'application/json;charset=utf-8'}, body: JSON.stringify(data_colors)});
}