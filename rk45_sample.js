// ---------------------------------------------------------------------
// Sample use of the RK45js code.  In this case solving an ODE (Ordinary
// Differential Equation) of the form:
//
//                  dy/dt = y - t^2 + 1; y(0) = 0.5
//
// Find the value of y(t) when t=2.
//
// Note: in the code you will not see a reference to a variable 'y'.
//       Rather, you will see a reference to X0.  The solver uses
//       generalized coordinates (x0, x1, x2, ..., xN) rather than
//       referring to 'x', 'y', 'z', etc.
// ---------------------------------------------------------------------

var rk45 = require( "./rk45.js" );

// ------------------------------------------
// Set up equation(s) and initial conditions.
// ------------------------------------------

var diffEqX0 = function( time, x ) { return (x[0]-time*time+1); }
var initCoord = [ 0.5 ];

// -------------------------
// Create a new RK45 solver.
// -------------------------

var foo = new rk45.System();

foo.setStart( 0.0 );        // Initial start time, t=0.
foo.setStop( 2.0 );         // Time at which we want a solution, t=2.
foo.setInitX( initCoord );  // y(0) -- value of y when t=0.
foo.setFn( [diffEqX0] );    // Differential equation we're solving.

// ---------------------------------------------------------
// Call the solver function: foo.solve().
// Bracket with calls hrtime calls to see how long it takes.
// ---------------------------------------------------------

var hrstart = process.hrtime();
foo.solve();
var hrend = process.hrtime(hrstart);

// ---------------------------------------
// Check status of result.  Should be o.k.
// ---------------------------------------

var status = foo.getStatus();

console.log("status: \n\tsuccess: %s\n\tstate: %s\n\tmessage: %s", status.success, status.state, status.message);

// -------------
// Print result.
// -------------

console.log("result: " + foo.newX);
console.log("Computed in %d iterations taking %ds %dms", foo.count, hrend[0], hrend[1]/1000000);
