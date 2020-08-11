// TO DO:
// loading graphic for add to itinerary and Forecast
// handle mispelled locations
// button on each itinerary item to delete
// adding to itinerary needs to be seperate from setCoordinates
// forecast needs to reorder itself by the dates



// BUGS:
// can add empty objects to Itinerary array
// 'required' tag not workong for date or city input
// forecast dates do not make sense



// OpenCgeData api key
const apiKeyCage = 'a4e6cc64bbe749ca8ec7aed6282a3091';
// ClimaCell api key
const apiKeyClima = 'MmdzZmqejYEWZI7bKBEA2KET3QwqKJJr';

// Global Variables
let itinerary = [];



function handleStart() {
  $('#js-start').click( e => {
      // navigation button
    $('.start').addClass('hide');
    $('.setup').removeClass('hide');
  })
}


function handleForm() {
  $('#js-submit').click(e => {
    e.preventDefault();
    //  TO DO: add loading graphic here while coordinate are being retrieved
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
  console.log('the itinerary is now:');
  console.log(itinerary);
  $('.js-itinerary').html('');
  itinerary.forEach((city, z) => {
    $('.js-itinerary').append(`
    <div class="itinerary-object">  
    <button class="js-delete" id="${z}">X</button>
    <h3>${city.itCity}</h3>
      <ul>
        <li>Date Range: <strong>${city.itStartDate} to ${city.itEndDate}</strong></li>
        <li>${city.itDesc}</li>
        <li>Coordinates= ${city.itLat}, ${city.itLng}</li>
      </ul>
    </div>
    `);
  });
}

function handleForecasts() {
  $('#js-fetch').click(e => {
    e.preventDefault();
      // navigation button
    $('.setup').addClass('hide');
    $('.forecast').removeClass('hide');
    //  TO DO: add loading graphic here
    $('.js-results').html('');
    // sorts the itinerary again for forecast
    itinerary.sort((a, b) => {
      return new Date(a.itStartDate) - new Date(b.itStartDate);
    });
    // runs the function fetchForecast on each item in the itinerary array
    itinerary.forEach(fetchForecast);
  })
  $('#js-back').click(e => {
    // navigation button
    $('.setup').removeClass('hide');
    $('.forecast').addClass('hide');
  })
}

// this runs against each itinerary item
function fetchForecast(item, index){
    // console.log('the item city is ' + item.itCity + ' at index: ' + index);
  const climaUrl = `https://api.climacell.co/v3/weather/forecast/daily?apikey=${apiKeyClima}&lat=${item.itLat}&lon=${item.itLng}&unit_system=us&start_time=${item.itStartDate}&end_time=${item.itEndDate}&fields=precipitation,feels_like,precipitation_probability,weather_code`;
    console.log('the url to be fetched is: ' + climaUrl);
  fetch(climaUrl)
  .then(response => response.json())
  .then(responseJson => displayForecast(responseJson, item.itCity));
}

function displayForecast(responseJson, itCity) {
    console.log(responseJson);
  for (i=0; i < responseJson?.length; i++) {
    if (!responseJson[i]){
      continue;
    }
  $('.js-results').removeClass('hide').append('<p>' + itCity + ' on ' + responseJson[i].observation_time.value + '<ul><li>Overview: ' + responseJson[i].weather_code.value + '</li><li>' + responseJson[i].precipitation_probability.value +  responseJson[i].precipitation_probability.units + ' chance of precipitation</li><li>"Feels Like" min/max<ul><li>' + responseJson[i].feels_like[0].min.value + '</li><li>' + responseJson[i].feels_like[1].max.value + '</li></ul></li></p>');
  }
}











$(handleForecasts);
$(handleItinerary);
$(handleForm);
$(handleStart);