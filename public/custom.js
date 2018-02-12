var global = window;
$(function() {
  geoFindMe();

  function geoFindMe() {
    if (!navigator.geolocation) {
      return;
    }

    function success(position) {
      var latitude = position.coords.latitude;
      var longitude = position.coords.longitude;
      /*var url = "http://api.openweathermap.org/data/2.5/weather?";
      url += "lat=" + latitude + "&lon=" + longitude;
      url += "&appid=" + "c70c5ac97a18eb662b3a997d864e38dc";*/
      var key = 'YjI2N2FkNjM1YjBjYzA5YQ==';
      var url = "https://api.wunderground.com/api/"+ atob(key) +"/forecast/geolookup/conditions/lang:EN/q/" + latitude + "," + longitude + ".json";

      jQuery.ajax({
        url: url,
        success: function(result) {
          r = result.current_observation;
          $('#location').text(r.display_location.city);
         // $('#sunrise').text("Sunrise: " + global.convert('unixTimeStampToAMPM', r.sys.sunrise));
         // $('#sunset').text("Sunset: " + global.convert('unixTimeStampToAMPM', r.sys.sunset));
          if (r.observation_time.indexOf('AM') > -1) {
            jQuery('body').css('background-image', 'url(https://images.unsplash.com/45/YzgdnQ4TTumS8xR9YRKJ_IMG_2761%20(1).jpg?crop=entropy&fit=crop&fm=jpg&h=675&ixjsv=2.1.0&ixlib=rb-0.3.5&q=80&w=775)');
          } else {
            jQuery('body').css('background-image', 'url(https://images.unsplash.com/reserve/iFJ5qQylTD2POC68qBgh_Uluru.jpg?crop=entropy&fit=crop&fm=jpg&h=675&ixjsv=2.1.0&ixlib=rb-0.3.5&q=80&w=775)');
          }

          $('#img').attr('src', r.icon_url)
          //weather
          $('#description').text(r.weather);
          $('#tempC').text("Temperature: " + r.temp_c + " C");
          $('#tempF').text("Temperature: " + r.temp_f + " F");
          $('#windMPH').text("Wind: " + r.wind_mph + " MPH " + r.wind_dir);
          $('#windKPH').text("Wind: " + r.wind_kph + " KPH " + r.wind_dir);
          $('#humidity').text("Humidity: " + r.relative_humidity);
        }
      });
    }

    function error() {
      var error = "Unable to retrieve your location";
    };
    navigator.geolocation.getCurrentPosition(success, error);
  }

  $('#switch').click(function() {
    $('#tempF').toggle();
    $('#tempC').toggle();
    $('#windMPH').toggle();
    $('#windKPH').toggle();
  });
})