var rk45 = require( "./rk45.js" );

var diffEqX0 = function( time, x ) {

    return (x[0]-time*time+1);
}

var fn = [ diffEqX0 ];

var foo = new rk45.System();

var startX = [0.5];

foo.setInitX( startX );
foo.setFn( fn );
foo.setStart( 0.0 );
foo.setStop( 2.0 );
foo.setH( 0.1 );
foo.setTol( 1.0e-6 );

var hrstart = process.hrtime();
foo.solve();
var hrend = process.hrtime(hrstart);

console.log(foo.newX);
console.log("Computed in %d iterations taking %ds %dms", foo.count, hrend[0], hrend[1]/1000000);
