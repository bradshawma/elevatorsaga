{
    init: function(elevators, floors) {
        var elevator = elevators[0]; // Let's use the first elevator
        var needElevatorUp = [];
        var needElevatorDown = [];
        var idleElevators = [];
        var index = 0;
        elevator.goingUpIndicator(false);
        elevator.goingDownIndicator(false);
        console.log(elevators);


        //Function to remove floors from needElevator arrays
        function removeFloor(floorArray, floorNum) { 

            return floorArray.filter(function(floor){ 
                return floor != floorNum; 
            });
        }

        elevators.forEach(function(elevator, index) {
            // Whenever the elevator is idle (has no more queued destinations) ...
            elevator.on("idle", function() {
                elevator.goingUpIndicator(false);
                elevator.goingDownIndicator(false);
                console.log("elevator is about to idle");
                if (floors[elevator.currentFloor()].buttonStates.up == "activated") {
                    elevator.goingUpIndicator(true);
                    elevator.destinationQueue.push(elevator.currentFloor());
                    elevator.checkDestinationQueue();
                    needElevatorUp = removeFloor(needElevatorUp, elevator.floorNum);
                } else if (floors[elevator.currentFloor()].buttonStates.down == "activated") {
                    elevator.goingDownIndicator(true);
                    elevator.destinationQueue.push(elevator.currentFloor());
                    elevator.checkDestinationQueue();
                    needElevatorDown = removeFloor(needElevatorDown, elevator.floorNum);
                }
                if (needElevatorUp.length > 0 && needElevatorUp.length >= needElevatorDown.length) { // Determine if more waiting for up or down
                    elevator.goingUpIndicator(true); // Set elevator indicator
                    elevator.goingDownIndicator(false); // Set elevator indicator
                    elevator.destinationQueue.push(needElevatorUp[0]); // Go to longest waiting floor
                    elevator.checkDestinationQueue(); // Update destination queue
                    needElevatorUp.shift(); // Remove that floor from wait array
                } else if (needElevatorDown.length > 0) { // Check if floor waiting for down elevator
                    elevator.goingUpIndicator(false); // Set elevator indicator
                    elevator.goingDownIndicator(true); // Set elevator indicator
                    elevator.destinationQueue.push(needElevatorDown[0]); // Go to longest waiting floor
                    elevator.checkDestinationQueue(); // Update destination queue
                    needElevatorDown.shift(); // Remove that floor from wait array
                } else { //Elevator is truly idle
                    console.log('elevator is truly idle');
                    idleElevators.push(index);
                }
            });

            elevator.on("floor_button_pressed", function(floorNum) { // Add floors to destination queue
                if (floorNum > elevator.currentFloor()) { // Confirm direction match
                    if (elevator.goingUpIndicator) { // Confirm elevator is going up
                        elevator.destinationQueue.push(floorNum); // Add pressed floor to destination queue
                        elevator.destinationQueue.sort(function(a, b) {
                            return a - b;
                        }); // Sort destination queue in ascending order
                        elevator.checkDestinationQueue(); // Update destination queue
                    } else {
                        elevator.goingUpIndicator(true); // Set elevator indicator
                        elevator.goingDownIndicator(false); // Set elevator indicator
                        elevator.destinationQueue.push(floorNum); // Add pressed floor to destination queue
                        elevator.destinationQueue.sort(function(a, b) {
                            return a - b;
                        }); // Sort destination queue in ascending order
                        elevator.checkDestinationQueue(); // Update destination queue
                    }
                } else if (floorNum < elevator.currentFloor()) { // Confirm direction match
                    if (elevator.goingDownIndicator) { // Confirm elevator is going down
                        elevator.destinationQueue.push(floorNum); // Add pressed floor to destination queue
                        elevator.destinationQueue.sort(function(a, b) {
                            return b - a;
                        }); // Sort destination queue in ascending order
                        elevator.checkDestinationQueue(); // Update destination queue
                    } else {
                        elevator.goingDownIndicator(true); // Set elevator indicator
                        elevator.goingUpIndicator(false); // Set elevator indicator
                        elevator.destinationQueue.push(floorNum); // Add pressed floor to destination queue
                        elevator.destinationQueue.sort(function(a, b) {
                            return b - a;
                        }); // Sort destination queue in ascending order
                        elevator.checkDestinationQueue(); // Update destination queue
                    }
                }
            });

            elevator.on("passing_floor", function(floorNum, direction) { // Check if elevator should stop
                if (direction === "up" && elevator.goingUpIndicator && floors[floorNum].buttonStates.up == "activated") { // If elevator is moving up
                    needElevatorUp = removeFloor(needElevatorUp, floorNum);
                    elevator.destinationQueue.push(floorNum); // Add pressed floor to destination queue
                    elevator.destinationQueue.sort(function(a, b) {
                        return a - b;
                    }); // Sort destination queue in ascending order
                    elevator.checkDestinationQueue(); // Update destination queue
                    console.log("elevator stopping at floor ", floorNum);
                } else if (direction === "down" && elevator.goingDownIndicator && floors[floorNum].buttonStates.down == "activated") { // If elevator is moving down}
                    needElevatorDown = removeFloor(needElevatorDown, floorNum);
                    elevator.destinationQueue.push(floorNum); // Add pressed floor to destination queue
                    elevator.destinationQueue.sort(function(a, b) {
                        return b - a;
                    }); // Sort destination queue in ascending order
                    elevator.checkDestinationQueue(); // Update destination queue
                    console.log("elevator stopping at floor ", floorNum);
                }
            });
        });

        floors.forEach(function(floor, index) {
            floor.on("up_button_pressed", function() { // Check if there's already an elevator coming down; if not, add to needElevator array
                if (needElevatorUp.indexOf(floor.floorNum()) === -1) { //Floor is not currently in needElevator array, check if elevator is already going to pass by
                    if (elevator.goingUpIndicator() && elevator.currentFloor() < floor.floorNum && Math.max.apply(Math, elevator.destinationQueue) >= floor.floorNum) { // Check if elevator is passing by
                        console.log("no need for new elevator call");
                    } else {
                        if (idleElevators.length > 0) { //check if any idle elevators
                            elevators[String(idleElevators[0])].goToFloor(floor.floorNum()); //Send most idle elevator to pickup
                            elevators[String(idleElevators[0])].goingUpIndicator(true); // Set elevator indicator
                            elevators[String(idleElevators[0])].goingDownIndicator(false); // Set elevator indicator
                            idleElevators.shift(); //Remove idle elevator now in motion
                            console.log('grabbing idle elevator to go up from floor ', floor.floorNum());
                        } else {
                            needElevatorUp.push(floor.floorNum()); // No elevator is coming by, add to needElevator
                            console.log('no idle elevators available, adding floor to needElevatorUp', needElevatorUp);
                        }
                    }
                }
            });
            floor.on("down_button_pressed", function() { // Check if there's already an elevator coming down; if not, add to needElevator array
                if (needElevatorDown.indexOf(floor.floorNum()) === -1) { //Floor is not currently in needElevator array, check if elevator is already going to pass by
                    if (elevator.goingDownIndicator() && elevator.currentFloor() > floor.floorNum && Math.min.apply(Math, elevator.destinationQueue) <= floor.floorNum) {
                        console.log("no need for new elevator call");
                    } else { //Floor needs to be added 
                        if (idleElevators.length > 0) { //check if any idle elevators
                            elevators[String(idleElevators[0])].goToFloor(floor.floorNum()); //Send most idle elevator to pickup
                            elevators[String(idleElevators[0])].goingDownIndicator(true); // Set elevator indicator
                            elevators[String(idleElevators[0])].goingUpIndicator(false); // Set elevator indicator
                            idleElevators.shift(); //Remove idle elevator now in motion
                            console.log('grabbing idle elevator to go down from floor ', floor.floorNum());
                        } else {
                            needElevatorDown.push(floor.floorNum()); // No elevator is coming by, add to needElevator
                            console.log('no idle elevators available, adding floor to needElevatorDown', needElevatorDown);
                        }
                    }
                }
            });
        });
    },
        update: function(dt, elevators, floors) {
            // We normally don't need to do anything here
        }
}
