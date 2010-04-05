var FM = {};

$(document).ready(function() {
  var utils = {};
  var math = Math;
  var num = function(el) {
    return parseFloat(el.val() || 0);
  };

  var fm = {
    // standard field inputs
    k1: $('#k1'),
    k2: $('#k2'),
    pow1: $('#pow1'),
    pow2: $('#pow2'),
    axis: $('#axis'),
    addpower: $('#addpower'),

    // get the Power. Convert vertex if necessary.
    power: function(el, options) {
      var defaults = {
        convertVertex: true,
        shiftPositive: true
      };

      var opts = $.extend({}, defaults, options),
          pow = (typeof el == 'number') ? el : num(el),
          pow2 = num(this.pow2);

      // shift for positive second power
      if (pow2 > 0 && opts.shiftPositive) {
        if (el[0].id == 'pow1') {
          pow += pow2;
        } else if (el[0].id == 'pow2') {
          pow = -pow;
        }
      }
      
      var adjust = 'plus';

      if (math.abs(pow) < 4.25 || opts.convertVertex === false) {
        return this.round(pow, .125);
      }

      if (pow < 0) {
        pow = ('' + pow).slice(1);
        adjust = 'minus';
      } else {
        pow = '' + pow;
      }
      pow = this.round(pow, .25);
      
      pow = utils.vertex[pow][adjust];

      return +pow;
    },

    firstPower: function() {
      var power = this.power(this.pow1);

      if ( this.lensType() == 'single') {
        var adjust = this.fittingAdjustment();
        power -= adjust;
      }
      return power;
    },

    // use this for bitoric only
    secondPower: function() {
      // second power == cylinder power == spectacle cylinder
      return this.power(this.pow1) + this.power(this.pow2);
    },

    // get value of Flat K or Steep K. (One param. Pass in either 'flat' or 'steep'. default is 'flat')
    kvalue: function(type) {
      return math[type == 'steep' ? 'max' : 'min'] (num(this.k1), num(this.k2));
    },

    kdiff: function() {
      return math.abs( num(this.k1) - num(this.k2) );
    },

    // determine the type of lens (single, toric, etc.)
    lensType: function(special) {
      special = special || 'standard';
      var ax = this.adjustedAxis();
      
      var lensTypes = {
        standard: function() {
          // start out with a "front toric" lens, only if the axis is between 31 and 149; 
          // otherwise single
          if (ax > 30 && ax < 150) {
            var lens = 'front-toric';
          } else {
            var lens = 'single';
          }

          // now see if it's single or toric
          var secondPower = math.abs( fm.power(fm.pow2) );

          if (math.abs(fm.kdiff() - secondPower) <= .75 && fm.kdiff() <= 2.5) {
            lens = 'single';
          } else if (fm.kdiff() > 2.5) {
            lens = 'toric';
          }
          return lens;
        },
        intelliwave: function() {
          var lens = fm.addpower.val() ? 'multifocal' : 'aspheric';
          var secondPower = fm.power(fm.pow2, {convertVertex: false});
          
          if ( secondPower <= -.75 ) {
            lens += '-toric';
          }
          return lens;
        }
      };

      if (special in lensTypes) {
        return lensTypes[special]();
      } else {
        return lensTypes['standard']();
      }
      
    },

    showBackToric: function() {
      // only show back toric if it really is a toric lens.
      if (this.lensType() !== 'toric') {
        return false;
      }
      
      // - need at least 1.25 diopters difference between base curves. 
      var bcFirst = this.baseCurve({units: 'diopters'});
      var bcSecond = this.baseCurve({units: 'diopters', position: 'second'});
      


      if (math.abs(bcSecond-bcFirst) < 1.25) {
        return false;
      }
      // - 2nd base curve needs to be .75 diopters less than or equal to steep K reading
      var steepK = this.kvalue('steep');
      
      return bcSecond - steepK <= -.75;
    },
    
    fittingAdjustment: function() {
      var kd = fm.kdiff();
      var adjustment = 0;
      if (kd >= 1.25 && kd <= 1.75) {
        adjustment = .25;
      } else if (kd >= 1.76 && kd <= 2) {
        adjustment = .5;
      } else if (kd > 2) {
        adjustment = .75;
      }
      return adjustment;
    },
    
    diopterRadiusConvert: function(val, roundto) {
      val = parseFloat(val);
      var radius = 337.5 / ( val );
      if (roundto) {
        radius = this.round(radius, roundto);
      }
      return radius;
    },
    
    baseCurve: function(options) {
      var defaults = {
        position: 'first',
        torictype: 'back',
        units: 'radius'
      };
      var opts = $.extend({}, defaults, options);
      
      var diopters = fm.kvalue('flat'); // + fm.fittingAdjustment();
            
      if (opts.position == 'second') {
        if (opts.torictype == 'bi') {
          diopters = fm.kvalue('steep') - 1;
        } else {
          var p2 = num(this.pow2);
          p2 = this.round(p2/1.5, .125);
          p2 = math.abs(p2);
          
          diopters = p2 + diopters;
        }
      } else if (this.lensType() == 'single' ) {
        diopters += fm.fittingAdjustment();
      }
      
      if (opts.units == 'diopters') {
        return diopters;
      }
      
      /* return diopters converted to radius and rounded to nearest hundredth  */
      return this.diopterRadiusConvert( diopters, .01 );

    },
    
    empiricalFitting: function() {
      var fitting = {opticZone: 'Out of range', diameter: 'Out of range'};
      var baseCurve = this.round(this.baseCurve(), .1);
      
      $.extend(fitting, utils.empiricalFitting[baseCurve]);
      return fitting;
    },
    
    round: function(num, increment) {
      increment = increment*1;
      if (isNaN(parseFloat(num))) {
        return num;
      }
      var pos = true;
      if (+num < 0) {
        pos = false;
      }
      num = '' + num;
      
      var integ = math.abs(parseInt(num, 10));
      var dec = (num.split('.')[1] || 0);
      dec = parseFloat('.' + dec);
      
      var rounded = integ + (Math.round(dec / increment) * increment);
      return pos ? rounded : rounded * -1;

    },
    
    adjustedAxis: function() {
      var axis = num(this.axis);
      if (num(this.pow2) > 0) {
        axis = axis <=90 ? axis + 90 : axis - 90;
      }
      return axis;
    },
    
    /* prettify numbers for displaying on the page */
    displayNumber: function(num, options) {
      var defaults = {
        decimalPlaces: 2,
        plusSign: '+',
        suppressZero: false
      };
      var opts = $.extend({}, defaults, options);
      
      var trimTo = opts.decimalPlaces,
          plusSign = opts.plusSign,
          zeros = '';
      
      if (opts.suppressZero && num == '') {
        return '';
      }
      num = parseFloat(num);
      if (plusSign && num*1 > 0) {
        num = plusSign + num;
      } else {
        num = '' + num;  
      }

      var regTrim = new RegExp( '(\\.\\d{' + trimTo + '})\\d+' );
      num = num.replace(regTrim, '$1');
      
      var point = num.indexOf('.');
      var places = num.slice(point).length - 1;
      
      while (places++ < trimTo) {
        zeros += '0';
      }
      if (point === -1 && opts.decimalPlaces) {
        zeros = '.' + zeros;
      }
      return num + zeros;
    },
    roundingAdjustment: function(pow) {
       // for specialty lenses, "adjust the adjusted adjustment" (Bryan Lewis, March 31, 2010).
       // need to round "up" (salmon flap) to nearest .25, so previously rounded .12 increment needs to be bumped by .01
        if (pow > 0) {
          pow += .01;
        } else {
          pow -= .01;
        }
        return this.round(pow, .25);
    },
    
    thinsite: {},
    renovation: {},
    intelliwave: {},
    achievement: {}
  };

  /* THINSITE CALCULATIONS */

  fm.thinsite.diameter = function() {
    var diameter = 'Out of range';
    var flatk = fm.kvalue('flat');
    if (flatk <= 39.25) {
      diameter = 10;
    } else if (flatk <= 42.5) {
      diameter = 9.5;
    } else if (flatk <= 45.5) {
      diameter = 9;
    }
  
    return diameter;
  };
  
 
  fm.thinsite.baseCurveAdjustment = function() {
    var diameter = fm.thinsite.diameter();
    if (diameter == 'Out of range') {
      return 'Out of range';
    }
    var kdiff = fm.kdiff(),
        cylinderPosition = 3;
    if (kdiff <= .5) {
      cylinderPosition = 0;
    } else if (kdiff <= 1.25) {
      cylinderPosition = 1;
    } else if (kdiff <= 2) {
      cylinderPosition = 2;
    }

    return utils.flatk.thinsite[diameter][cylinderPosition];
  };
  
  /* Calculate base curve for Thinsite *OR ACHIEVEMENT*  */
  fm.thinsite.baseCurve = function(options) {
    var opts = $.extend({design: 'thinsite'}, options);
    
    var flatk = fm.kvalue('flat');
    var adjustment = fm[opts.design].baseCurveAdjustment();
    if ( isNaN(parseFloat(adjustment)) ) {
      return 'Diameter cannot be calculated (base curve out of range)';
    }
    var basecurve = flatk + adjustment;
    basecurve = fm.diopterRadiusConvert(basecurve, .05);

    if (basecurve > 8.5 || basecurve < 7) {
      return 'Base curve not available for this design. Contact Art Optical for consultation.';
    }
    return basecurve;
  };
  
  /* Calculate power for Thinsite *OR ACHIEVEMENT*  */
  fm.thinsite.power = function(options) {
    var opts = $.extend({design: 'thinsite'}, options);
    
    var pow = fm.power(fm.pow1);
    var adjustment = fm[opts.design].baseCurveAdjustment();

    pow = pow - adjustment;
    if (pow < -30 || pow > 20 || isNaN(pow)) {
      return 'Power not available for this design. Contact Art Optical for consultation';
    }

    return fm.roundingAdjustment(pow);
  };
  
  /* RENOVATION(E) CALCULATIONS */
  
  fm.renovation.baseCurveAdjustment = function(e) {
    var kdiff = fm.kdiff(),
        adjustment = e ? 1 : .5;
    
    if (kdiff <= 1.25) {
      adjustment = e ? .5 : 0;
    } else if (kdiff <= 2.25) {
      adjustment = e ? .75 : .25;
    }
    return adjustment;
  };
  
  fm.renovation.baseCurve = function(e) {
    e = e || false;
    var flatk = fm.kvalue('flat');
    var adjustment = fm.renovation.baseCurveAdjustment(e);
    var basecurve = flatk + adjustment;
    if (basecurve != 0) {
      return  fm.diopterRadiusConvert(basecurve, .05);
    }
    return 0;
  };
  
  fm.renovation.diameter = function(e) {
    e = e || false;
    var diameter = 'Out of range';
    var basecurve = fm.renovation.baseCurve(e);
    
    var tooFlat = basecurve < 6.9,
        tooSteep = e ? basecurve > 9 : basecurve > 8.5;

    if (tooFlat || tooSteep) {
      return diameter;
    }
    
    if (basecurve <= 7.15) {
      diameter = 9;
    } else if (basecurve <= 7.45) {
      diameter = 9.2;
    } else if (basecurve <= 8.15) {
      diameter = 9.5;
    } else if (basecurve <= 8.4) {
      diameter = 9.6;
    } else if (basecurve <= 8.5) {
      diameter = 10;
    }
  
    return diameter;
  };

  // firstpower (aka distance power)
  fm.renovation.firstpower = function(e) {
    e = e || false;
    
    /* FIXME: are we supposed to convert vertext here????? */
    var pow = fm.power(fm.pow1);
    var adjustment = fm.renovation.baseCurveAdjustment(e);

    // subtract adjustment from power
    pow -= adjustment;
    
    // round "up" to nearest .25
    return fm.roundingAdjustment(pow);
  };
  
  fm.renovation.nearAddPower = function() {
    if (fm.addpower.val() === '') {
      return '';
    }
    var addPower = num(fm.addpower);
    
    return addPower > 2.5 ? 3 : addPower + .5;
  };
  
  /** =INTELLIWAVE **/
  
  fm.intelliwave.baseCurve = function() {
    var flatk = fm.kvalue('flat');
    var toric = fm.lensType('intelliwave').indexOf('toric') > -1;
    
    var baseCurve = fm.diopterRadiusConvert(flatk);
    
    baseCurve = fm.round(baseCurve, .1);
    
    baseCurve += 1;
 
    var secondPower = math.abs( fm.power(fm.pow2, {
       convertVertex: !toric,
       shiftPositive: false
     }) ),
        secondPower = math.floor(secondPower);
    
    if (secondPower >= 2) {
      var powerDiff = (secondPower - 1) * .1;
      
      baseCurve -= powerDiff;
    }
    return baseCurve;
  };
  
  fm.intelliwave.power = function() {
    var lenstype = fm.lensType('intelliwave');
    var powerOptions = {shiftPositive: false, convertVertex: true};
    var pow1 = fm.power(fm.pow1, powerOptions);
    
    
    if ( lenstype.indexOf('toric') > -1 ) {
      powerOptions.convertVertex = false;
      var pow2 = fm.power(fm.pow2, powerOptions);
      var adjustment = 0;

      if (pow2 <= -5) {
        adjustment = .75;
      } else if (pow2 <= -2.75) {
        adjustment = .5;
      } else if (pow2 <= -2) {
        adjustment = .25;
      }
      
      pow2 += adjustment;
      
    } else {
      var pow2 = fm.power(fm.pow2, powerOptions);  
    }
    
    // round "up" to nearest .25
    pow1 = fm.roundingAdjustment(pow1);
    pow2 = fm.roundingAdjustment(pow2);
    
    var powers = fm.displayNumber(pow1) + ' ' + fm.displayNumber(pow2);
    return powers + ' x ' + fm.axis.val();
  };
  
  /* ACHIEVEMENT */
  fm.achievement.baseCurveAdjustment = function() {
    var kdiff = fm.kdiff(),
        adjustment = 'Out of range';
    
    /* FIXME: verify plus and minus in these adjustments... */
    if (kdiff <= .25) {
      adjustment = -.25;
    } else if (kdiff <= 1) {
      adjustment = 0;
    } else if (kdiff <= 1.75) {
      adjustment = .25;
    } else if (kdiff < 2.5) {
      adjustment = .5;
    }
    return adjustment;
  };
  
  FM = fm;


/** =UTILITIES
************************************************************/


  utils.vertex = {
    "4": {plus: 4.25, minus: -3.87},
    "4.25": {plus: 4.5, minus: -4},
    "4.5": {plus: 4.75, minus: -4.25},
    "4.75": {plus: 5, minus: -4.5},
    "5": {plus: 5.25, minus: -4.75},
    "5.25": {plus: 5.62, minus: -5},
    "5.5": {plus: 5.87, minus: -5.12},
    "5.75": {plus: 6.12, minus: -5.37},
    "6": {plus: 6.5, minus: -5.62},
    "6.25": {plus: 6.75, minus: -5.75},
    "6.5": {plus: 7, minus: -6},
    "6.75": {plus: 7.37, minus: -6.25},
    "7": {plus: 7.62, minus: -6.5},
    "7.25": {plus: 8, minus: -6.62},
    "7.5": {plus: 8.25, minus: -6.87},
    "7.75": {plus: 8.5, minus: -7.12},
    "8": {plus: 8.87, minus: -7.25},
    "8.25": {plus: 9.12, minus: -7.5},
    "8.5": {plus: 9.5, minus: -7.75},
    "8.75": {plus: 9.75, minus: -7.87},
    "9": {plus: 10.12, minus: -8.12},
    "9.25": {plus: 10.37, minus: -8.37},
    "9.5": {plus: 10.75, minus: -8.5},
    "9.75": {plus: 11, minus: -8.75},
    "10": {plus: 11.37, minus: -8.87},
    "10.5": {plus: 12, minus: -9.37},
    "11": {plus: 12.75, minus: -9.75},
    "11.5": {plus: 13.37, minus: -10.12},
    "12": {plus: 14, minus: -10.5},
    "12.5": {plus: 14.75, minus: -10.87},
    "13": {plus: 15.5, minus: -11.25},
    "13.5": {plus: 16.12, minus: -11.62},
    "14": {plus: 16.75, minus: -12},
    "14.5": {plus: 17.5, minus: -12.37},
    "15": {plus: 18.25, minus: -12.75},
    "15.5": {plus: 19, minus: -13},
    "16": {plus: 19.75, minus: -13.5},
    "16.5": {plus: 20.5, minus: -13.75},
    "17": {plus: 21.5, minus: -14.12},
    "17.5": {plus: 22.25, minus: -14.5},
    "18": {plus: 23, minus: -14.75},
    "18.5": {plus: 23.75, minus: -15.12},
    "19": {plus: 24.75, minus: -15.5},
    "19.5": {plus: 25.5, minus: -15.87},
    "20": {plus: 26.37, minus: -16.12},
    "20.5": {plus: 27.11, minus: -16.5},
    "21": {plus: 28.12, minus: -16.75},
    "21.5": {plus: 29, minus: -17.12},
    "22": {plus: 29.87, minus: -17.37},
    "22.5": {plus: 30.87, minus: -17.75},
    "23": {plus: 31.75, minus: -18},
    "23.5": {plus: 32.62, minus: -18.37},
    "24": {plus: 33.62, minus: -18.62},
    "24.5": {plus: 34.75, minus: -18.87},
    "25": {plus: 35.75, minus: -19.25},
    "25.5": {plus: 36.75, minus: -19.5},
    "26": {plus: 37.75, minus: -19.87},
    "26.5": {plus: 38.87, minus: -20.12},
    "27": {plus: 40, minus: -20.37},
    "27.5": {plus: 41, minus: -20.75},
    "28": {plus: 42.25, minus: -21},
    "28.5": {plus: 43.5, minus: -21.25},
    "29": {plus: 44.5, minus: -21.5},
    "29.5": {plus: 45.66, minus: -21.87},
    "30": {plus: 47, minus: -22.12},
    "30.5": {plus: 48.12, minus: -22.37},
    "31": {plus: 49.5, minus: -22.62},
    "31.5": {plus: 50.75, minus: -22.87},
    "32": {plus: 52.12, minus: -23.12},
    "32.5": {plus: 53.5, minus: -23.37},
    "33": {plus: 54.62, minus: -23.62},
    "33.5": {plus: 56.12, minus: -23.87},
    "34": {plus: 57.5, minus: -24.12},
    "34.5": {plus: 59.5, minus: -24.5},
    "35": {plus: 60.62, minus: -24.75}
  };

  utils.empiricalFitting = {
    "7.1": {opticZone: "7.6", diameter: "9.0"},
    "7.2": {opticZone: "7.6", diameter: "9.0"},
    "7.3": {opticZone: "7.6", diameter: "9.0"},
    "7.4": {opticZone: "7.7", diameter: "9.1"},
    "7.5": {opticZone: "7.7", diameter: "9.1"},
    "7.6": {opticZone: "7.8", diameter: "9.2"},
    "7.7": {opticZone: "7.9", diameter: "9.3"},
    "7.8": {opticZone: "7.9", diameter: "9.3"},
    "7.9": {opticZone: "8.0", diameter: "9.4"},
    "8":   {opticZone: "8.1", diameter: "9.5"},
    "8.1": {opticZone: "8.1", diameter: "9.5"},
    "8.2": {opticZone: "8.1", diameter: "9.5"},
    "8.3": {opticZone: "8.2", diameter: "9.6"},
    "8.4": {opticZone: "8.2", diameter: "9.6"},
    "8.5": {opticZone: "8.3", diameter: "9.7"},
    "8.6": {opticZone: "8.4", diameter: "9.8"}
  };
  utils.flatk = {
    thinsite: {
      "9": [-.25, 0, .25, .5],
      "9.5": [-.25, 0, .25, .5],
      "10": [-.5, -.25, 0, .25]
    }
  };
  
  
  FM.vertex = utils.vertex;
});

