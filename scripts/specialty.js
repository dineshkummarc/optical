
$(document).ready(function() {
  $.fn.tinyvalidate.defaults.summary = null;

  $('form').submit(function() {
    $(this).next('div.results').children().hide();
  });


/** =PRETTIFY FORM VALUES
************************************************************/

  FM.formPrettify = function() {
    /* show adjusted values */
    /* start with clean slate */
    $('span.adjusted').empty();

    /* prettify form values (next to each input) */

    $('#convert').find('input:text').each(function(index) {
      var val = $(this).val();
      var prettyOpts = {decimalPlaces: 2, plusSign: ''};

      if (/pow/.test(this.id)) {
        prettyOpts.plusSign = '+';

        /* get the power without converting the vertex */
        val = FM.power( $(this), {convertVertex: false} );

        if (this.id == 'addpower') {
          prettyOpts.suppressZero = true;
        }
      } else if (/axis/.test(this.id)) {
        prettyOpts.decimalPlaces = 0;
        val = FM.adjustedAxis();
      }

      val = FM.displayNumber(val, prettyOpts);
      $(this).parent().find('span.adjusted').text(val);
    });

  };

  /** =FORM OUTPUT VALUES
  ************************************************************/
  FM.forms = {

    thinsite: {
      'front-toric': 'toric',
      outputs: [
        {
          name: 'base-curve',
          value: function() {
            return FM.displayNumber(FM.thinsite.baseCurve(), {plusSign: ''});
          }
        },
        {
          name: 'diameter',
          value: function() {
            return FM.thinsite.diameter();
          }
        },
        {
          name: 'power',
          value: function() {
            return FM.thinsite.power();
          }
        }
      ]
    },
    renovation: {

      outputs: [
        {
          name: 'base-curve',
          value: function(e) {
            var basecurve = FM.renovation.baseCurve(e);
            basecurve = FM.round(basecurve, .01);
            return FM.displayNumber(basecurve, {plusSign: ''});
          }
        },
        {
          name: 'first-power',
          value: function(e) {
            return FM.renovation.firstpower(e);
          }
        },
        {
          name: 'diameter',
          value: function() {
            return FM.renovation.diameter();
          }
        },
        {
          name: 'near-add-power',
          value: function() {
            var nearAdd = FM.renovation.nearAddPower();
            return FM.displayNumber(nearAdd);
          }
        }

      ],
      toricCalcs: function() {
        var $bi   = $('#result-toric').find('.bi'),
            $back = $('#result-toric').find('.back');

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

      }
    },
    intelliwave: {
      outputs: [
        {
          name: 'base-curve',
          value: function() {
            return FM.intelliwave.baseCurve();
          }
        },
        {
          name: 'diameter',
          value: 14.5
        },
        {
          name: 'power',
          value: function() {
            return FM.intelliwave.power();
          }
        },
        {
          name: 'near-add-power',
          value: function() {

            var nearAdd =  FM.addpower.val();
            return FM.displayNumber(nearAdd, {suppressZero: true});
          }
        }
      ]
    },
    achievement: {
      outputs: [
        {
          name: 'base-curve',
          value: function() {
            var basecurve = FM.thinsite.baseCurve({design: 'achievement'});
            basecurve = FM.round(basecurve, .01);
            return FM.displayNumber(basecurve, {plusSign: ''});
          }
        },
        {
          name: 'power',
          value: function() {
            return FM.thinsite.power({design: 'achievement'});
          }
        },
        {
          name: 'diameter',
          value: 9.5
        }

      ]
    }
  };

  /** =DISPLAY FORM RESULTS
  ************************************************************/
  FM.forms['renovation-e'] = FM.forms.renovation;

  FM.formResults = function(formClass) {
    if (!FM.forms[formClass] ) { return; }
    var context = FM.forms[formClass][ FM.lensType() ] || FM.lensType(formClass);
    var $context = $('#result-' + context);
    var outputs = FM.forms[formClass].outputs;
    var e = $(this).hasClass('renovation-e');


    $context.fadeIn(200);

    for (var i=0; i < outputs.length; i++) {

      var output = $.isFunction( outputs[i].value )
        ? outputs[i].value(e)
        : outputs[i].value;

      $context.find('div.result-' + outputs[i].name + ' span').html( output );
    }

    /* deal with special case: renovation toric lenses */
    if (/renovation/.test(formClass) && context == 'toric') {
      FM.forms.renovation.toricCalcs();
    }
  };

  /** =VALIDATE SUBMISSION
  ************************************************************/

  $('#convert')
  .tinyvalidate({
    submitOverride: function() {

      /* prettify fields */
      FM.formPrettify();

      /* display results */
      var thisClass = this.className == 'renovation-e' ? 'renovation' : this.className;
      FM.formResults(thisClass);

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

$.tinyvalidate.rules.kreading = {
  ruleClass: 'kreading',
  rule: function(r) {
    r = parseFloat(r);
    return r <= 50 && r >= 39;
  },
  text: function() {
    return  parseFloat(this.value) > 50 
        ? 'This cornea may have keratoconus. Please contact Art Optical for a consultation.'
        : 'This cornea may be post surgical. Please contact Art Optical for a consultation.';
  }
};

$.tinyvalidate.rules.range = {
  ruleClass: 'range',
  rule: function(el) {

    var minmax = el[0].className.match(/min-(\d+).*?max-(\d+)/),
        val = parseFloat( el.val() ) || 0;
    val = Math.abs(val);
    return (minmax[1] * 1 <= val && minmax[2]*1 >= val) || el.val() == '';
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