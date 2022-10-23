onNet('esx_phone:honk_vehicle', veh => {
    console.log('Honking vehicle: ', veh);
    StartVehicleHorn(veh, 800, 'HELDDOWN');
})

onNet('esx_phone:toggleEngine', (veh, val) => {
    console.log('Setting engine state for vehicle: ' + veh + ' to ' + val);
    SetVehicleEngineOn(veh, val, true, true)
})
