$(document).ready(function() {
  var $k1 = $('#k1'),
      $k2 = $('#k2'),
      $pow1 = $('#pow1'),
      $pow2 = $('#pow2'),
      $axis = $('#axis');

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

  module('adjustments and conversions');
  
  test('vertex adjustment', function() {
    expect(3);
    $pow1.val('3');
    $pow2.val('4.75');

    equal(FM.power($pow1), 3, 'Set 3, get 3');
    equal(FM.power($pow2), 5, 'Set 4.75, get 5');

    $pow1.val('-5.25');
    equal(FM.power($pow1), -5, 'Set -5.25, get -5');

  });
  
  test('base curve: adjusted kdiff (corneal cylinder) converted to radius (base curve, in mm)', function() {
    expect(2);
    $k1.val('40');
    $k2.val('42');
    equal(FM.baseCurve(), 8.3, 'flat k 40, kdiff 2 -> 8.4mm');
    
    $k1.val('40.25');
    $k2.val('41');
    equal(FM.baseCurve(), 8.4, 'flat k 40.25, kdiff .75 -> 8.4mm');

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
  
  test('Second Base Curve', function() {
    expect(4);
    $k1.val('40');
    $k2.val('43');
    $pow1.val('-3');
    $pow2.val('-2');
    equal(FM.kvalue('flat'), 40, 'flatk');
    equal(FM.baseCurve({position: 'second', units: 'diopters'}), 40.75, 'diopters');
    equal(FM.baseCurve({position: 'second'}), 8.6, 'second base curve for back toric should be 8.6');
    equal(FM.baseCurve({position: 'second', torictype: 'bi'}), 8.0, 'second base curve for bi toric should be 8.0');
  });

});

