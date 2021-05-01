{
    init: function(elevators, floors) {
        var idleElevators = [];
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
                console.log("elevator ", index, " is about to idle");
                if (elevator.loadFactor() > 0) {
                    console.log("elevator ", index, " is a fucking idiot and thinks its idle with people in it");
                    console.log("destinationQueue: ", elevator.destinationQueue);
                }
                if (floors[elevator.currentFloor()].buttonStates.up == "activated") {
                    elevator.goingUpIndicator(true);
                    elevator.destinationQueue.push(elevator.currentFloor());
                    elevator.checkDestinationQueue();
                    console.log("elevator ", index, " going up from current floor");
                    return;
                } else if (floors[elevator.currentFloor()].buttonStates.down == "activated") {
                    elevator.goingDownIndicator(true);
                    elevator.destinationQueue.push(elevator.currentFloor());
                    elevator.checkDestinationQueue();
                    console.log("elevator ", index, " going down from current floor");
                    return;
                } else if (index >= elevators.length/2) { //If elevator is on upper half of building go in descending order
                    for (var i = floors.length - 1; i >= 0; i--) { 
                        if (floors[i].buttonStates.down == "activated") {
                            elevator.destinationQueue.push(floors[i].level); // Add active floor to destination queue
                            elevator.destinationQueue.sort(function(a, b) {
                                return a - b;
                            }); // Sort destination queue in ascending order
                            elevator.checkDestinationQueue(); // Update destination queue
                            elevator.goingDownIndicator(true);
                            console.log("elevator ", index, " headed to floor ", floors[i].level);
                            return;
                        } else if (floors[i].buttonStates.up == "activated") {
                            elevator.destinationQueue.push(floors[i].level); // Add active floor to destination queue
                            elevator.destinationQueue.sort(function(a, b) {
                                return a - b;
                            }); // Sort destination queue in ascending order
                            elevator.checkDestinationQueue(); // Update destination queue
                            elevator.goingUpIndicator(true);
                            console.log("elevator ", index, " headed to floor ", floors[i].level);
                            return;
                        }
                    }
                } else if (index < elevators.length/2) { //If elevator is on lower half of building go in descending order
                    for (var i = 0; i < floors.length; i++) { 
                        if (floors[i].buttonStates.up == "activated") {
                            elevator.destinationQueue.push(floors[i].level); // Add active floor to destination queue
                            elevator.destinationQueue.sort(function(a, b) {
                                return a - b;
                            }); // Sort destination queue in ascending order
                            elevator.checkDestinationQueue(); // Update destination queue
                            elevator.goingUpIndicator(true);
                            console.log("elevator ", index, " headed to floor ", floors[i].level);
                            return;
                        } else if (floors[i].buttonStates.down == "activated") {
                            elevator.destinationQueue.push(floors[i].level); // Add active floor to destination queue
                            elevator.destinationQueue.sort(function(a, b) {
                                return a - b;
                            }); // Sort destination queue in ascending order
                            elevator.checkDestinationQueue(); // Update destination queue
                            elevator.goingDownIndicator(true);
                            console.log("elevator ", index, " headed to floor ", floors[i].level);
                            return;
                        }
                    }
                } 
                console.log('elevator ', index, ' is truly idle');
                idleElevators.push(index);
                console.log("idleElevators: ", idleElevators);
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
                        }); // Sort destination queue in descending order
                        elevator.checkDestinationQueue(); // Update destination queue
                    } else {
                        elevator.goingDownIndicator(true); // Set elevator indicator
                        elevator.goingUpIndicator(false); // Set elevator indicator
                        elevator.destinationQueue.push(floorNum); // Add pressed floor to destination queue
                        elevator.destinationQueue.sort(function(a, b) {
                            return b - a;
                        }); // Sort destination queue in descending order
                        elevator.checkDestinationQueue(); // Update destination queue
                    }
                }
            });

            elevator.on("passing_floor", function(floorNum, direction) { // Check if elevator should stop
                if (elevator.loadFactor() < .7) {
                    if (direction === "up" && elevator.goingUpIndicator && floors[floorNum].buttonStates.up == "activated") { // If elevator is moving up
                        elevator.destinationQueue.push(floorNum); // Add pressed floor to destination queue
                        elevator.destinationQueue.sort(function(a, b) {
                            return a - b;
                        }); // Sort destination queue in ascending order
                        elevator.checkDestinationQueue(); // Update destination queue
                        console.log("elevator stopping at floor ", floorNum);
                    } else if (direction === "down" && elevator.goingDownIndicator && floors[floorNum].buttonStates.down == "activated") { // If elevator is moving down}
                        elevator.destinationQueue.push(floorNum); // Add pressed floor to destination queue
                        elevator.destinationQueue.sort(function(a, b) {
                            return b - a;
                        }); // Sort destination queue in ascending order
                        elevator.checkDestinationQueue(); // Update destination queue
                        console.log("elevator stopping at floor ", floorNum);
                    }
                }
            });
        });

        floors.forEach(function(floor, index) {
            floor.on("up_button_pressed", function() { // Check if there's already an elevator coming down; if not, add to needElevator array
                if (idleElevators.length > 0) { //check if any idle elevators
                    elevators[String(idleElevators[0])].goToFloor(floor.floorNum()); //Send most idle elevator to pickup
                    elevators[String(idleElevators[0])].goingUpIndicator(true); // Set elevator indicator
                    elevators[String(idleElevators[0])].goingDownIndicator(false); // Set elevator indicator
                    console.log('grabbing idle elevator ', idleElevators[0], ' to go up from floor ', floor.floorNum());
                    idleElevators.shift(); //Remove idle elevator now in motion
                } 
            });
            floor.on("down_button_pressed", function() { // Check if there's already an elevator coming down; if not, add to needElevator array
                if (idleElevators.length > 0) { //check if any idle elevators
                    elevators[String(idleElevators[0])].goToFloor(floor.floorNum()); //Send most idle elevator to pickup
                    elevators[String(idleElevators[0])].goingDownIndicator(true); // Set elevator indicator
                    elevators[String(idleElevators[0])].goingUpIndicator(false); // Set elevator indicator
                    console.log('grabbing idle elevator ', idleElevators[0], ' to go down from floor ', floor.floorNum());
                    idleElevators.shift(); //Remove idle elevator now in motion
                } 
            });
        });
    },
        update: function(dt, elevators, floors) {
            // We normally don't need to do anything here
        }
}
