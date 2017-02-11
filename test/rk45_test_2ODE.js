// =========================================================
// Test solving a single ODE.  This test chooses an ODE that
// has an escat analytical solution so that the numercially
// computed value can be compared to the analytical result.
// Using Mocha and Chai.
// =========================================================

var chai = require( "chai" );
var expect = chai.expect;
var rk45 = require( "../rk45.js" );

// --------------------------------------------
// Equations for pendulum with non-linear term.
// 
//      d^2/dt^2 x + g/l*sin(x) = 0
//
// which is coded as:
//
//      dx/dt = y
//      dy/dt = -g/l*sin(x)
//
// where:
//      g = 9.81 m/sec^2
//      l = 1m
//
// initial conditions:
//
//      x = 0.33*PI
//      y = 0
//
// Solve for [x,y] when t = 9.0 sec.
// Answer should be close to [0.41088,-2.82836]
// --------------------------------------------

var foo = new rk45.System();
var diffEqX0 = function( time, x ) { return (x[1]); }
var diffEqX1 = function( time, x ) { return (-9.81/1.0*Math.sin(x[0])); }

var fn = [ diffEqX0, diffEqX1 ];
var startX = [0.33*Math.PI,0.0];

foo.setInitX( startX );
foo.setFn( fn );
foo.setStart( 0.0 );
foo.setStop( 9.0 );
foo.setH( 0.1 );
foo.setTol( 1.0e-6 );
foo.solve();

describe('Solving 2nd order ODE: non-linear pendulum', function() {
    it('Solver iterated over problem', function() {
        expect(foo.count).to.be.at.least(1);
    });
    it('Output is not null', function() {
        expect(foo.newX).to.not.be.null;
    });
    it('Output is an array', function() {
        expect(foo.newX).to.be.an('array');
    });
    it('Output has length of 2', function() {
        expect(foo.newX).to.have.lengthOf(2);
    });
    it('Check value at t=9, x should be 0.41088', function() {
        expect(foo.newX[0]).to.be.closeTo(0.41088,0.0001);
    });
    it('Check value at t=9, y should be -2.82836', function() {
        expect(foo.newX[1]).to.be.closeTo(-2.82836,0.0001);
    });
});

