$(document).ready(function() {

  $.fn.tinyvalidate.defaults.summary = null;

  $('form').submit(function() {
    $(this).next('div.results').children().hide();
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

        /* calculate results */
        
        $back.find('.result-base-curve-2 span').html( function() {
          var bc2 = FM.baseCurve({
            position: 'second'
          });
          bc2 = FM.round(bc2, .01);
          return FM.displayNumber(bc2, {plusSign: ''});
        });

        $bi.find('.result-base-curve-2 span').html( function() {
          var bc2 = FM.baseCurve({
            position: 'second',
            torictype: 'bi'
          });
          bc2 = FM.round(bc2, .01);
          return FM.displayNumber(bc2, {plusSign: ''});
        });
        
        $bi.find('.result-second-power span').html( function() {
          var secondPower = FM.secondPower();
          return FM.displayNumber(secondPower);
        });
        
      } else {
        // single lens
        var $context = $('#result-single').fadeIn(200);

      }
      var e = $(this).hasClass('renovation-e');
      $context.find('.result-base-curve span').html( function() { 
        var basecurve = FM.renovation.baseCurve(e); 
        basecurve = FM.round(basecurve, .01);
        return FM.displayNumber(basecurve);
      } );
      $context.find('.result-first-power span').html( function() { return FM.firstPower(); } );
      $context.find('.result-diameter span').html( function() { return FM.renovation.diameter(); } );
      $context.find('.result-near-add-power span').html( function() { 
        var nearAdd = FM.renovation.nearAddPower(); 
        return FM.displayNumber(nearAdd);
      } );

      
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
