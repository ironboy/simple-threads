// Load modules
const simpleThreads = require('simple-threads');


// The require method of simpleThreads will let us require modules
// so that they are available in all threads as global variables.
//
// Use the form variableName:moduleName for each module.
// Or: If you don't provide a variable the name will be derived
// using snake-to-camelcase conversion: big-integer -> bigInteger etc.

simpleThreads.require(
  'Timer:precise-timer',
  'random-int',
  'big-integer',
  'fair-share'
);


// Max number of child processes - defaults to auto (which is the
// number of cpus detected by Node.js). You don't have to explicitly
// set auto - we just do it for clarity here.

simpleThreads.maxChildren = 'auto';


// Calculate Fibonacci numbers threaded and with interrupts

class Fibonacci {


  static async calc(n){
    // Run the method algo as a thread by using the run method
    // that simple-threads automatically adds to all functions
    return await this.algo.run(n);
  }

  // Calculate a fibonacci number
  static async algo(n){

    // We are using the npm module fair-share to run
    // several functions in parallel in one process/thread

    let req = n, share = new fairShare(),
        a = bigInteger(1), b = bigInteger(0);

    while (n--){
      let temp = a;
      a = a.plus(b);
      b = temp;
      await share.do(); // fairShare interrupt
    }

    return {
      request: req,
      stats: share.stats,
      result: b.toString()
    };

  }

}


// Calculate 50 Fibonacci numbers between 4000 and 40000

class Test {

  constructor(){
    Object.assign(this,{
      todo: 50,
      done: 0,
      timer: new Timer()
    });
    this.calc();
  }

  calc(){
    for(let i = 1; i <= this.todo; i++){
      Fibonacci.calc(randomInt(4000,40000)).then(
        (x)=>{this.result(i,x);}
      );
    }
  }

  result(i,x){
    console.log(
      'Test ' + i + '\n' +
      'time taken: ' + this.timer.elapsed +
      'ms' + '\n' + JSON.stringify(x,'',' ') + '\n\n'
    );
    this.done++;
    this.done == this.todo && this.report();
  }

  report(){
    console.log(
      'All ' + this.todo + ' done in ' + this.timer.elapsed + ' ms'
    );

    // Some statistics about cpu-usage etc from simpleThreads
    console.log('simpleThreads.stats:\n',simpleThreads.stats);
  }
}

new Test();
