// ===========================================================
// Tesing handling of various error conditions.  This requires
// setting up the solver incorrectly; e.g. missing arguments,
// backwards time order, inconsistent inputs, etc.
// Using Mocha and Chai.
// ===========================================================

var chai = require( "chai" );
var expect = chai.expect;
var rk45 = require( "../rk45.js" );

// ------------------------------------------------
// Setup the problem to solve.
// dy/dt = y - t^2 + 1; y(0) = 0.5
// Find the value of y(t) when t=2.
// HOWEVER: We're now looking for error conditions!
// ------------------------------------------------

var foo = new rk45.System();
var diffEqX0 = function( time, x ) { return (x[0]-time*time+1); }
var fn = [ diffEqX0 ];
var startX = [0.5];

foo.setStart(0.0);
foo.setStop(1.0);
foo.setInitX( startX );
foo.setFn( fn );
foo.setH( 0.1 );
foo.setTol( 1.0e-5 );

describe('Check setup of: dy/dt = y - t^2 + 1; y(0) = 0.5', function() {
    it('Check if (stop-start) is equal to zero', function() {
        foo.setStart(0.0);
        foo.setStop(0.0);
        var code = foo.checkSetUp();
        expect(code).to.equal('error');
    });
    it('Check if (stop-start) is less than zero', function() {
        foo.setStart(0.0);
        foo.setStop(-1.0);
        var code = foo.checkSetUp();
        expect(code).to.equal('error');
    });
    it('Check if (stop-start) is greater than zero', function() {
        foo.setStart(0.0);
        foo.setStop(1.0);
        var code = foo.checkSetUp();
        expect(code).to.equal('ok');
    });
    it('Check if dimension of initial values same as array of derivative functions', function() {
        foo.setInitX( [0.0,0.2] );
        foo.setFn( fn );
        var code = foo.checkSetUp();
        expect(code).to.equal('error');
    });
    it('Check if h is zero', function() {
        foo.setH(0.0);
        var code = foo.checkSetUp();
        expect(code).to.equal('error');
    });
    it('Check if h is less than zero', function() {
        foo.setH(-0.1);
        var code = foo.checkSetUp();
        expect(code).to.equal('error');
    });
});

describe('Check for run-time errors', function() {
    it('Check status on return from a good solution', function() {
        var fooA = new rk45.System();
        fooA.setStart(0.0);
        fooA.setStop(2.0);
        fooA.setInitX( startX );
        fooA.setFn( fn );
        fooA.solve();
        var status = fooA.getStatus();
        var flag = (status.success == true) && (status.state == 'complete');
        expect(flag).to.equal(true);
    });
    it('Check status on return from exceeding max count', function() {
        var fooA = new rk45.System();
        fooA.setStart(0.0);
        fooA.setStop(2.0);
        fooA.setInitX( startX );
        fooA.setFn( fn );
        fooA.setMaxCount(3);
        fooA.solve();
        var status = fooA.getStatus();
        var flag = (status.success == false) && (status.state == 'error');
        expect(flag).to.equal(true);
    });
});

