$(document).ready(function() {
  var $k1 = $('#k1'),
      $k2 = $('#k2'),
      $pow1 = $('#pow1'),
      $pow2 = $('#pow2'),
      $axis = $('#axis'),
      $addpower = $('#addpower');

  module("basics");
  test("Difference between K values", function () {
	  expect(2);
	  $k1.val('42.50');
	  $k2.val('44');

    equal( FM.kdiff(), 1.5, 'kdiff 1.5' );

    $k1.val('45.5');
    $k2.val('42');
    equal( FM.kdiff(), 3.5, 'kdiff 3.5' );
  });
  
  test('Determine Flat K and Steep K values', function() {
    expect(2);
    $k1.val('45.5');
    $k2.val('42');
    equal( FM.kvalue('flat'), 42, 'flat K is 42' );
    equal( FM.kvalue('steep'), 45.5, 'steep K is 45.5' );
  });

  test('Round by increment', function() {
    expect(4);
    equal(FM.round(3.1523, .1), 3.2, 'round 3.1523 to nearest tenth');
    equal(FM.round(3.1523, .01), 3.15, 'round 3.1523 to nearest hundredth');
    equal(FM.round(4.789, .25), 4.75, 'round 4.789 to nearest quarter');
    equal(FM.round(4.789, .5), 5, 'round 4.789 to nearest half');
  });
  
  module('adjustments and conversions');

  test('diopter / radius conversion', function() {
    equal(FM.round(FM.diopterRadiusConvert(23), .01), 14.67, '23 diopters -> mm');
    
  });

  test('power with vertex adjustment', function() {
    expect(3);
    $pow1.val('3');
    $pow2.val('-4.75');

    equal(FM.power($pow1), 3, 'Set 3, get 3');
    equal(FM.power($pow2), -4.5, 'Set -4.75, get -4.5');

    $pow1.val('-5.25');
    equal(FM.power($pow1), -5, 'Set -5.25, get -5');

  });
  

  module('outputs');

  test('Power Outputs', function() {
      expect(3);
      $k1.val('40');
      $k2.val('42');
      
      $pow1.val('-3');
      $pow2.val('-2');
      equal(FM.firstPower(), -3.5, 'Single lens (sphere power): -3, adjust by .5 -> -3.5');

      $k2.val('43');
      equal(FM.firstPower(), -3, 'Toric lens: -3, no adjustment -> -3');
      
      equal(FM.secondPower(), -5, 'Bitoric lens: -3 + -2 -> -5');
      
    });
    
  test('Empirical Fitting', function() {
    expect(2);
    $k1.val('40.25');
    $k2.val('41');
    
    equal(FM.empiricalFitting().opticZone, 8.2, 'optic zone should be 8.2');
    equal(FM.empiricalFitting().diameter, 9.6, 'diameter should be 9.6');
  });
  
  test('first base curve', function() {
    expect(4);
    $k1.val('40');
    $k2.val('42');
    $pow1.val('-3');
    $pow2.val('-2');
    equal(FM.lensType(), 'single', 'single lens');
    equal(FM.baseCurve(), 8.33, 'flat k 40 -> 8.33mm');
    
    $k1.val('44');
    $k2.val('46.75');
    equal(FM.lensType(), 'toric', 'toric lens');
    equal(FM.baseCurve(), 7.67, 'flat k 40.25 -> 7.67mm');

  });
  
  test('Second Base Curve', function() {
    expect(4);
    $k1.val('44');
    $k2.val('48');
    $pow1.val('-3');
    $pow2.val('-4');
    equal(FM.baseCurve({position: 'second', units: 'diopters'}), 46.625, 'back toric (diopters)');
    equal(FM.baseCurve({position: 'second'}), 7.24, 'back toric (mm)');
    equal(FM.baseCurve({position: 'second', torictype: 'bi', units: 'diopters'}), 47, 'bi toric (diopters)');
    equal(FM.baseCurve({position: 'second', torictype: 'bi'}), 7.18, 'bi toric (mm)');
  });

  module('IntelliWave');
  
  test('Base Curve', function() {
    expect(2);
    $k1.val('45');
    $k2.val('46');
    $pow1.val('-3');
    $pow2.val('-2');
    $axis.val('180');
    
    equal(FM.intelliwave.baseCurve(), 8.4, 'basecurve 1');
    
    $pow2.val('-3');
    
    equal(FM.intelliwave.baseCurve(), 8.3, 'basecurve 2');

  });
  
  test('Lens Type', function() {
    expect(4);

    $pow2.val('-.5');
    $addpower.val('');
    equal(FM.lensType('intelliwave'), 'aspheric', 'aspheric lens');
    
    $pow2.val('-.75');

    equal(FM.lensType('intelliwave'), 'aspheric', 'aspheric lens');
    
    
  });
  
});

