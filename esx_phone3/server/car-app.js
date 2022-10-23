let spawnedVehicles = [];

onNet('ls:mainCheck', (plate, vehicle) => {
    spawnedVehicles.push({plate: plate.replace(' ', '').replace(' ', ''), vehicle: vehicle});
});

onNet('esx_phone:remove_spawned_car', plate => {
    let found = spawnedVehicles.find(x => x.plate == plate);
    if(found){
        let index = spawnedVehicles.indexOf(found);
        spawnedVehicles.splice(index, 1);
    } else {
        //console.log('car-app.js: Did not find plate "' + plate + '" in spawnedVehicles')
    }
});

onNet('esx_phone:update_current_vehicle', plate => {
    //console.log('Updating current vehicle.');
    let found = spawnedVehicles.find(x => x.plate === plate);

    /* Om bilen redan har tagits fram ur garaget så uppdaterar vi direkt. Annars letar vi i närheten. */
    if(found){
        emitNet('esx_phone:update_vehicle', source, found.vehicle);
    } else {
        emitNet('esx_phone:look_for_vehicle_nearby', source, plate);
    }
});


onNet('esx_phone:honk_vehicle', veh => {
    emitNet('esx_phone:honk_vehicle', -1, veh);
});

onNet('esx_phone:toggleEngine', (veh, val) => {
    emitNet('esx_phone:toggleEngine', -1, veh, val);
});
