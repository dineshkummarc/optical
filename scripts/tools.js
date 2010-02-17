var FM = {};
$(document).ready(function() {
  var utils = {};
  var math = Math;
  var num = function(el) {
    return parseFloat(el.val() || 0);
  };

  var fm = {
    k1: $('#k1'),
    k2: $('#k2'),
    pow1: $('#pow1'),
    pow2: $('#pow2'),
    axis: $('#axis'),

    // get the Power. Convert vertex if necessary.
    power: function(el) {
      var pow = (typeof el == 'number') ? el : num(el);

      if (math.abs(pow) < 4.25) {
        return pow;
      }
      var adjust = 'plus';
      if (pow < 0) {
        pow = ('' + pow).slice(1);
        adjust = 'minus';
      } else {
        pow = '' + pow;
      }
     pow = utils.vertex[pow][adjust];
      return +pow;
    },

    firstPower: function() {
      var power = this.power(this.pow1);

      if ( this.lensType() == 'single') {
        var adjust = this.fittingAdjustment();
        if (power < 0) {
          power -= adjust;
        } else {
          power += adjust;
        }
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
      return math[type == 'steep' ? 'max' : 'min'] (num(fm.k1), num(fm.k2));
    },

    // get
    kdiff: function() {
      return math.abs( num(fm.k1) - num(fm.k2) );
    },

    // determine whether single lens or toric (or bail on "front toric")
    lensType: function() {
      var lens = 'front toric';
      var secondPower = math.abs( fm.power(fm.pow2) );
      if (math.abs(fm.kdiff() - secondPower) <= .75 && fm.kdiff() <= 2.5) {
        lens = 'single';
      } else if (fm.kdiff() > 2.5) {
        lens = 'toric';
      }

      return lens;
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
      }
      
      if (opts.units == 'diopters') {
        return diopters;
      }
      
      /* return diopters converted to radius and rounded to nearest hundredt  */
      return this.diopterRadiusConvert( diopters, .01 );

    },
    
    empiricalFitting: function() {
      var baseCurve = this.round(this.baseCurve(), .1);
      return utils.empiricalFitting[baseCurve];
    },
    
    round: function(num, increment) {
      increment = increment*1;
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

    }
    
  };

  FM = fm;

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
    "7.1": {opticZone: 7.6, diameter: 9.0},
    "7.2": {opticZone: 7.6, diameter: 9.0},
    "7.3": {opticZone: 7.6, diameter: 9.0},
    "7.4": {opticZone: 7.7, diameter: 9.1},
    "7.5": {opticZone: 7.7, diameter: 9.1},
    "7.6": {opticZone: 7.8, diameter: 9.2},
    "7.7": {opticZone: 7.9, diameter: 9.3},
    "7.8": {opticZone: 7.9, diameter: 9.3},
    "7.9": {opticZone: 8.0, diameter: 9.4},
    "8.0": {opticZone: 8.1, diameter: 9.5},
    "8.1": {opticZone: 8.1, diameter: 9.5},
    "8.2": {opticZone: 8.1, diameter: 9.5},
    "8.3": {opticZone: 8.2, diameter: 9.6},
    "8.4": {opticZone: 8.2, diameter: 9.6},
    "8.5": {opticZone: 8.3, diameter: 9.7},
    "8.6": {opticZone: 8.4, diameter: 9.8}
  };
  FM.vertex = utils.vertex;
});

