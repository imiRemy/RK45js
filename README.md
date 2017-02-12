# RK45js
JavaScript Implementation of Runge-Kutta-Fehlberg Numerical Integration

The Runge-Kutta-Fehlberg method (RK45 method) is a numerical integration routine for solving systems of differential equations.  RK45 differs from the normal Runge-Kutta algorithm by featuring an adapative step size. As the integration proceeds, if the step size is too big (i.e. produces an error larger than a set value) then the step size is decreased until the error is within an acceptable value.  Conversely, if the error is much smaller than the tolerance, the step size is increased to improve computational efficiency.

This implementation is written in JavaScript and is based loosely off an older C version I wrote some time ago.

Features:
- Computational solver can be instantiated as an object.
- No fixed limit to the order (size) of the system that can be solved.
- Sanity checking built-in prior to starting computation.
- Unit test suite (Mocha + Chai) for testing your installation.

Getting Started:
At the most basic level, you need to do the following:
- Instantiate a solver
- Define the derivative function(s) you are solving
- Set the intial conditions
- Specify the start and stop values in the independent variable; e.g. time.
- Call the solver.
- Read out your answer!

See the "rk45_sample.js" file for an example of getting started with a one degree of freedom (first order) system.

License: MIT
