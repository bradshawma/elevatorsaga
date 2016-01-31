function init(elevators, floors) {
    "use strict";
    var elevator, floor, needElevatorUp, needElevatorDown; // Declare variables
    elevator = elevators[0]; // Let's start with the first elevator
    floor = floors[0]; // Let's start with the first floor
    needElevatorUp = []; // List of floors that need an idle elevator to come by going up
    needElevatorDown = []; // List of floors that need an idle elevator to come by going up
    elevator.on("idle", function() { // Check if there is a floor that needs an elevator
        if (needElevatorUp.length > 0 && needElevatorUp.length >= needElevatorDown.length) { // Determine if more waiting for up or down
            elevator.destinationQueue = needElevatorUp[0]; // Go to longest waiting floor
            elevator.checkDestinationQueue(); // Update destination queue
            elevator.goingUpIndicator(true); // Set elevator indicator
            elevator.goingDownIndicator(false); // Set elevator indicator
            needElevatorUp.shift(); // Remove that floor from wait array
        } else {
            if (needElevatorDown.length > 0) { // Check if floor waiting for down elevator
                elevator.destinationQueue = [needElevatorDown[0]]; // Go to longest waiting floor 
                elevator.checkDestinationQueue(); // Update destination queue
                elevator.goingUpIndicator(false); // Set elevator indicator
                elevator.goingDownIndicator(true); // Set elevator indicator
                needElevatorDown.shift(); // Remove that floor from wait array
            }
        }
    });
    elevator.on("floor_button_pressed", function(floorNum) { // Add floors to destination queue
        if (floorNum > elevator.currentFloor()) { // Confirm direction match
            if (elevator.goingUpIndicator()) { // Confirm elevator is going up
                elevator.destinationQueue.push(floorNum); // Add pressed floor to destination queue
                elevator.destinationQueue.sort(function(a, b) {return a - b; }); // Sort destination queue in ascending order
                elevator.checkDestinationQueue(); // Update destination queue
            } else {
                elevator.goingUpIndicator = "true"; // Set elevator indicator
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
                elevator.goingDownIndicator = "true"; // Set elevator indicator
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
    floor.on("up_button_pressed", function() { // Check if there's already an elevator coming down; if not, add to needElevator array
        if (needElevatorUp.indexOf(floor.floorNum) === -1) { //Floor is not currently in needElevator array, check if elevator is already going to pass by
            if (elevator.goingUpIndicator() || elevator.currentFloor() < floor.floorNum || Math.max.apply(Math, elevator.destinationQueue) >= floor.floorNum) { // Check if elevator is passing by
                needElevatorUp.push(floor.floorNum); // No elevator is coming by, add to needElevator
            }
        }
    });
    floor.on("down_button_pressed", function() { // Check if there's already an elevator coming down; if not, add to needElevator array
        if (needElevatorDown.indexOf(floor.floorNum) === -1) { //Floor is not currently in needElevator array, check if elevator is already going to pass by
            if (elevator.goingDownIndicator() || elevator.currentFloor() > floor.floorNum || Math.min.apply(Math, elevator.destinationQueue) <= floor.floorNum) {
                needElevatorDown.push(floor.floorNum); // No elevator is coming by, add to needElevator
            }
        }
    });
}