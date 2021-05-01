{
    init: function(elevators, floors) {
        var elevator = elevators[0]; // Let's use the first elevator
        var needElevatorUp = []; 
        var needElevatorDown = [];
        var idleElevators = [];
        var index = 0;
        elevator.goingUpIndicator(false);
        elevator.goingDownIndicator(false);
        idleElevators.push(index);

        // Whenever the elevator is idle (has no more queued destinations) ...
        elevator.on("idle", function() {
            console.log('elevator is idle');
            elevator.goingUpIndicator(false); 
            elevator.goingDownIndicator(false);
            if (needElevatorUp.length > 0 && needElevatorUp.length >= needElevatorDown.length) { // Determine if more waiting for up or down
                console.log("needElevatorUp higher priority: ", needElevatorUp);
                elevator.goingUpIndicator(true); // Set elevator indicator
                elevator.goingDownIndicator(false); // Set elevator indicator
                elevator.destinationQueue.push(needElevatorUp[0]); // Go to longest waiting floor
                elevator.checkDestinationQueue(); // Update destination queue
                needElevatorUp.shift(); // Remove that floor from wait array
            } else if (needElevatorDown.length > 0) { // Check if floor waiting for down elevator
                console.log("needElevatorDown higher priority: ", needElevatorDown);
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
                if (elevator.goingUpIndicator()) { // Confirm elevator is going up
                    elevator.destinationQueue.push(floorNum); // Add pressed floor to destination queue
                    elevator.destinationQueue.sort(function(a, b) {return a - b; }); // Sort destination queue in ascending order
                    elevator.checkDestinationQueue(); // Update destination queue
                } else {
                    elevator.goingUpIndicator(true); // Set elevator indicator
                    elevator.goingDownIndicator(false); // Set elevator indicator
                    elevator.destinationQueue.push(floorNum); // Add pressed floor to destination queue
                    elevator.destinationQueue.sort(function(a, b) {return a - b; }); // Sort destination queue in ascending order
                    elevator.checkDestinationQueue(); // Update destination queue
                }
            } else if (floorNum < elevator.currentFloor()) { // Confirm direction match
                if (elevator.goingDownIndicator()) { // Confirm elevator is going down
                    elevator.destinationQueue.push(floorNum); // Add pressed floor to destination queue
                    elevator.destinationQueue.sort(function(a, b) {return b - a; }); // Sort destination queue in ascending order
                    elevator.checkDestinationQueue(); // Update destination queue
                } else {
                    elevator.goingDownIndicator(true); // Set elevator indicator
                    elevator.goingUpIndicator(false); // Set elevator indicator
                    elevator.destinationQueue.push(floorNum); // Add pressed floor to destination queue
                    elevator.destinationQueue.sort(function(a, b) {return b - a; }); // Sort destination queue in ascending order
                    elevator.checkDestinationQueue(); // Update destination queue
                }
            }
        });
        
        elevator.on("passing_floor", function(floorNum, direction) { // Check if elevator should stop
            if (direction === "up") { // If elevator is moving up
                if (needElevatorUp.indexOf(floorNum) !== -1) { // Check if floor needs an up 
                    elevator.destinationQueue.push(floorNum); // Add pressed floor to destination queue
                    elevator.destinationQueue.sort(function(a, b) {return a - b; }); // Sort destination queue in ascending order
                    elevator.checkDestinationQueue(); // Update destination queue
                    needElevatorUp.shift(); // Remove that floor from wait array
                }
            } else if (direction === "down") { // If elevator is moving down}
                if (needElevatorDown.indexOf(floorNum) !== -1) { // Check if floor needs a down 
                    elevator.destinationQueue.push(floorNum); // Add pressed floor to destination queue
                    elevator.destinationQueue.sort(function(a, b) {return b - a; }); // Sort destination queue in ascending order
                    elevator.checkDestinationQueue(); // Update destination queue
                    needElevatorDown.shift(); // Remove that floor from wait array)
                }
            }
        });

        floors.forEach(function (floor, index) {
            floor.on("up_button_pressed", function() { // Check if there's already an elevator coming down; if not, add to needElevator array
                console.log('needElevatorUp: ', needElevatorUp);
                if (needElevatorUp.indexOf(floor.floorNum()) === -1) { //Floor is not currently in needElevator array, check if elevator is already going to pass by
                    console.log("Floor ", floor.floorNum(), " not present in needElevatorUp");
                    if (elevator.goingUpIndicator() && elevator.currentFloor() < floor.floorNum && Math.max.apply(Math, elevator.destinationQueue) >= floor.floorNum) { // Check if elevator is passing by
                        console.log("no need for new elevator call");
                    } else {
                        console.log("Floor ", floor.floorNum(), " about to be added to needElevatorUp");
                        needElevatorUp.push(floor.floorNum()); // No elevator is coming by, add to needElevator
                        console.log("needElevatorUp: ", needElevatorUp);
                        if (idleElevators.length > 0) { //check if any idle elevators
                            elevators[String(idleElevators[0])].goToFloor(floor.floorNum()); //Send most idle elevator to pickup
                            elevators[String(idleElevators[0])].goingUpIndicator(true); // Set elevator indicator
                            elevators[String(idleElevators[0])].goingDownIndicator(false); // Set elevator indicator
                            console.log("elevator ", idleElevators[0], " going to floor ", floor.floorNum());
                            idleElevators.shift(); //Remove idle elevator now in motion
                        } else {
                            console.log('no idle elevators available');
                        }    
                    }
                }
            });
            floor.on("down_button_pressed", function() { // Check if there's already an elevator coming down; if not, add to needElevator array
                console.log('needElevatorDown: ', needElevatorDown);
                if (needElevatorDown.indexOf(floor.floorNum()) === -1) { //Floor is not currently in needElevator array, check if elevator is already going to pass by
                    console.log("Floor ", floor.floorNum(), " not present in needElevatorDown");
                    if (elevator.goingDownIndicator() && elevator.currentFloor() > floor.floorNum && Math.min.apply(Math, elevator.destinationQueue) <= floor.floorNum) {
                        console.log("no need for new elevator call");
                    } else { //Floor needs to be added 
                        console.log("Floor ", floor.floorNum(), " about to be added to needElevatorDown");
                        needElevatorDown.push(floor.floorNum()); // No elevator is coming by, add to needElevator
                        console.log("needElevatorDown: ", needElevatorDown);
                        if (idleElevators.length > 0) { //check if any idle elevators
                            elevators[String(idleElevators[0])].goToFloor(floor.floorNum()); //Send most idle elevator to pickup
                            elevators[String(idleElevators[0])].goingDownIndicator(true); // Set elevator indicator
                            elevators[String(idleElevators[0])].goingUpIndicator(false); // Set elevator indicator
                            console.log("elevator ", idleElevators[0], " going to floor ", floor.floorNum());
                            idleElevators.shift(); //Remove idle elevator now in motion
                        } else {
                            console.log('no idle elevators available');
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
