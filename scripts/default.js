$(document).ready(function() {
  
  $('form').submit(function(event) {
    event.preventDefault();
    $('#result').html( FM.spherePower() );
    
  });
});
