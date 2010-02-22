$(document).ready(function() {

  $.fn.tinyvalidate.defaults.summary = null;

  $('form').submit(function() {
    $(this).next('div.results').children().hide();
  });

/** =DIOPTER - RADIUS CONVERSION
************************************************************/
  $('#dirad').tinyvalidate({
    otherEvents: null,
    submitOverride: function() {
      var input = parseFloat($('#rd').val()),
          from = $(this).find('input:radio:checked')[0].id,
          increment = (from == 'diopter') ? .01 : .25;
      
      var output = {
        raw: FM.diopterRadiusConvert(input),
        rounded: FM.diopterRadiusConvert(input, increment),
        label: (from == 'diopter') ? 'Radius: ' : "Diopter: ",
        note: function() {
          return (output.raw === output.rounded) ? '' : ' (rounded to the nearest ' + increment + ')';
        }
      };
      $('#dirad-results').html( '<div>' + output.label + '<span>' + output.rounded + '</span>' + output.note() + '</div>');
      
    }
  });

/** =VERTEX CONVERSION
************************************************************/
  $('#vertex').tinyvalidate({
    submitOverride: function() {
      var num = parseFloat( $('#power').val() ),
          increment = .25,
          plusorminus = num < 0 ? 'minus' : 'plus';

      if (num >= 9.875) {
        var increment = .5;
      }

      var power = FM.round(num, increment);
      var powerMsg = power === num ? 'Power' : 'Power (rounded to nearest ' + increment + ')';


      var vertex = FM.power(power);
      var $context = $('#vertex-results');
      $context.children().fadeIn(200);
      $context.find('.power').html(powerMsg + ': <span>' + power + '</span>');
      $context.find('.vertex').html('Vertex-adjusted: <span>' + vertex + '</span>');
      
    }
  });
  
/** =LENS CALCULATIONS
************************************************************/

  $('#convert')
  .tinyvalidate({
    submitOverride: function() {
      
      /* show adjusted values */
      /* start with clean slate */
      $('span.adjusted').empty();
      
      /* prettify k readings */
      $(this).find('input:text').each(function(index) {
        var val = $(this).val();
        var dp = 2;
        if (/pow/.test(this.id)) {
          /* get the power without converting the vertex */
          val = FM.power($(this), false);
        } else if (/axis/.test(this.id)) {
          dp = 0;
          val = FM.adjustedAxis();
        }
        
        val = FM.displayNumber(val, {decimalPlaces: dp});
        $(this).parent().find('span.adjusted').text(val);
      });
      
      /* display results */
      
      if (FM.lensType() == 'front toric') {

        var $context = $('#result-front-toric').fadeIn(200);

      } else if (FM.lensType() == 'toric') {
        var $context = $('#result-toric').fadeIn(200);
        
        var $bi = $context.find('.bi'),
            $back = $context.find('.back');
        
        $back.toggle( FM.showBackToric() );

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
          var secondPower = FM.secondPower();
          return FM.displayNumber(secondPower);
        });
        
      } else {
        // single lens
        var $context = $('#result-single').fadeIn(200);

      }
      $context.find('.result-base-curve span').html( function() { return FM.baseCurve(); } );
      $context.find('.result-first-power span').html( function() { return FM.firstPower(); } );
      $context.find('.result-diameter span').html( function() { return FM.empiricalFitting().diameter; } );
      $context.find('.result-optical-zone span').html( function() { return FM.empiricalFitting().opticZone;} );

      
    }
  });

});


$.tinyvalidate.rules.required = {
  ruleClass: 'required',
  rule: function(r) {
    return (/\S+/).test(r);
  },
  text: 'required field has no value'
};

$.tinyvalidate.rules.dirad = {
  ruleClass: 'dirad',
  rule: function(r) {
    r = parseFloat(r);
    if ( $('#diopter').is(':checked') && (r < 23 || r > 70) ) {
      return false;
    } else if ( $('#radius').is(':checked') && (r > 14.67 || r < 4.82) ) {
      return false;
    }
    return true;
  },
  text: 'Out of range. Please call Art Optical for a consultation.'
};

$.tinyvalidate.rules.range = {
  ruleClass: 'range',
  rule: function(el) {
    
    var minmax = el[0].className.match(/min-(\d+).*?max-(\d+)/),
        val = parseFloat( el.val() ) || 0;
    val = Math.abs(val);
    return minmax[1] * 1 <= val && minmax[2]*1 >= val;
  },
  text: function() {
    var minmax = this.className.match(/min-(\d+).*?max-(\d+)/);
    var val = parseFloat(this.value);
    var min = val < 0 ? '-' + minmax[2] : minmax[1];
    var max = val < 0 ? '-' + minmax[1] : minmax[2];
    return 'The number entered (' + val + ') is not between ' + min + ' and ' + max;
  },
  check: 'element'
};
