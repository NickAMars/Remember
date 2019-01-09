export const CHECKBOX = "checkbox",
             TEXT     = "text",
             FILE     = "file",
             SELECT   = "select",
             PASSWORD = "password";


//Default data point for testing D3
// export const data = [[0,80],
//                       [100,100],
//                       [200,30],
//                       [300,50],
//                       [400,40],
//                       [500,80]];

  const seven_days = 7*24*1000*60*60;



// enum WEEK {
//   SUN,
//   MON,
//   TUES,
//   WED,
//   THUR,
//   FRID,
//   SAT
// }

// return the date seven days back so i can get the time
export const beginDate = (current_date) =>{
  const year = current_date.getFullYear();
  const month = current_date.getMonth();
  const date = current_date.getDate();
  const current = new Date(year, month, date);
  const milliseconds = new Date(year, month, date) - seven_days;

  return [new Date(milliseconds), current ];
}

// Sun = 0 Sat = 6
// const WEEKDAY = 7;
 // [0,1,2,3,4,5,6]
// export const weekdays = (week_day) =>{ // returns an array
//   const order_week = [];
//   let i = week_day;
//   while(order_week.length < WEEKDAY){
//     order_week.unshift(i);
//     if(i < WEEKDAY-1 ){ // 6
//         i++;
//     }else{
//         i = 0;
//     }
//   }
//
//   // console.log(order_week);
//   // console.log()
// return order_week;
// }

 // {

  // date
  // const year = current.getFullYear();
  // const month = current.getMonth();
  // const date = current.getDate();

  // const past_seven = new Date(current - seven_days);
  // return new Date(current - seven_days);
// }



export const data = [
  {date : new Date(2018, 11, 30), time: 10500 },
  {date : new Date(2019, 0,1), time: 9090 },
  {date : new Date(2019, 0, 2), time: 7000 },
  {date :  new Date(2019, 0, 3), time: 3000 },
  {date : new Date(2019, 0,4), time: 0 },
  {date : new Date(2019, 0,5), time: 9999 },
  {date : new Date(2019, 0,6), time: 6040 }
]
