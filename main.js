//  ::::::::Critical TO DOs for submission::::::::::
// add weather pictures. forecast objects should be text on left, picture on the right with overview interpreted into pictures. see if ClimaCell offers anything first
// make forecast display more palatable in general
//  freezing_rain_heavy, freezing_rain, freezing_rain_light, freezing_drizzle, ice_pellets_heavy, ice_pellets, ice_pellets_light, snow_heavy, snow, snow_light, flurries, tstorm, rain_heavy, rain, rain_light, drizzle, fog_light, fog, cloudy, mostly_cloudy, partly_cloudy, mostly_clear, clear

//:::: "Would be nice" TO DOs for submission:::::
// make the transition between itinerary and forecast with a slide animation https://codeconvey.com/css-transition-slide-down-slide-up/
// most buttons should stay fixed to viewport so they are always accessible
// link to local events w/ eventful API
// I commented out all date adjustment functionality and removed date range from API call for now. Full 14 day forecast is being fetched for each city, and the displayForecast filters out uneeded days. Would be nice to bring back the limits if i can.

// ::::BUGS:::::





// ****Global Variables*****

// ClimaCell's API is inconsistent with returning the requested date range, these variables will adjust the user inputted dates in the background for the fetch.
// startDate can not be adjusted more than endDate or else for a 1 day forecast you will have an invalid call to the API. checkAdjustments(); will fix this automatically
// let adjustStartDate = 0;
// let adjustEndDate = 0;
// OpenCgeData api key
const apiKeyCage = 'a4e6cc64bbe749ca8ec7aed6282a3091';
// ClimaCell api key
const apiKeyClima = 'MmdzZmqejYEWZI7bKBEA2KET3QwqKJJr';
let itinerary = [];
// Dates
Date.prototype.addDays = function(days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}
Date.prototype.toDateInputValue = (function() {
  var date = new Date(this);
  date.setMinutes(this.getMinutes() - this.getTimezoneOffset());
  return date.toJSON().slice(0,10);
});
// ClimaCell api is limited to 14 day forecast. to restrict error, date picker limit is also set to 14 days from now. To change, modify value in addDays function
let today14 = new Date().addDays(14).toDateInputValue();
let today = new Date().toDateInputValue();



function handleStart() {
  $('#js-start').click( e => {
    // navigation button
    $('.start').addClass('hide');
    insertDateLimits();
    $('.setup').removeClass('hide');
  })
}

function insertDateLimits() {
  $('input[type="date"]').attr('min', today);
  $('input[type="date"]').attr('max', today14);
  // sets the datepicker display for minimum date for departure to be >= than arrival date. 
  $('#js-dep-date').click( e => {
    const  activeArrivalDate = $('#js-arr-date').val();
    console.log('js-dep-date clicked and the activeArrivalDate is: ' + activeArrivalDate);
    $('#js-dep-date').attr('min', activeArrivalDate);
  });
}

function handleForm() {
  $('#js-reset').click(e => {
    resetItinerary();
  })
  $('.js-submit').click(e => {
    e.preventDefault();
    const cageCity = $('#js-city').val();
    const cageCityEncoded = encodeURIComponent(cageCity);
    // checkAdjustments();
    const startDate = $('#js-arr-date').val();
    // const startYear = startDate.slice(0, 4);
    const startMonth = startDate.slice(5, 7);
    const startDay = startDate.slice(8, 10);
    // const startDateAdj = new Date(startYear, startMonth-1, startDay).addDays(adjustStartDate).toDateInputValue();
    const endDate = $('#js-dep-date').val();
    // const endYear = endDate.slice(0, 4);
    const endMonth = endDate.slice(5, 7);
    const endDay = endDate.slice(8, 10);
    // const endDateAdj = new Date(endYear, endMonth-1, endDay).addDays(adjustEndDate).toDateInputValue();
    // console.log('startDate: ' + startDate + ' adjusted: ' + startDateAdj + ' endDate: ' + endDate + ' adjusted: ' + endDateAdj);
    // Prevents from going any further if a required form input is missing
    if (!cageCity || !startDate || !endDate){
      alert("Missing required field!!");
      return;
    }
    //   loading graphic while coordinate are being retrieved
    $('.js-itinerary').html('<div id="js-loading1"><p>loading...</p><img src="assets/loading.svg"></div>');
    const locationObject = 
    {
      'itCity': cageCity,
      'itCityEnc': cageCityEncoded,
      'itStartDate': startDate,
      // 'itStartDateAdj': startDateAdj,
      'itEndDate': endDate,
      // 'itEndDateAdj': endDateAdj,
      'itStartMonth': startMonth,
      'itStartDay': startDay,
      'itEndMonth': endMonth,
      'itEndDay': endDay
    };
    forwardGeocoding(locationObject);
  })
}

// removes possiblity tha the start date will be moved ahead of the end date
// function checkAdjustments() {
//   console.log(adjustEndDate);
//   if (adjustStartDate > adjustEndDate) {
//     adjustEndDate = adjustStartDate;
//     console.log(adjustEndDate);
//   };
// }

function clearForm() {
  $('#js-city').val('');
  $('#js-arr-date').val('');
  $('#js-dep-date').val('');
}

function forwardGeocoding(locationObject) {
  const cageUrl = `https://api.opencagedata.com/geocode/v1/json?key=${apiKeyCage}&no_annotations=1&limit=1&q=${locationObject.itCityEnc}&countrycode=us`;
  // console.log('the geocoding fetched url will be: ' + cageUrl);
  fetch(cageUrl)
  .then(response => {
    if (response.ok) {
      return response.json();
    }
    throw new Error(response.statusText);
  })
  .then(responseJson => setCoordinates(responseJson, locationObject))
  .catch(err => {
    // $('#js-error-message').text(`Something went wrong: ${err.message}`);
    alert(`Invalid location: check spelling`);
    // hides loading graphic while user fixes location input
  });
}

function setCoordinates(responseJson, locationObject) {
  //  limit=1 in endpoint ensures that [0] is the only "results" to access
  const cageDescription = responseJson.results[0].formatted;
  const cageLat = responseJson.results[0].geometry.lat;
  const cageLng = responseJson.results[0].geometry.lng;
  // console.log(cageDescription + ' coordinates are: ' + cageLat + ', ' + cageLng);
  // removes ", United States of America" from each returned location
  locationObject.itDesc= cageDescription.split(",", 2);
  locationObject.itLat= cageLat;
  locationObject.itLng= cageLng;
  // push final form of locationObject into the global itinerary
  itinerary.push(locationObject);
  displayItinerary();
}

function displayItinerary() {
  //  reorders the itinerary array to start with the soonest END date
  itinerary.sort((a, b) => {
    return new Date(a.itEndDate) - new Date(b.itEndDate);
  });
  console.log(itinerary);
  $('.js-itinerary').html('');
  itinerary.forEach((city, z) => {
    $('.js-itinerary').append(`
    <div class="itinerary-object">
      <div class="stop-header">
        <button class="js-delete x" id="${z}">X</button>
        <h4>${city.itDesc}</h4>
      </div>
      <div class="stop-duration">
        <span><strong>${city.itStartMonth}/${city.itStartDay}</strong>:Arrive -</span><span>- Depart: <strong> ${city.itEndMonth}/${city.itEndDay}</strong></span>
      </div>
    </div>
    `);
  });
  // Hide loading graphic after itinerary has displayed
  $('#js-loading1').addClass('hide');
  // unblue the Itinerary Heading
  $('.js-intinerary-title').removeClass('blur');
  // reveal forecast buton
  $('.js-fetch').removeClass('hide');
  clearForm();
}

function resetItinerary() {
  itinerary = [];
  displayItinerary();
  $('.js-fetch').addClass('hide');
  $('.js-intinerary-title').addClass('blur');
}

function handleItinerary() {
  $('.js-itinerary').on('click', '.js-delete' , e => {
    console.log(itinerary);
    deleteItineraryItem(e.target.id);
  })
}

function deleteItineraryItem(buttonId) {
  console.log('deleteItineraryItem was clicked for button id: ' + buttonId);
  // TO DO: figure out a way to bind each delete button with the index value that it holds in the itinerary array
  itinerary.splice(buttonId, 1);
  displayItinerary();
  console.log(itinerary);
}

function handleForecasts() {
  $('.js-fetch').click(e => {
    e.preventDefault();
      // navigation button
    $('.setup').addClass('hide');
    $('.forecast').removeClass('hide');
    //  loading graphic while forecast loads
    $('.js-results').removeClass('hide').html('<div id="js-loading2"><p>loading...</p><img src="assets/loading.svg"></div>');
    // '...' = spread operator. ensures that the global version of itinerary is unchanged outside of this function
    populateForecastStop([...itinerary]);
  })
  $('#js-back').click(e => {
    // navigation button
    $('.setup').removeClass('hide');
    $('.forecast').addClass('hide');
  })
}

// Recursively populating forecast. (instead of  itinerary.forEach(fetchForecast);)
function populateForecastStop(itinerary) {
  // base case
  if (itinerary.length === 0){
    return;
  }
  // .shift() is acting as a -- incrementer, if this were a loop, the base case above is the condition to stop running the loop.
  // Temporarily removed &start_time=${item.itStartDateAdj}&end_time=${item.itEndDateAdj} from fetch because API is hisbehaving.
  item = itinerary.shift();
  const climaUrl = `https://api.climacell.co/v3/weather/forecast/daily?apikey=${apiKeyClima}&lat=${item.itLat}&lon=${item.itLng}&start_time=now&unit_system=us&fields=precipitation,feels_like,precipitation_probability,weather_code`;
    console.log('the url to be fetched is: ' + climaUrl);
  fetch(climaUrl)
  .then(response => response.json())
  .then(responseJson => {
    displayForecast(responseJson, item.itDesc, item.itStartDate, item.itEndDate);
    // calls itself as part of recursion
    populateForecastStop(itinerary);
  });
}

function displayForecast(responseJson, itDesc, itStartDate, itEndDate) {
  for (i=0; i < responseJson?.length; i++) {
    if (!responseJson[i]){
      continue;
    }
    // Filters out the unwanted days that are supplied by forecast API either inherently or from adjustment on user date range
    if (responseJson[i].observation_time.value >= itStartDate && responseJson[i].observation_time.value <= itEndDate){
        const uglyWeatherCode = responseJson[i].weather_code.value;
        const betterWeatherCode = uglyWeatherCode.replace("_", " ");
        // credit to https://attacomsian.com/blog/string-capitalize-javascript
        const prettyWeatherCode = betterWeatherCode.replace(/\b\w/g, c => c.toUpperCase());
      $('.js-results').append('<div class="forecast-pair"><div class="forecast-text"><h3>' + itDesc + '<br>' + responseJson[i].observation_time.value.slice(5, 10) + '</h3><ul><li>Overview: <strong>' + prettyWeatherCode + '</strong></li><li>' + responseJson[i].precipitation_probability.value +  responseJson[i].precipitation_probability.units + ' chance of precipitation</li><li>"Feels Like" temperature:</li><ul><li>min: ' + responseJson[i].feels_like[0].min.value + ' &#8457;</li><li>max: ' + responseJson[i].feels_like[1].max.value + ' &#8457;</li></ul></ul></div><div class="forecast-picture"><img src="assets/sample.jpg"></div></div><hr>');
    };
  }
  // Hide loading graphic after forecast has displayed
   $('#js-loading2').addClass('hide');
}

$(handleForecasts);
$(handleItinerary);
$(handleForm);
$(handleStart);