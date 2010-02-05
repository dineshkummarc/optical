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

    equals( FM.kdiff(), 1.5, 'kdiff 1.5' );

    $k1.val('45.5');
    $k2.val('42');
    equals( FM.kdiff(), 3.5, 'kdiff 3.5' );

  });
  test('Determine Flat K and Steep K values', function() {
    expect(2);
    $k1.val('45.5');
    $k2.val('42');
    equals( FM.kvalue('flat'), 42, 'flat K is 42' );
    equals( FM.kvalue('steep'), 45.5, 'steep K is 45.5' );
  });

  /* test('is single?', function() {
    expect(2);
    $k1.val('42.5');
    $k2.val('45');
    ok( FM.issingle(), 'it is a single lens');
    $k1.val('41.5');

    ok( !FM.issingle(), 'it is NOT a single lens');
  }); */

  module('adjustments and conversions');
  
  test('vertex adjustment', function() {
    expect(3);
    $pow1.val('3');
    $pow2.val('4.75');

    equals(FM.power($pow1), 3, 'Set 3, get 3');
    equals(FM.power($pow2), 5, 'Set 4.75, get 5');

    $pow1.val('-5.25');
    equals(FM.power($pow1), -5, 'Set -5.25, get -5');

  });
  
  test('base curve: adjusted kdiff (corneal cylinder) converted to radius (base curve, in mm)', function() {
    expect(2);
    $k1.val('40');
    $k2.val('42');
    equals(FM.baseCurve(), 8.3, 'flat k 40, kdiff 2 -> 8.4mm');
    
    $k1.val('40.25');
    $k2.val('41');
    equals(FM.baseCurve(), 8.4, 'flat k 40.25, kdiff .75 -> 8.4mm');

  });

  module('outputs');

  test('Power Outputs', function() {
      expect(3);
      $k1.val('40');
      $k2.val('42');
      
      $pow1.val('-3');
      $pow2.val('-2');
      equals(FM.firstPower(), -3.5, 'Single lens: -3, adjust by .5 -> -3.5');

      $k2.val('43');
      equals(FM.firstPower(), -3, 'Toric lens: -3, no adjustment -> -3');
      
      equals(FM.secondPower(), -5, 'Bitoric lens: -3 + -2 -> -5');
      
    });
    
  test('Empirical Fitting', function() {
    $k1.val('40.25');
    $k2.val('41');
    
    equals(FM.empiricalFitting().opticZone, 8.2, 'optic zone should be 8.2');
    equals(FM.empiricalFitting().diameter, 9.6, 'diameter should be 9.6');
  });

  

});

