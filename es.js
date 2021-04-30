{
    init: function(elevators, floors) {
        var elevator = elevators[0]; // Let's use the first elevator
        var needElevatorUp = []; 
        var needElevatorDown = [];
        var idleElevators = [];
        // Whenever the elevator is idle (has no more queued destinations) ...
        elevator.on("idle", function() {
            // let's go to all the floors (or did we forget one?)
            elevator.goToFloor(0);
            elevator.goToFloor(1);
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
                            elevators[String(idleElevators[0])].goingUpIndicator(true); // Set elevator indicator
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
