// -------------------------------------------------------------------------------
// RK45js : A JavaScript implementation of the Runge-Kutta-Fehlberg method.
//
// The Runge-Kutta-Fehlberg method (RK45 method) is a numerical integration
// routine for solving systems of differential equations.  RK45 differs from
// the normal Runge-Kutta algorithm by featuring an adapative step size. As
// the integration proceeds, if the step size is too big (i.e. produces an
// error larger than a set value) then the step size is decreased until the
// error is within an acceptable value.  Conversely, if the error is much
// smaller than the tolerance, the step size is increased to improve computational
// efficiency.
//
// This implementation is written in JavaScript and is based loosely off an
// older C version I wrote some time ago.
//
// Features:
//      - Computational solver can be instantiated as an object.
//      - No fixed limit to the order (size) of the system that can be solved.
//      - Sanity checking built-in prior to starting computation.
//      - Unit test suite (Mocha + Chai) for testing your installation.
//
// Getting Started:
// At the most basic level, you need to do the following:
//      - Instantiate a solver
//      - Define the derivative function(s) you are solving
//      - Set the intial conditions
//      - Specify the start and stop values in the independent variable; e.g. time.
//      - Call the solver.
//      - Read out your answer!
//
// See the "rk45_sample.js" file for an example of getting started with a one
// degree of freedom (first order) system.
//
// Remy Malan
// February 2017
//
// License: MIT
// -------------------------------------------------------------------------------

var debug = require('debug')('rk45');

exports.System = function() {
    this.x0 = null;         // Array of initial conditions.
    this.fn = null;         // Array of functions to solve.
    this.newX = null;       // Array of solved values.
    this.h = 0.1;           // Time step.
    this.tol = 1.0e-5;      // Solution tolerance; used for adaptive step size adjustment.
    this.start = 0.0;       // Integration start time.
    this.stop = 1.0;        // Integration end time.
    this.R = null;          // Array for error calculations.
    this.delta = null;      // Array for step adjustment.
    this.count = 0;         // Count of how many steps of integration were done.
    this.maxCount = 2048;   // Watchdog value for integration loop counter.
    this.status =           // Error / success status.
        {success: false,    // True if solved correctly, false otherwise.
         state: 'init',     // Label of state of solver: 'init', 'solve', 'complete', 'error'
         message: null};    // More detailed info.
}

exports.System.prototype = {

    // Set initial conditions.
    setInitX:   function( initX ) { return this.x0 = initX; },
    setFn:      function( fn_array ) { return this.fn = fn_array; },
    setStart:   function( start_time ) { return this.start = start_time; },
    setStop:    function( stop_time ) { return this.stop = stop_time; },
    setH:       function( h ) { return this.h = h; },
    setTol:     function( tol ) { return this.tol = tol; },
    setMaxCount:function( maxCount ) { return this.maxCount = maxCount; },

    // Get status.
    getStatus:  function() { return this.status; },
    
    // Check that "obvious" issues are not present before trying to solve.
    checkSetUp: function() {
        if (this.start >= this.stop) {
            this.status.state = 'error';
            if (this.start == this.stop)
                this.status.message = 'Stop time same as start time.';
            else
                this.status.message = 'Stop time is less than start time.';
            return( this.status.state );
        }
        if (this.x0.length != this.fn.length) {
            this.status.state = 'error';
            this.status.message = 'Dimension of initial conditions not the same as dimension of functions.';
            return( this.status.state );
        }
        if (this.h <= 0) {
            this.status.state = 'error';
            if (this.h == 0.0)
                this.status.message = 'h is zero but must be a positive number.';
            else
                this.status.message = 'h is less than zero but must be a positive number.';
            return( this.status.state );
        }
        return( 'ok' );
    },
 
    // Compute 'k' coefficients, k1 - k6.
    computeK:   function(t) {
        var t_new = t;
        var x_new = this.newX.slice();
        var dimension = this.x0.length;
        var k = new Array(dimension);
        // k1
        for (var i=0; i<dimension; i++) {
            k[i] = new Array(6);
            k[i][0] = this.h * this.fn[i](t_new,x_new);
        }
        // k2
        t_new = t + this.h / 4.0;
        for (var i=0; i<dimension; i++) {
            x_new[i] = this.newX[i] + k[i][0] / 4.0;
        }
        for (var i=0; i<dimension; i++) {
            k[i][1] = this.h * this.fn[i](t_new,x_new);
        }
        // k3
        t_new = t + this.h * 3.0 / 8.0;
        for (var i=0; i<dimension; i++) {
            x_new[i] = this.newX[i] + (3.0*k[i][0] + 9.0*k[i][1])/32.0;
        }
        for (var i=0; i<dimension; i++) {
            k[i][2] = this.h * this.fn[i](t_new,x_new);
        }
        // k4
        t_new = t + this.h * 12.0 / 13.0;
        for (var i=0; i<dimension; i++) {
            x_new[i] = this.newX[i] + (1932.0*k[i][0] - 7200.0*k[i][1] + 7296.0*k[i][2])/2197.0;
        }
        for (var i=0; i<dimension; i++) {
            k[i][3] = this.h * this.fn[i](t_new,x_new);
        }
        // k5
        t_new = t + this.h;
        for (var i=0; i<dimension; i++) {
            x_new[i] = this.newX[i] + 439.0*k[i][0]/216.0 - 8.0*k[i][1] + 3680.0*k[i][2]/513.0 - 845.0*k[i][3]/4104.0;
        }
        for (var i=0; i<dimension; i++) {
            k[i][4] = this.h * this.fn[i](t_new,x_new);
        }
        // k6
        t_new = t + this.h / 2.0;
        for (var i=0; i<dimension; i++) {
            x_new[i] = this.newX[i] - 8.0*k[i][0]/27.0 + 2.0*k[i][1] - 3544.0*k[i][2]/2565.0 + 1859.0*k[i][3]/4104.0 - 11.0*k[i][4]/40.0;
        }
        for (var i=0; i<dimension; i++) {
            k[i][5] = this.h * this.fn[i](t_new,x_new);
        }
        
        return( k );
    },

    // Run computation loop.
    solve:      function() {

        // Check for inconsistencies in user inputs.
        if (this.checkSetUp() != 'ok') {
            return;
        }

        var dimension = this.x0.length;         // Dimension or order of the system.
        var t = this.start;                     // Time variable.

        this.newX = new Array( dimension );
        this.newX = this.x0                     // Output is set to initial values.
        this.R = new Array( dimension );
        this.delta = new Array( dimension );

        this.count = 0;                         // Set loop counter to zero.

        while (t < this.stop) {

            debug("t: "+t+", newX: "+this.newX);
            
            // Compute the 'k' coefficients.
            var k = this.computeK(t);

            for (var i=0; i<k.length; i++) {
                debug("k["+i+"]: "+k[i]);
//                for (var j=0; j<k[i].length; j++)
//                   debug("k["+i+"]["+j+"]: "+k[i][j]);
            }
            
            // Compute error estimates and
            // step size adjustment.
            
            for (var i=0; i<dimension; i++) {
                this.R[i] = Math.abs( k[i][0]/360.0 - 128.0*k[i][2]/4275.0 - 2197.0*k[i][3]/75240.0 + k[i][4]/50.0 + 2*k[i][5]/55.0 );
                this.R[i] = this.R[i] / this.h;
                this.delta[i] = 0.84*Math.pow((this.tol/this.R[i]),0.25);
            }
            
            debug("delta: " + this.delta + "; min: " + Math.min.apply(null, this.delta));

            if (Math.max.apply(null,this.R) <= this.tol)  {
                debug("Good to compute!");
                t = t + this.h;
                for (var i=0; i<dimension; i++) {
                    this.newX[i] = this.newX[i] + (25.0*k[i][0]/216.0 + 1408.0*k[i][2]/2565.0 + 2197.0*k[i][3]/4104.0 - k[i][4]/5.0);
                }
                this.h = this.h * Math.min.apply(null, this.delta);
            }
            else {
                debug("Need to adjust step size, max R: "+Math.max.apply(null,this.R));
                debug("Scale factor: "+Math.min.apply(null, this.delta));
                this.h = this.h * Math.min.apply(null, this.delta);
            }
            
    		if (this.h >= (this.stop - t))
			    this.h = this.stop - t;
		    
		    if (this.count++ > this.maxCount) {
			    break;
			}
        }
        
        // Check why loop stopped.
 
 		if (this.count++ > this.maxCount) {
		    this.status.success = false;
		    this.status.state = 'error';
		    this.status.message = 'Iteration count exceeded MAX count (' + this.maxCount + ')';
        }
        else if (t >= this.stop) {
		    this.status.success = true;
		    this.status.state = 'complete';
		    this.status.message = 'Integration completed sucessfully.';
        }  
    }
        
}

