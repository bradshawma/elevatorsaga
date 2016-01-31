{
    init: function(elevators, floors) {
        var elevator = elevators[0]; // Let's use the first elevator
		var needElevatorUp = []; // List of floors that need an idle elevator to come by going up
        var needElevatorDown = []; // List of floors that need an idle elevator to come by going up
        
        elevator.on("idle", function() { // Check if there is a floor that needs an elevator
            if(needElevatorUp.length > 0 && needElevatorUp.length >= needElevatorDown.length) { // Determine if more waiting for up or down
                elevator.destinationQueue == [needElevatorUp[0]]; // Go to longest waiting floor
                elevator.goingUpIndicator(true); // Set elevator indicator
                elevator.goingDownIndicator(false); // Set elevator indicator
                needElevatorUp.splice(0, 1); // Remove that floor from wait array
            }   else {
                    if(needElevatorDown.length > 0) { // Check if floor waiting for down elevator
                        elevator.destinationQueue == [needElevatorDown[0]]; // Go to longest waiting floor 
                        elevator.goingUpIndicator(false); // Set elevator indicator
                        elevator.goingDownIndicator(true); // Set elevator indicator
                        needElevatorDown.splice(0, 1); // Remove that floor from wait array
                    }   else {
                        // Idle for a bit, no floors are waiting                   
                        }    
                    }
        });
    
        elevator.on("floor_button_pressed", function(floorNum) { // Add floors to destination queue
            if(floorNum > elevator.currentFloor) { // Confirm direction match
                if elevator.goingUpIndicator() { // Confirm elevator is going up
                    elevator.destinationQueue.push(floorNum); // Add pressed floor to destination queue
                    elevator.destinationQueue.sort(function(a, b){return a-b}); // Sort destination queue in ascending order
                }   else { 
                        elevator.goingUpIndicator = "true"; // Set elevator indicator
                        elevator.destinationQueue.push(floorNum); // Add pressed floor to destination queue
                        elevator.destinationQueue.sort(function(a, b){return a-b}); // Sort destination queue in ascending order
                    }
            }   else if(floorNum < elevator.currentFloor) { // Confirm direction match
                    if elevator.goingDownIndicator() { // Confirm elevator is going down
                        elevator.destinationQueue.push(floorNum); // Add pressed floor to destination queue
                        elevator.destinationQueue.sort(function(a, b){return b-a}); // Sort destination queue in ascending order
                    }   else { 
                            elevator.goingDownIndicator = "true"; // Set elevator indicator
                            elevator.destinationQueue.push(floorNum); // Add pressed floor to destination queue
                            elevator.destinationQueue.sort(function(a, b){return b-a}); // Sort destination queue in ascending order
                        }
                }    
        });

        floor.on("up_button_pressed", function() { // Check if there's already an elevator coming down; if not, add to needElevator array
            if(needElevator.indexOf(floorNum) == -1) { //Floor is not currently in needElevator array, check if elevator is already going to pass by
                if(elevator.goingUpIndicator() && elevator.currentFloor < floorNum && Math.max.apply(Math, elevator.destinationQueue) >= floorNum) { // Do nothing, elevator is already passing by
                }   else { 
                        needElevatorUp.push(floorNum); // No elevator is coming by, add to needElevator
                    }
            }   else {
                //Floor is already in needElevator array, no need to add
                }
        });
    
        floor.on("down_button_pressed", function() { // Check if there's already an elevator coming down; if not, add to needElevator array
            if(needElevator.indexOf(floorNum) == -1) {
                //Floor is not currently in needElevator array, check if elevator is already going to pass by
                if(elevator.goingDownIndicator() && elevator.currentFloor > floorNum && Math.min.apply(Math, elevator.destinationQueue) <= floorNum) {
                    // Do nothing, elevator is already passing by
                }   else { 
                        needElevatorDown.push(floorNum); // No elevator is coming by, add to needElevator
                    }
            }   else {
                    //Floor is already in needElevator array, no need to add
                }
        });
    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
	// Check if there's already an elevator coming up; if not, add to needElevator array
	
			
		
})
    }
}