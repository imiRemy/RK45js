// ==================================================
// Test default value instantiation in a RK45 object.
// Using Mocha and Chai.
// ==================================================

var chai = require( "chai" );
var expect = chai.expect;
var rk45 = require( "../rk45.js" );

var foo = new rk45.System();

describe('RK45 is the correct object', function() {
    it('RK45 should be an object', function() {
        expect(foo).to.be.an('object');
    });
    it('RK45 should be a instance of rk45.System', function() {
        expect(foo).to.be.an.instanceof(rk45.System);
    });
});

describe('RK45 default values', function() {
    it('Initial conditions are null', function() {
        expect(foo.x0).to.be.null;
    });
    it('Initial derivative functions are null', function() {
        expect(foo.fn).to.be.null;
    });
    it('Initial solved values are null', function() {
        expect(foo.newX).to.be.null;
    });
});

