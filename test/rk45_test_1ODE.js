// =========================================================
// Test solving a single ODE.  This test chooses an ODE that
// has an escat analytical solution so that the numercially
// computed value can be compared to the analytical result.
// Using Mocha and Chai.
// =========================================================

var chai = require( "chai" );
var expect = chai.expect;
var rk45 = require( "../rk45.js" );

// --------------------------------
// Setup the problem to solve.
// dy/dt = y - t^2 + 1; y(0) = 0.5
// Find the value of y(t) when t=2.
// --------------------------------

var foo = new rk45.System();
var diffEqX0 = function( time, x ) { return (x[0]-time*time+1); }
var fn = [ diffEqX0 ];
var startX = [0.5];

foo.setInitX( startX );
foo.setFn( fn );
foo.setStart( 0.0 );
foo.setStop( 2.0 );
foo.setH( 0.1 );
foo.setTol( 1.0e-5 );
foo.solve();

describe('Solving an ODE: dy/dt = y - t^2 + 1; y(0) = 0.5', function() {
    it('Solver iterated over problem', function() {
        expect(foo.count).to.be.at.least(1);
    });
    it('Output is not null', function() {
        expect(foo.newX).to.not.be.null;
    });
    it('Output is an array', function() {
        expect(foo.newX).to.be.an('array');
    });
    it('Output has length of 1', function() {
        expect(foo.newX).to.have.lengthOf(1);
    });
    it('Check value at y(2), should be 5.3054719...', function() {
        expect(foo.newX[0]).to.be.closeTo(5.305472,0.0001);
    });
});

