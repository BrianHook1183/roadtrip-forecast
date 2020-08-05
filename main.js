// ClimaCell api key
let apiKeyCC = 'MmdzZmqejYEWZI7bKBEA2KET3QwqKJJr';

// ClimaCell test endpoint
const ccTestUrl = 'https://api.climacell.co/v3/weather/forecast/daily?apikey=MmdzZmqejYEWZI7bKBEA2KET3QwqKJJr&lat=41.881832&lon=-87.623177&unit_system=us&start_time=now&fields=precipitation,feels_like,precipitation_probability';








function runApp(){
  console.log('runApp was initialized');
  $('.js-fetch').click(e => {
    e.preventDefault();
    console.log('fetch was clicked');

    fetch(ccTestUrl)
    .then(response => response.json())
    .then(responseJson => displayResults(responseJson));
  })
}

function displayResults(responseJson) {
  console.log('displayResults ran');
  console.log(responseJson);
  $('.js-results').removeClass('hide').text('the date of the returned 14 day forecast begins on: ' + responseJson[0].observation_time.value + ' and the chance of rain is: ' + responseJson[0].precipitation_probability.value +  responseJson[0].precipitation_probability.units);
}


$(runApp);