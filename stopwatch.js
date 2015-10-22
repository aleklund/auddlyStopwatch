// adds a zero in front of numbers < 10
function checkTime(i) {
    if (i < 10) i = "0" + i;
    return i;
}

var tmPromise, auddlyStopwatch = angular.module('stopwatch',[]);

/**
 * @ngservice initService
 * @param $rootScope
 * initializing a place to put all the different values from the stopwatch
 **/
auddlyStopwatch.service('initService', function($rootScope) {
  this.timeSchedule = {
    history: []
  };
});

/**
 * total time is counted in milliseconds.
 * Adding a filter here to display time separated as hour:minute:second:millisecond
 **/
auddlyStopwatch.filter('niceDisplayTime', function() {

  return function(millisecs) {

    var output;
    
    if (millisecs == 0) {
    output = "00:00:00:000";	
    } else {
    var showMil = (millisecs.toString()).slice(-3); //showing only the last 3 numbers from the total milliseconds value
    var ms = Math.floor(millisecs/1000);
    var h =  checkTime(Math.floor(ms/3600));
        ms = Math.floor(ms%3600);
    var m = checkTime(Math.floor(ms/60));
        ms = Math.floor(ms%60);
    var s = checkTime(Math.floor(ms));
        output = h + ":" + m + ":" + s + ":" + showMil;
    }

    return output;

  }

});

/**
 *  @ngcontroller stopwatchCtrl
 *  @params  $scope, $timeout, $initService
 *  handle toggling between modes, and binding data
 **/
auddlyStopwatch.controller('stopwatchCtrl', ['$scope', '$timeout','initService', function ($scope, $timeout, initService) {

    $scope.timeStart = 0;
    $scope.timeEnd = 0;
    $scope.timeLapse = 0;
    $scope.totalTime = 0;
    $scope.lap = 1;
    $scope.controltime = 0;
    $scope.timeSchedule = initService.timeSchedule;
    $scope.mode = "Start";
    $scope.timer = 0;

    /**
     *  @func $scope.startTimer
     *  trigger to start the timer, 
     *  recursive, once called the function will loop until @func stopTimer is called
     **/
    $scope.startTimer = function () {
        // toggle
        $scope.mode = "Stop";
        
        // compute for the duration, get difference in time from startingpoint to now
        var today = new Date();
        $scope.timeEnd = today.getTime();
        $scope.timer = $scope.timeEnd - $scope.timeStart;
        
        // Repeat function every millisecond
        tmPromise = $timeout(function () {
            $scope.startTimer();
        }, 1);

    };

    /**
     * @func $scope.stopTimer
     * Stopping the watch and pushes values to timeSchedule and gets ready for the next lap
     **/
    $scope.stopTimer = function () {
        $scope.timeLapse = $scope.timeEnd - $scope.timeStart;
        // toggle
        $scope.mode = "Start";
        
        $scope.lapTime = ($scope.timeEnd - $scope.timeStart) - $scope.totalTime;  
    	$scope.totalTime = $scope.totalTime + $scope.lapTime;        
        // add to history
        $scope.timeSchedule.history.push([$scope.lap, $scope.lapTime, $scope.totalTime]);                                
        $scope.lap = $scope.lap + 1;  
        
        // stop timeout service
        $timeout.cancel(tmPromise); 
    };
    
    /**
     * @func $scope.pushLap
     * Pushes value of timer at the moment of being called
     * Used for continous adding to the timeSchedule ,can only be used when timer is running, 
     **/
    $scope.pushLap = function () {
    	if ($scope.mode == "Start") {
    	// button does nothing if the timer   	
    	} else {
    	$scope.lapTime = ($scope.timeEnd - $scope.timeStart) - $scope.totalTime;  
    	$scope.totalTime = $scope.totalTime + $scope.lapTime;        
        // add to history
        $scope.timeSchedule.history.push([$scope.lap, $scope.lapTime, $scope.totalTime]);                                
        $scope.lap = $scope.lap + 1;    
    	}                             
    };
    
    /**
     *  @func $scope.reset
     *  Resets all values, also emptying the timeSchedule
     **/     
    $scope.reset = function () {
    $timeout.cancel(tmPromise); 
    $scope.timeLapse = 0; 
    $scope.lapTime = 0;       
    $scope.mode = "Start";
    $scope.timer = 0; 
    this.timeSchedule = {
        history: []
    };
    $scope.totalTime = 0;
    $scope.lap = 1;                               
    };

    /**
     *  @func $scope.toggleTimer
     *  toggle between Start and Stop
     **/    
    $scope.toggleTimer = function () {

        // handle modes
        if ($scope.mode === 'Start') {
            var today = new Date();
            if ($scope.timer == 0) {
            $scope.timeStart = today.getTime();	
            } else {
            //subtract the "last saved time" from current time, to compensate for time passing since you pressed stop
            $scope.timeStart = today.getTime() - $scope.timeLapse;
            }
            $scope.startTimer();
        } else {
            $scope.stopTimer();
        }

    };
    
}]);


