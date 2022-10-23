let ESX;
let carBlip;
let intr = setInterval(function(){
    if(!ESX){
        TriggerEvent('esx:getSharedObject', obj => ESX = obj);
    } else {
        clearInterval(intr);
    }
}, 15);

onNet('esx_phone:look_for_vehicle_nearby', plate => {
    emit('currentvehicle:startLooking', [{plate: plate}]);
});

on('currentvehicle:startLooking', vehicleList => {
    let res = ESX.Game.GetClosestVehicle();
    let veh = res[0], distance = res[1];

    if(veh == -1 || distance > 5 ){
    } else {
        let tempList = vehicleList.map(x => x.plate);
        let plate = GetVehicleNumberPlateText(veh);
        if(tempList.find(x => x === plate)){
            let data = {
                updateCurrentVehicle: true,
                vehicleData: {
                    vehicle: veh,
                    plate: plate,
                    lock: GetVehicleDoorLockStatus(veh),
                    health: GetVehicleBodyHealth(veh),
                    engineOn: IsVehicleEngineOn(veh),
                    engineHealth: GetVehicleEngineHealth(veh),
                    fuel: GetVehicleFuelLevel(veh),
                    tankHealth: GetVehiclePetrolTankHealth(veh),
                    headlights: {
                        left: IsHeadlightLBroken(veh),
                        right: IsHeadlightRBroken(veh)
                    }
                }
            }
            emit('esx_phone:vehicles_sendnui', data);
        }
    }
});

on('currentVehicle:showOnMap', veh => {
    if(carBlip){
        RemoveBlip(carBlip);
    }
    carBlip = AddBlipForEntity(veh);

    SetBlipSprite(carBlip, 326);
    BeginTextCommandSetBlipName("STRING")
    AddTextComponentString("Din bil")
    EndTextCommandSetBlipName(carBlip)
    SetBlipColour(carBlip, 17);
    console.log('Showing car on map.');
});

on('currentVehicle:hideOnMap', () => {
    if(carBlip){
        RemoveBlip(carBlip);
    }
})

on('currentvehicle:setLock', (veh, lock) => {
    SetVehicleDoorsLockedForAllPlayers(veh, lock);
});

onNet('esx_phone:update_vehicle', veh => {
    emit('currentvehicle:update', veh);
})

on('currentvehicle:update', veh => {
    console.log('Updating current vehicle from app.');
    let data = {
        updateCurrentVehicle: true,
        vehicleData: {
            vehicle: veh,
            plate: GetVehicleNumberPlateText(veh),
            lock: GetVehicleDoorLockStatus(veh),
            health: GetVehicleBodyHealth(veh),
            engineOn: IsVehicleEngineOn(veh),
            engineHealth: GetVehicleEngineHealth(veh),
            fuel: GetVehicleFuelLevel(veh),
            tankHealth: GetVehiclePetrolTankHealth(veh),
            headlights: {
                left: IsHeadlightLBroken(veh),
                right: IsHeadlightRBroken(veh)
            }
        }
    }
    emit('esx_phone:vehicles_sendnui', data);
})
