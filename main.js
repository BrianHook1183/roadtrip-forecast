// ClimaCell api key
let apiKeyCC = 'MmdzZmqejYEWZI7bKBEA2KET3QwqKJJr';



const startTime = 'now';
const endTime = ''; // 2020-08-14

const lat = '41.881832';
const lon = '-87.623177';

// ClimaCell test endpoint
const ccTestUrl = `https://api.climacell.co/v3/weather/forecast/daily?apikey=${apiKeyCC}&lat=${lat}&lon=${lon}&unit_system=us&start_time=${startTime}&end_time=${endTime}&fields=precipitation,feels_like,precipitation_probability,weather_code`;







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
  for (i=0; i < responseJson?.length; i++) {
    if (!responseJson[i]){
      continue;
    }
  $('.js-results').removeClass('hide').append('<p>On ' + responseJson[i].observation_time.value + ' it will be ' + responseJson[i].weather_code.value + ' with a ' + responseJson[i].precipitation_probability.value +  responseJson[i].precipitation_probability.units + ' chance of precipitation.</p>');
  }
}


$(runApp);