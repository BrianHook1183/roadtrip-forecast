     // FeaturesTO DOs:

// add weather pictures. forecast objects should be text on left, picture on the right with overview interpreted into pictures. 
// Save / reload 

     
     // BUGS:
// forecast needs to reorder itself by the dates
// fetched forecast dates do not make sense - you get the day before the starting date
//  The order of the forecast changes every time you generate it.
     
     // Improvement TO DOs:
// handle mispelled locations
// compare previous itinerary (if there is one) to the new itinerary and if same, dont generate new forecast, just move to it. If itinerary has changed then generate a new forecast.
// add alert if arrival date is after departure date because API is going to return an error anyways. i could add the min attribute to the departure date picker by using the value the user enters into the arrival date
// disable adding empty objects to Itinerary array because if you add an empty city/state/dates to itinerary it indefinitely loads
// 'required' tag not workong for date or city input
//  most buttons should stay fixed to viewport so they are always accessible
// use this city look up for auto complete/validation, also has coordinates https://geobytes.com/free-ajax-cities-jsonp-api/



// OpenCgeData api key
const apiKeyCage = 'a4e6cc64bbe749ca8ec7aed6282a3091';
// ClimaCell api key
const apiKeyClima = 'MmdzZmqejYEWZI7bKBEA2KET3QwqKJJr';

// Global Variables
let itinerary = [];
let testArray = [];

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
    insertDate();
    $('.setup').removeClass('hide');
  })
}

function insertDate() {
  $('input[type="date"]').attr('min', today);
  $('input[type="date"]').attr('max', today14);
}

function handleForm() {
  $('.js-submit').click(e => {
    e.preventDefault();
    //   loading graphic while coordinate are being retrieved
    $('.js-itinerary').html('<div id="js-loading1"><p>loading...</p><img src="assets/loading.svg"></div>');
    const cageCity = $('#js-city').val();
    const cageCityEncoded = encodeURIComponent(cageCity);
    const cageState = $('#js-state').val();
    const cageStateEncoded = encodeURIComponent(cageState);
    const startDate = $('#js-arr-date').val();
    const endDate = $('#js-dep-date').val();
    console.log('city is ' + cageCity + ' and state is ' + cageState + ' and the date range is ' + startDate + ' to ' + endDate);
    const locationObject = 
    {
      'itCity': cageCity,
      'itState': cageState,
      'itCityEnc': cageCityEncoded,
      'itStateEnc': cageStateEncoded,
      'itStartDate': startDate,
      'itEndDate': endDate
    };
    itinerary.push(locationObject);
    clearForm();
    handleForwardGeocoding(cageCityEncoded, cageStateEncoded);
  })
  $('#js-reset').click(e => {
    resetItinerary();
  })
}

function clearForm() {
  $('#js-city').val('');
  $('#js-state').val('');
  $('#js-arr-date').val('');
  $('#js-dep-date').val('');
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

function handleForwardGeocoding(cageCityEncoded, cageStateEncoded) {
  const cageUrl = `https://api.opencagedata.com/geocode/v1/json?key=${apiKeyCage}&no_annotations=1&limit=1&q=${cageCityEncoded}%2C%20${cageStateEncoded}&countrycode=us`;
  // console.log('the geocoding fetched url will be: ' + cageUrl);
  fetch(cageUrl)
  .then(response => response.json())
  .then(responseJson => setCoordinates(responseJson));
}

function setCoordinates(responseJson) {
  //  limit=1 in endpoint ensures that [0] is the only "results" to access
  const cageDescription = responseJson.results[0].formatted;
  const cageLat = responseJson.results[0].geometry.lat;
  const cageLng = responseJson.results[0].geometry.lng;
  // console.log(cageDescription + ' coordinates are: ' + cageLat + ', ' + cageLng);
  // console.log('the itinerary array from inside setCoordinates is: ');
  // push geocoded coordinates into location object
  //  the variable z is only temporary until i put this all into a loop
  const z = itinerary.length-1;
  itinerary[z].itDesc= cageDescription;
  itinerary[z].itLat= cageLat;
  itinerary[z].itLng= cageLng;
  displayItinerary();
}

function displayItinerary() {
  itinerary.sort((a, b) => {
    return new Date(a.itStartDate) - new Date(b.itStartDate);
  });
  console.log(itinerary);
  $('.js-itinerary').html('');
  itinerary.forEach((city, z) => {
    $('.js-itinerary').append(`
    <div class="itinerary-object">  
      <button class="js-delete" id="${z}">X</button>
      <h3>${city.itCity}</h3>
      <ul>
        <li>Dates: <strong>${city.itStartDate} to ${city.itEndDate}</strong></li>
        <li>${city.itDesc}</li>
      </ul>
    </div>
    `);
  });
  // Hide loading graphic after itinerary has displayed
  $('#js-loading1').addClass('hide');
  // unblue the Itinerary Heading
  $('.js-intinerary-title').removeClass('blur');
  // reveal forecast buton
  $('.js-fetch').removeClass('hide');
}

function handleForecasts() {
  $('.js-fetch').click(e => {
    e.preventDefault();
    testArray = [];
      // navigation button
    $('.setup').addClass('hide');
    $('.forecast').removeClass('hide');
    //  loading graphic while forecast loads
    $('.js-results').removeClass('hide').html('<div id="js-loading2"><p>loading...</p><img src="assets/loading.svg"></div>');
    // sorts the itinerary again for forecast but NOT WORKING
    // itinerary.sort((a, b) => {
    //   return new Date(a.itStartDate) - new Date(b.itStartDate);
    // });
    // runs the function fetchForecast on each item in the itinerary array

    // '...' = spread operator. ensures that the global version of itinerary is unchanged outside of this function
    populateForecastStop([...itinerary]);
    // itinerary.forEach(fetchForecast);
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
  // .shit() is acting as a -- incrementer, if this were a loop, the base case above is the condition to stop running the loop.
  item = itinerary.shift();
  const climaUrl = `https://api.climacell.co/v3/weather/forecast/daily?apikey=${apiKeyClima}&lat=${item.itLat}&lon=${item.itLng}&unit_system=us&start_time=${item.itStartDate}&end_time=${item.itEndDate}&fields=precipitation,feels_like,precipitation_probability,weather_code`;
    console.log('the url to be fetched is: ' + climaUrl);
  fetch(climaUrl)
  .then(response => response.json())
  .then(responseJson => {
    displayForecast(responseJson, item.itCity, item.itStartDate);
    populateForecastStop(itinerary);
  });
}

function displayForecast(responseJson, itCity, itStartDate) {
    // TO DO: only pass if (dateinjson matches datefromitinerary) but need these variables first
  for (i=0; i < responseJson?.length; i++) {
    if (!responseJson[i]){
      continue;
    }
    // Filters out the unwanted previous day that is supplied by forecast API
    if (responseJson[i].observation_time.value >= itStartDate){
  $('.js-results').append('<ul><li><strong>' + itCity + '</strong> on <strong>' + responseJson[i].observation_time.value + '</strong></li><ul><li>Overview: ' + responseJson[i].weather_code.value + '</li><li>' + responseJson[i].precipitation_probability.value +  responseJson[i].precipitation_probability.units + ' chance of precipitation</li><li>"Feels Like" temperature</li><ul><li>min: ' + responseJson[i].feels_like[0].min.value + ' &#8457;</li><li>max: ' + responseJson[i].feels_like[1].max.value + ' &#8457;</li></ul></ul></ul>');
    };
  }
  // Hide loading graphic after forecast has displayed
   $('#js-loading2').addClass('hide');
}











$(handleForecasts);
$(handleItinerary);
$(handleForm);
$(handleStart);