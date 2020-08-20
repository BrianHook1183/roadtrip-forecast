// ****Global Variables*****
// OpenCgeData api key
const apiKeyCage = 'a4e6cc64bbe749ca8ec7aed6282a3091';
// ClimaCell api key
const apiKeyClima = 'MmdzZmqejYEWZI7bKBEA2KET3QwqKJJr';
let weatherTextImages = [
  {
    'code': 'freezing_rain_heavy',
    'codePretty': 'Heavy Freezing Rain',
    'codeImage': 'heavy-freezing-rain.jpg'
  },
  {
    'code': 'freezing_rain',
    'codePretty': 'Freezing Rain',
    'codeImage': 'freezing-rain.jpg'
  },
  {
    'code': 'freezing_rain_light',
    'codePretty': 'Freezing Light Rain',
    'codeImage': 'light-freezing-rain.jpg'
  },
  {
    'code': 'freezing_drizzle',
    'codePretty': 'Freezing Drizzle',
    'codeImage': 'light-freezing-rain.jpg'
  },
  {
    'code': 'snow',
    'codePretty': 'Snow',
    'codeImage': 'snow.jpg'
  },
  {
    'code': 'snow_heavy',
    'codePretty': 'Heavy Snow',
    'codeImage': 'snow.jpg'
  },
  {
    'code': 'snow_light',
    'codePretty': 'Light Snow',
    'codeImage': 'light-snow.jpg'
  },
  {
    'code': 'flurries',
    'codePretty': 'Flurries',
    'codeImage': 'flurries.jpg'
  },
  {
    'code': 'ice_pellets_heavy',
    'codePretty': 'Heavy Ice Pellets',
    'codeImage': 'hail.jpg'
  },
  {
    'code': 'ice_pellets',
    'codePretty': 'Ice Pellets',
    'codeImage': 'hail.jpg'
  },
  {
    'code': 'ice_pellets_light',
    'codePretty': 'Light Ice Pellets',
    'codeImage': 'hail.jpg'
  },
  {
    'code': 'tstorm',
    'codePretty': 'Thunderstorm',
    'codeImage': 'tstorm.jpg'
  },
  {
    'code': 'rain_heavy',
    'codePretty': 'Heavy Rain',
    'codeImage': 'heavy-rain.jpg'
  },
  {
    'code': 'rain',
    'codePretty': 'Rain',
    'codeImage': 'rain.jpg'
  },
  {
    'code': 'rain_light',
    'codePretty': 'Light Rain',
    'codeImage': 'light-rain.jpg'
  },
  {
    'code': 'drizzle',
    'codePretty': 'Drizzle',
    'codeImage': 'light-rain.jpg'
  },
  {
    'code': 'fog_light',
    'codePretty': 'Light Fog',
    'codeImage': 'light-fog.jpg'
  },
  {
    'code': 'fog',
    'codePretty': 'Fog',
    'codeImage': 'fog.jpg'
  },
  {
    'code': 'cloudy',
    'codePretty': 'Cloudy',
    'codeImage': 'cloudy.jpg'
  },
  {
    'code': 'mostly_cloudy',
    'codePretty': 'Mostly Cloudy',
    'codeImage': 'mostly-cloudy.jpg'
  },
  {
    'code': 'partly_cloudy',
    'codePretty': 'Partly Cloudy',
    'codeImage': 'partly-cloudy.jpg'
  },
  {
    'code': 'clear',
    'codePretty': 'Clear',
    'codeImage': 'clear.jpg'
  },
  {
    'code': 'mostly_clear',
    'codePretty': 'Mostly Clear',
    'codeImage': 'mostly-clear.jpg'
  }
];
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
    $('.start').slideUp();
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
    const startDate = $('#js-arr-date').val();
    const startMonth = startDate.slice(5, 7);
    const startDay = startDate.slice(8, 10);
    const endDate = $('#js-dep-date').val();
    const endMonth = endDate.slice(5, 7);
    const endDay = endDate.slice(8, 10);
    // Prevents from going any further if a required form input is missing (required attribut doesn't work on html form)
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
      'itEndDate': endDate,
      'itStartMonth': startMonth,
      'itStartDay': startDay,
      'itEndMonth': endMonth,
      'itEndDay': endDay
    };
    forwardGeocoding(locationObject);
  })
}

function forwardGeocoding(locationObject) {
  const cageUrl = `https://api.opencagedata.com/geocode/v1/json?key=${apiKeyCage}&no_annotations=1&limit=1&q=${locationObject.itCityEnc}&countrycode=us`;
  fetch(cageUrl)
  .then(response => {
    if (response.ok) {
      return response.json();
    }
    throw new Error(response.statusText);
  })
  .then(responseJson => setCoordinates(responseJson, locationObject))
  .catch(err => {
    alert(`Invalid location: check spelling`);
    // hides loading graphic while user fixes location input
    $('#js-loading1').addClass('hide');
  });
}

function setCoordinates(responseJson, locationObject) {
  //  limit=1 in endpoint url ensures that [0] is the only "results" to access
  const cageDescription = responseJson.results[0].formatted;
  const cageLat = responseJson.results[0].geometry.lat;
  const cageLng = responseJson.results[0].geometry.lng;
  // removes ", United States of America" from each returned location
  locationObject.itDesc= cageDescription.split(",", 2);
  locationObject.itLat= cageLat;
  locationObject.itLng= cageLng;
  itinerary.push(locationObject);
  displayItinerary();
}

function displayItinerary() {
  //  reorders the itinerary array to start with the soonest END date
  itinerary.sort((a, b) => {
    return new Date(a.itEndDate) - new Date(b.itEndDate);
  });
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
      $('#js-loading1').addClass('hide');
      $('.js-intinerary-title').removeClass('blur');
      $('.js-fetch').removeClass('hide');
      clearForm();
    }
    
function clearForm() {
  $('#js-city').val('');
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
    deleteItineraryItem(e.target.id);
  })
}

function deleteItineraryItem(buttonId) {
  if (itinerary.length === 1) {
    resetItinerary();
    return;
  }
  itinerary.splice(buttonId, 1);
  displayItinerary();
}

function handleForecasts() {
  $('.js-fetch').click(e => {
    e.preventDefault();
      // navigation button
    $('.setup').slideUp();
    $('.forecast').removeClass('hide');
    //  loading graphic while forecast loads
    $('.js-results').removeClass('hide').html('<div id="js-loading2"><p>loading...</p><img src="assets/loading.svg"></div>');
    // '...' = spread operator. ensures that the global version of itinerary is unchanged outside of this function
    populateForecastStop([...itinerary]);
  })
  $('#js-back').click(e => {
    $('.setup').slideDown();
    $('.forecast').addClass('hide');
  })
}

function populateForecastStop(itinerary) {
  if (itinerary.length === 0){
    return;
  }
  item = itinerary.shift();
  const climaUrl = `https://api.climacell.co/v3/weather/forecast/daily?apikey=${apiKeyClima}&lat=${item.itLat}&lon=${item.itLng}&start_time=now&unit_system=us&fields=precipitation,feels_like,precipitation_probability,weather_code`;
  fetch(climaUrl)
  .then(response => response.json())
  .then(responseJson => {
    displayForecast(responseJson, item.itDesc, item.itStartDate, item.itEndDate);
    populateForecastStop(itinerary);
  });
}

function displayForecast(responseJson, itDesc, itStartDate, itEndDate) {
  for (i=0; i < responseJson?.length; i++) {
    if (!responseJson[i]){
      continue;
    }
    // Filters out the unwanted days that are supplied by forecast API
    if (responseJson[i].observation_time.value >= itStartDate && responseJson[i].observation_time.value <= itEndDate){
      const weatherCode = responseJson[i].weather_code.value;
      // default for if there is no code match
      let weatherObject = {'code': weatherCode,
                          'codePretty': weatherCode.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase()),
                          'codeImage': 'unknown.png',
                          'codeImageAlt': 'default image for unknown weather forecast'};
      // grabs pretty weather code and image
      for (item of weatherTextImages) {
        if (weatherCode === item.code){
          weatherObject = item;
        };
      };
      // overwrites default weatherObject if code match was found
      const weatherImage = weatherObject.codeImage;
      const weatherText = weatherObject.codePretty;
      const weatherImageAlt = weatherObject.codePretty;
      // adds completed forecast for each day into the DOM
      $('.js-results').append('<div class="forecast-pair"><div class="forecast-text"><ul><li>Overview: <strong>' + weatherText + '</strong></li><li>' + responseJson[i].precipitation_probability.value +  responseJson[i].precipitation_probability.units + ' chance of precipitation</li><li>"Feels Like" temperature:</li><ul><li>min: ' + responseJson[i].feels_like[0].min.value + ' &#8457;</li><li>max: ' + responseJson[i].feels_like[1].max.value + ' &#8457;</li></ul></ul></div><div class="forecast-picture"><img src="assets/' + weatherImage + '" alt="' + weatherImageAlt + '"><div class="hover-text"><h3>' + itDesc + '<br>' + responseJson[i].observation_time.value.slice(5, 10) + '</h3></div></div></div><hr>');
    };
  }
  // Hide loading graphic after forecast has displayed
   $('#js-loading2').addClass('hide');
}

$(handleForecasts);
$(handleItinerary);
$(handleForm);
$(handleStart);