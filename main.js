// TO DO:
// loading phraphic for add to itinerary and Forecast
// handle mispelled locations
// button on each itinerary item to delete
// Clear Itinerary and start new
// adding to itinerary needs to be seperate from setCoordinates



// BUGS:
// can add empty objects to Itinerary array
// required tag not workong for date or city input



// OpenCgeData api key
const apiKeyCage = 'a4e6cc64bbe749ca8ec7aed6282a3091';
// ClimaCell api key
const apiKeyClima = 'MmdzZmqejYEWZI7bKBEA2KET3QwqKJJr';

// Global Variables
let itinerary = [];



function handleForm() {
  $('#js-submit').click(e => {
    e.preventDefault();
      // console.log('addToItinerary was clicked');
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
      console.log('itinerary before geocoding is:');
      // console.log(itinerary);
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
  $('.js-itinerary').html('');
}

function handleItinerary() {
  $('.js-itinerary').on('click', '#js-delete' , e => {
    deleteItineraryItem();
  })
}

function deleteItineraryItem() {
  console.log('deleteItineraryItem was clicked')
  // TO DO: figure out a way to bind each delete button with the index value that it holds in the itinerary array
}

function handleForwardGeocoding(cageCityEncoded, cageStateEncoded) {
    console.log('handleForwardGeocoding ran');
  // test OpenCageData endpoint
  const cageTestUrl = `https://api.opencagedata.com/geocode/v1/json?key=${apiKeyCage}&no_annotations=1&limit=1&q=${cageCityEncoded}%2C%20${cageStateEncoded}&countrycode=us`;
    console.log('the fetched url will be: ' + cageTestUrl);
  fetch(cageTestUrl)
  .then(response => response.json())
  .then(responseJson => setCoordinates(responseJson));
}

function setCoordinates(responseJson) {
  // console.log(responseJson);
  //  limit=1 in endpoint ensures that [0] is the only "results" to access
  const cageDescription = responseJson.results[0].formatted;
  const cageLat = responseJson.results[0].geometry.lat;
  const cageLng = responseJson.results[0].geometry.lng;
    console.log(cageDescription + ' coordinates are: ' + cageLat + ', ' + cageLng);
    // console.log('the itinerary array from inside setCoordinates is: ');
  // push geocoded coordinates into location object
  //  the variable z is only temporary until i put this all into a loop
  const z = itinerary.length-1;
  itinerary[z].itDesc= cageDescription;
  itinerary[z].itLat= cageLat;
  itinerary[z].itLng= cageLng;
    console.log(itinerary);
  $('.js-itinerary').append(`
  <div class="itinerary-object">  
  <button id="js-delete">X</button>
  <h3>${itinerary[z].itCity}</h3>
    <ul>
      <li>Date Range: <strong>${itinerary[z].itStartDate} to ${itinerary[z].itEndDate}</strong></li>
      <li>${itinerary[z].itDesc}</li>
      <li>Coordinates= ${itinerary[z].itLat}, ${itinerary[z].itLng}</li>
    </ul>
  </div>
  `);
}




function fetchForecasts(){
    // console.log('fetchForecasts was initialized');
  $('#js-fetch').click(e => {
    e.preventDefault();
    // console.log('fetch was clicked');
    




    // test endpoint variables
    const startTime = 'now';
    const endTime = '2020-08-08'; // 2020-08-14
    // transform from openCage to Climacell
    const cclat = cageLat;
    const cclon = cageLng;
    // test ClimaCell endpoint
    const ccTestUrl = `https://api.climacell.co/v3/weather/forecast/daily?apikey=${apiKeyClima}&lat=${cclat}&lon=${cclon}&unit_system=us&start_time=${startTime}&end_time=${endTime}&fields=precipitation,feels_like,precipitation_probability,weather_code`;
      console.log('the url to be fetched is: ' + ccTestUrl);
    fetch(ccTestUrl)
    .then(response => response.json())
    .then(responseJson => displayForecast(responseJson));





  })
}

function displayForecast(responseJson) {
    // console.log('displayForecast ran');
    console.log(responseJson);
  for (i=0; i < responseJson?.length; i++) {
    if (!responseJson[i]){
      continue;
    }
  $('.js-results').removeClass('hide').append('<p>On ' + responseJson[i].observation_time.value + ' it will be ' + responseJson[i].weather_code.value + ' with a ' + responseJson[i].precipitation_probability.value +  responseJson[i].precipitation_probability.units + ' chance of precipitation.</p>');
  }
}

$(handleItinerary);
$(handleForm);