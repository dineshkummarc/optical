
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
    var $form = $('#convert'), 
        options = {convertVertex: true},
        formClass = $form.attr('class');

    /* IF TORIC INTELLIWAVE, CONVERT VERTEX should be FALSE */
    if ( formClass == 'intelliwave' ) {
      options.convertVertex = !/toric/.test( FM.lensType(formClass) );
    }

    // set all options for pretty-printing next to inputs
    $form.find('input:text').each(function(index) {
      var val = $(this).val();
      var prettyOpts = {decimalPlaces: 2, plusSign: ''};

      if (/pow/.test(this.id)) {
        prettyOpts.plusSign = '+';
        
        if (this.id == 'addpower') {
          prettyOpts.suppressZero = true;
        } else {
          /* get the power  */
          val = FM.power( $(this),  options);
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
            return FM.thinsite.baseCurve();
          },
          displayOptions: {plusSign: ''}
        },
        {
          name: 'diameter',
          value: function() {
            return FM.thinsite.diameter();
          },
          displayOptions: {decimalPlaces: 1, plusSign: ''}
        },
        {
          name: 'power',
          value: function() {
            return FM.thinsite.power();
          },
          displayOptions: {}
        }
      ]
    },
    renovation: {
      outputs: [
        {
          name: 'base-curve',
          value: function(e) {
            var basecurve = FM.renovation.baseCurve(e);
            return basecurve;//FM.round(basecurve, .01);
          },
          displayOptions: {plusSign: ''}
        },
        {
          name: 'first-power',
          value: function(e) {
            return FM.renovation.firstPower(e);
          },
          displayOptions: {}
        },
        {
          name: 'diameter',
          value: function(e) {
            return FM.renovation.diameter(e);
          },
          displayOptions: {plusSign: ''}
        },
        {
          name: 'near-add-power',
          value: function() {
            return FM.renovation.nearAddPower();
          },
          displayOptions: {}
        }

      ],
      toricCalcs: function(e) {
        var $bi   = $('#result-toric').find('.bi'),
            $back = $('#result-toric').find('.back');

        $back.toggle( FM.showBackToric() );

        /* calculate results */

        $back.find('.result-base-curve-2 span').html( function() {
          var bc2 = FM.baseCurve({
            position: 'second',
            e: e
          });
          bc2 = FM.round(bc2, .01);
          return FM.displayNumber(bc2, {plusSign: ''});
        });

        $bi.find('.result-base-curve-2 span').html( function() {
          var bc2 = FM.baseCurve({
            position: 'second',
            torictype: 'bi',
            e: e
          });
          bc2 = FM.round(bc2, .01);
          return FM.displayNumber(bc2, {plusSign: ''});
        });

        $bi.find('.result-second-power span').html( function() {
          var secondPower = FM.renovation.secondPower(e);
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
          },
          displayOptions: {}
          
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
            return FM.addpower.val();
          },
          displayOptions: {suppressZero: true}
        }
      ]
    },
    achievement: {
      outputs: [
        {
          name: 'base-curve',
          value: function() {
            var basecurve = FM.thinsite.baseCurve({design: 'achievement'});
            return FM.round(basecurve, .01);
          },
          displayOptions: {plusSign: ''}
        },
        {
          name: 'power',
          value: function() {
            return FM.thinsite.power({design: 'achievement'});
          },
          displayOptions: {}
        },
        {
          name: 'diameter',
          value: 9.4
        }

      ]
    }
  };

  /** =DISPLAY FORM RESULTS
  ************************************************************/
  FM.forms['renovation-e'] = FM.forms.renovation;

  FM.formResults = function() {
    var e = (/renovation-e/).test(this.className);
    var formClass = e ? 'renovation' : this.className;
    
    if (!FM.forms[formClass] ) { return; }
    var context = FM.forms[formClass][ FM.lensType() ] || FM.lensType(formClass);
    var $context = $('#result-' + context);
    var outputs = FM.forms[formClass].outputs;

    $context.fadeIn(200);

    for (var i=0; i < outputs.length; i++) {

      var output = $.isFunction( outputs[i].value )
        ? outputs[i].value(e)
        : outputs[i].value;

      if (outputs[i].displayOptions) {
        output = FM.displayNumber(output, outputs[i].displayOptions);
      }
      $context.find('div.result-' + outputs[i].name + ' span').html( output );
    }
    /* deal with special case: renovation toric lenses */
    if (/renovation/.test(formClass) && context == 'toric') {
      FM.forms.renovation.toricCalcs(e);
    }
  };

  /** =VALIDATE SUBMISSION
  ************************************************************/

  $('#convert')
  .submit(function(event) {
    event.preventDefault();
  })
  .tinyvalidate({
    submitOverride: function() {

      /* prettify fields */
      FM.formPrettify();

      /* display results */
      FM.formResults.call(this);

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

$.tinyvalidate.rules.power = {
  ruleClass: 'power',
  rule: function(r) {
    r = parseFloat(r);
    return Math.abs(r) <= 20;
  }, 
  text: 'The power exceeds design limitations. Please contact Art Optical\'s consultation department for further assistance.'
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