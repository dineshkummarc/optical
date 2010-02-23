
$(document).ready(function() {
  $.fn.tinyvalidate.defaults.summary = null;

  $('form').submit(function() {
    $(this).next('div.results').children().hide();
  });


/** =THINSITE LENS CALCULATIONS
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
      
      if (FM.lensType() != 'single') {

        var $context = $('#result-toric').fadeIn(200);

      }  else {
        // single lens
        var $context = $('#result-single').fadeIn(200);

      }
      
      $context.find('.result-base-curve span').html( function() { return FM.thinsite.baseCurve(); } );
      $context.find('.result-diameter span').html( function() { return FM.thinsite.diameter(); } );
      $context.find('.result-power span').html( function() { return FM.thinsite.power(); } );
      
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