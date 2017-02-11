var x = Math.abs(-2);

console.log(x);

var System = function() {
    this.x0 = null;         // Array of initial conditions.
    this.fn = null;         // Array of functions to solve.
    this.newX = null;       // Array of solved values.
    this.h = 0.1;           // Time step.
    this.tol = 1.0e-5;      // Solution tolerance; used for adaptive step size adjustment.
    this.start = 0.0;       // Integration start time.
    this.stop = 1.0;        // Integration end time.
    this.R = null;          // Array for error calculations.
    this.delta = null;      // Array for step adjustment.
}

System.prototype = {

    // Set initial conditions.
    setInitX:   function( initX ) { return this.x0 = initX; },
    setFn:      function( fn_array ) { return this.fn = fn_array; },
    setStart:   function( start_time ) { return this.start = start_time; },
    setStop:    function( stop_time ) { return this.stop = stop_time; },
    setH:       function( h ) { return this.h = h; },
    setTol:     function( tol ) { return this.tol = tol; },

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

        var dimension = this.x0.length;         // Dimension or order of the system.
        var t = this.start;                     // Time variable.
        var count = 0;                          // Loop counter.
        var maxCount = 256;                     // Watchdog value on loop counter, not to exceed.

        this.newX = new Array( dimension );
        this.newX = this.x0                     // Output is set to initial values.
        this.R = new Array( dimension );
        this.delta = new Array( dimension );

        while (t < this.stop) {

            console.log("t: "+t+", newX: "+this.newX);
            
            // Compute the 'k' coefficients.
            var k = this.computeK(t);

            for (var i=0; i<k.length; i++) {
                console.log("k["+i+"]: "+k[i]);
//                for (var j=0; j<k[i].length; j++)
//                   console.log("k["+i+"]["+j+"]: "+k[i][j]);
            }
            
            // Compute error estimates and
            // step size adjustment.
            
            for (var i=0; i<dimension; i++) {
                this.R[i] = Math.abs( k[i][0]/360.0 - 128.0*k[i][2]/4275.0 - 2197.0*k[i][3]/75240.0 + k[i][4]/50.0 + 2*k[i][5]/55.0 );
                this.R[i] = this.R[i] / this.h;
                this.delta[i] = 0.84*Math.pow((this.tol/this.R[i]),0.25);
            }
            
            console.log("delta: " + this.delta + "; min: " + Math.min.apply(null, this.delta));

            if (Math.max.apply(null,this.R) <= this.tol)  {
                console.log("Good to compute!");
                t = t + this.h;
                for (var i=0; i<dimension; i++) {
                    this.newX[i] = this.newX[i] + (25.0*k[i][0]/216.0 + 1408.0*k[i][2]/2565.0 + 2197.0*k[i][3]/4104.0 - k[i][4]/5.0);
                }
                this.h = this.h * Math.min.apply(null, this.delta);
            }
            else {
                console.log("Need to adjust step size, max R: "+Math.max.apply(null,this.R));
                console.log("Scale factor: "+Math.min.apply(null, this.delta));
                this.h = this.h * Math.min.apply(null, this.delta);
            }
            
    		if (this.h >= (this.stop - t))
			    this.h = this.stop - t;
		    
		    if (count++ > maxCount)
			    break;
        }
    }
        
}

// The 'K' coefficients 

var Kmatrix = function() {
    this.k1 = null;
    this.k2 = null;
    this.k3 = null;
    this.k4 = null;
    this.k5 = null;
    this.k6 = null;
}

Kmatrix.prototype = {

    compute: function() {
    },
}

var diffEqX0 = function( time, x ) {

    return (x[0]-time*time+1);
}

//var diffEqX1 = function( time, x ) {
//
//    return ( -9.81 * Math.sin( x[0] ));
//}

//var fn = [ diffEqX0, diffEqX1 ];
var fn = [ diffEqX0 ];

var foo = new System();
//var startX = [0.2,0.0];
var startX = [0.5];

foo.setInitX( startX );
foo.setFn( fn );
foo.setStart( 0.0 );
foo.setStop( 2.0 );
foo.solve();
console.log(foo.newX);



