$(document).ready(function() {


  $.tinyvalidate.rules.required = {
    ruleClass: 'required',
    rule: function(r) {
      return (/\S+/).test(r);
    },
    text: 'required field has no value'
  };


  $('form')
  .submit(function() {
    $('#results').children().hide();
  })
  .tinyvalidate({
    summary: {
      lineItems: null
    },
    submitOverride: function() {

      if (FM.lensType() == 'front toric') {

        var $context = $('#result-front-toric').fadeIn(200);

      } else if (FM.lensType() == 'toric') {
        var $context = $('#result-toric').fadeIn(200);
        
        var $bi = $context.find('.bi'),
            $back = $context.find('.back');

        $back.find('.result-base-curve-2 span').html( function() {
          return FM.baseCurve({
            position: 'second'
          });
        });

        $bi.find('.result-base-curve-2 span').html( function() {
          return FM.baseCurve({
            position: 'second',
            torictype: 'bi'
          });
        });
        $bi.find('.result-second-power span').html( function() {
          return FM.secondPower();
        });
        
      } else {
        // single lens
        var $context = $('#result-single').fadeIn(200);

      }
      var bc = FM.baseCurve();
      $context.find('.result-base-curve span').html( function() { return FM.baseCurve(); } );
      $context.find('.result-first-power span').html( function() { return FM.firstPower(); } );
      $context.find('.result-diameter span').html( function() { return FM.empiricalFitting().diameter; } );
      $context.find('.result-optical-zone span').html( function() { return FM.empiricalFitting().opticZone;} );

      
    }
  });


});
