local Keys = {
  ["ESC"] = 322, ["F1"] = 288, ["F2"] = 289, ["F3"] = 170, ["F5"] = 166, ["F6"] = 167, ["F7"] = 168, ["F8"] = 169, ["F9"] = 56, ["F10"] = 57,
  ["~"] = 243, ["1"] = 157, ["2"] = 158, ["3"] = 160, ["4"] = 164, ["5"] = 165, ["6"] = 159, ["7"] = 161, ["8"] = 162, ["9"] = 163, ["-"] = 84, ["="] = 83, ["BACKSPACE"] = 177,
  ["TAB"] = 37, ["Q"] = 44, ["W"] = 32, ["E"] = 38, ["R"] = 45, ["T"] = 245, ["Y"] = 246, ["U"] = 303, ["P"] = 199, ["["] = 39, ["]"] = 40, ["ENTER"] = 18,
  ["CAPS"] = 137, ["A"] = 34, ["S"] = 8, ["D"] = 9, ["F"] = 23, ["G"] = 47, ["H"] = 74, ["K"] = 311, ["L"] = 182,
  ["LEFTSHIFT"] = 21, ["Z"] = 20, ["X"] = 73, ["C"] = 26, ["V"] = 0, ["B"] = 29, ["N"] = 249, ["M"] = 244, [","] = 82, ["."] = 81,
  ["LEFTCTRL"] = 36, ["LEFTALT"] = 19, ["SPACE"] = 22, ["RIGHTCTRL"] = 70,
  ["HOME"] = 213, ["PAGEUP"] = 10, ["PAGEDOWN"] = 11, ["DELETE"] = 178,
  ["LEFT"] = 174, ["RIGHT"] = 175, ["TOP"] = 27, ["DOWN"] = 173,
  ["NENTER"] = 201, ["N4"] = 108, ["N5"] = 60, ["N6"] = 107, ["N+"] = 96, ["N-"] = 97, ["N7"] = 117, ["N8"] = 61, ["N9"] = 118
}

local GUI                        = {}
local PhoneData                  = {phoneNumber = 0, contacts = {}, encryptingCard = false}
local RegisteredMessageCallbacks = {}
local ContactJustAdded           = false
local CurrentAction              = nil
local CurrentActionMsg           = ''
local CurrentActionData          = {}
local CurrentDispatchRequestId   = -1
local PhoneNumberSources         = {}
local BlockedNumbers             = {}
local CellphoneObject            = nil
local CallStartTime              = nil
local OnCall                     = false
local Flightmode                 = false
local AudioDisabled              = false
local MicrophoneDisabled         = false
local settingsLoadedFromDatabase = false
local Sharelocation              = false
local GUI                        = {}
GUI.IsOpen                       = false
GUI.HasFocus                     = false

local phoneBattery = 100

ESX = nil

Citizen.CreateThread(function()

  while ESX == nil do
    TriggerEvent('esx:getSharedObject', function(obj) ESX = obj end)
    Citizen.Wait(0)
  end

  ESX.UI.Menu.RegisterType('phone', OpenPhone, ClosePhone)

  if ESX.IsPlayerLoaded() then
    TriggerServerEvent('esx_phone:load_twittername')
    TriggerServerEvent('esx_phone:load_latest')
    TriggerServerEvent('esx_phone:load_favorites')
    TriggerServerEvent('esx_phone:load_photos')

    PlayerData = ESX.GetPlayerData()
  end
end)

RegisterNetEvent('esx_phone:vehicles_sendnui')
AddEventHandler('esx_phone:vehicles_sendnui', function(data)
  local spawnedVehicles = ESX.Game.GetVehicles()

  if data['vehicles'] ~= nil then
    for i = 1, #spawnedVehicles do
      local spawnedVehicle = spawnedVehicles[i]

      for k, v in pairs(data['vehicles']) do
        if v["plate"] == GetVehicleNumberPlateText(spawnedVehicle) then
          local model = GetEntityModel(spawnedVehicle)
          local name = GetLabelText(GetDisplayNameFromVehicleModel(model))

          data["first"] = k - 1

          data['vehicles'][k]['name'] = name
          data['vehicles'][k]['class'] = GetVehicleClassFromName(name)
          data['vehicle']["vehicle"] = spawnedVehicle
          data['vehicles'][k]["vehicle"] = spawnedVehicle
        end
      end
    end
  end

  if data['found'] == true then
      TriggerEvent('currentvehicle:update', data['vehicle']['vehicle'])
  end

  SendNUIMessage(data)
end)

RegisterNetEvent('esx_phone:sendnui')
AddEventHandler('esx_phone:sendnui', function(data)
    SendNUIMessage(data)
end)

RegisterNetEvent('esx_phone:set_client_blocked_list')
AddEventHandler('esx_phone:set_client_blocked_list', function(data)
    BlockedNumbers = data
end)

getBattery = function()
  return phoneBattery
end


function OpenPhone()

  if phoneBattery <= 0 then
    ESX.ShowNotification("Din iPhone 8 är död")
    return
  end

  GUI.IsOpen      = true
  GUI.HasFocus    = false
  local playerPed = GetPlayerPed(-1)

  TriggerServerEvent('esx_phone:reload', PhoneData.phoneNumber)

  SendNUIMessage({
    showPhone = true
  })

  local coords     = GetEntityCoords(playerPed)
  local bone       = GetPedBoneIndex(playerPed, 28422)
  local phoneModel = GetHashKey('prop_phone_ing')

  ePhoneInAnim()

end

function ClosePhone()

  GUI.IsOpen      = false
  GUI.HasFocus    = false
  local playerPed = GetPlayerPed(-1)

  SendNUIMessage({
    showPhone = false
  })

  SetNuiFocus(false)

  ePhoneOutAnim()

end

RegisterCommand("changebattery", function(source, args)
  args[1] = tonumber(args[1])

  phoneBattery = args[1]

  SendNUIMessage({
    updateBattery = true,
    battery = args[1]
  })
end)
  
RegisterNetEvent("esx_phone3:changeBattery")
AddEventHandler("esx_phone3:changeBattery", function(newBattery)
  phoneBattery = tonumber(newBattery)

  SendNUIMessage({
    updateBattery = true,
    battery = newBattery
  })
end)


RegisterNetEvent('esx:playerLoaded')
AddEventHandler('esx:playerLoaded', function(xPlayer)
  TriggerServerEvent('esx_phone:load_twittername')
  TriggerServerEvent('esx_phone:load_latest')
  TriggerServerEvent('esx_phone:load_favorites')
  TriggerServerEvent('esx_phone:load_photos')

  PlayerData = xPlayer
end)

RegisterNetEvent('esx_phone:loaded')
AddEventHandler('esx_phone:loaded', function(phoneNumber, contacts, battery, identifier)

  if settingsLoadedFromDatabase == false then
    settingsLoadedFromDatabase = true
    TriggerServerEvent('esx_phone:load_settings', identifier)
  end

  PhoneData.phoneNumber     = phoneNumber
  PhoneData.contacts        = {}
  PhoneData.identifier      = identifier

  for i=1, #contacts, 1 do
    table.insert(PhoneData.contacts, contacts[i])
  end

  SendNUIMessage({
    reloadPhone = true,
    phoneData   = PhoneData
  })

end)

RegisterNetEvent('esx_phone:load_settings')
AddEventHandler('esx_phone:load_settings', function(settings)
  if settings then
    flightmode = settings.flightmode
    sleepmode = settings.sleepmode

    if phoneBattery ~= nil then
      phoneBattery = tonumber(settings.battery)
    end
    
    SendNUIMessage({
      reloadSettings = true,
      settings = settings,
    })

    SendNUIMessage({
      updateBattery = true,
      battery = phoneBattery
    })
  end

end)

RegisterNetEvent('esx_phone:addContact')
AddEventHandler('esx_phone:addContact', function(name, phoneNumber)

  table.insert(PhoneData.contacts, {
    name   = name,
    number = phoneNumber
  })

  SendNUIMessage({
    reloadPhone = true,
    contactAdded = true,
    phoneData    = PhoneData
  })

end)

-- Contacts
RegisterNUICallback('remove_contact', function(phoneNumber)
    TriggerServerEvent('esx_phone:removePlayerContact', phoneNumber)
end)

-- Blocking numbers etc
RegisterNUICallback('block_number', function(phoneNumber)
    TriggerServerEvent('esx_phone:add_blocked', phoneNumber)
end)

RegisterNUICallback('unblock_number', function(phoneNumber)
    TriggerServerEvent('esx_phone:remove_blocked', phoneNumber)
end)

-- Call actions- End call for number
RegisterNUICallback('end_call_for_number', function(contact)
  TriggerServerEvent('esx_phone:end_call_for_number', contact)
end)

RegisterNUICallback('toggle_phone_audio', function(data)
    if data.bool then
        ESX.ShowNotification('Samtal återupptaget')
        -- NetworkSetVoiceChannel(tonumber(data.channel))
        -- NetworkSetTalkerProximity(0.0)
    else
        ESX.ShowNotification('Samtal parkerat')
        -- NetworkSetTalkerProximity(2.5)
        -- NetworkClearVoiceChannel();
    end
end)

RegisterNUICallback('toggle_microphone', function(data)
    if data.bool then
        -- ESX.ShowNotification('~b~Microphone: ~g~on'  .. NetworkGetTalkerProximity())
        -- NetworkSetVoiceActive(true);
        -- NetworkSetVoiceChannel(data.channel)
    else
        -- ESX.ShowNotification('~b~Microphone: ~r~off' .. NetworkGetTalkerProximity())
        -- NetworkSetTalkerProximity(2.5)
        -- NetworkSetVoiceActive(false);
        -- NetworkSetVoiceChannel(data.channel)
        -- SetMicrophonePosition(1, 0, 0, 0, 0, 0, 0, 0, 0, 0) -- SetMicrophonePosition(p0: boolean, x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, x3: number, y3: number, z3: number): void;
    end
end)

RegisterNetEvent("esx_phone:CustomMessage")
AddEventHandler("esx_phone:CustomMessage", function(phoneNumber, message)

  ESX.ShowNotification(phoneNumber .. ": " .. message, phoneNumber, 5000)

  PlaySound(-1, "Menu_Accept", "Phone_SoundSet_Default", 0, 0, 1)
  Citizen.Wait(250)
  PlaySound(-1, "Menu_Accept", "Phone_SoundSet_Default", 0, 0, 1)

  SendNUIMessage({
    newMessage  = true,
    phoneNumber = phoneNumber,
    message     = message,
    position    = false,
    anon        = false,
    job         = false
  })
end)

RegisterNetEvent('esx_phone:onMessage')
AddEventHandler('esx_phone:onMessage', function(phoneNumber, message, position, anon, job, dispatchRequestId, image)
  SendNUIMessage({
    newMessage  = true,
    phoneNumber = anon and '-1' or phoneNumber,
    message     = message,
    image       = image,
    position    = position,
    anon        = anon,
    job         = job,
  })

  if not exports["qalle-base"]:GetInventoryItem("phone") then
    return
  end

  if phoneBattery <= 0 then
    ESX.ShowNotification("Din iPhone 8 är död")
    return
  end

  if job == 'player' then
    ESX.ShowNotification("Nytt SMS från " .. phoneNumber)
    PlaySound(-1, "Menu_Accept", "Phone_SoundSet_Default", 0, 0, 1)
    Citizen.Wait(250)
    PlaySound(-1, "Menu_Accept", "Phone_SoundSet_Default", 0, 0, 1)
    Citizen.Wait(250)
    PlaySound(-1, "Menu_Accept", "Phone_SoundSet_Default", 0, 0, 1)
  else
    ESX.ShowNotification(job .. ": " .. message, job, 5000)
    PlaySound(-1, "Menu_Accept", "Phone_SoundSet_Default", 0, 0, 1)
    Citizen.Wait(250)
    PlaySound(-1, "Menu_Accept", "Phone_SoundSet_Default", 0, 0, 1)
    Citizen.Wait(250)
    PlaySound(-1, "Menu_Accept", "Phone_SoundSet_Default", 0, 0, 1)
  end

  if position ~= nil and position ~= false and dispatchRequestId ~= nil and dispatchRequestId ~= false and dispatchRequestId ~= CurrentDispatchRequestId then

    CurrentAction            = 'dispatch'
    CurrentActionMsg         = job .. ' - Tryck på ~INPUT_MP_TEXT_CHAT_TEAM~ för att ta emot larmet'
    CurrentDispatchRequestId = dispatchRequestId

    CurrentActionData = {
      phoneNumber = anon and '-1' or phoneNumber,
      message     = message,
      position    = position,
      actions     = actions,
      anon        = anon,
      job         = job
    }

    ESX.SetTimeout(15000, function()
      CurrentAction = nil
    end)

  end

end)

RegisterNetEvent('esx_phone:stopDispatch')
AddEventHandler('esx_phone:stopDispatch', function(dispatchRequestId, playerName)
  if tonumber(CurrentDispatchRequestId) == tonumber(dispatchRequestId) then
    CurrentAction = nil
  end
end)

RegisterNetEvent('esx_phone:incomingCall')
AddEventHandler('esx_phone:incomingCall', function(target, channel, number, isJob, rtc)

  local blockedNumber = false
  for id, value in pairs(BlockedNumbers) do
      if value == number then
          blockedNumber = true
          break
      end
  end

  local hasItem, itemQ = exports["qalle-base"]:GetInventoryItem("phone")

  if not OnCall and not blockedNumber and phoneBattery > 0 and hasItem then

     if not flightmode then
         ESX.UI.Menu.Open('phone', GetCurrentResourceName(), 'main')
     end

    SendNUIMessage({
      incomingCall = true,
      target       = target,
      channel      = channel,
      number       = number,
      rtcId = rtc,
      isJob = isJob
    })

  end

end)

local cachedChannel = nil

RegisterNetEvent('esx_phone:onAcceptCall')
AddEventHandler('esx_phone:onAcceptCall', function(channel, target, rtc)

  OnCall = true

  cachedChannel = channel

  SendNUIMessage({
    acceptedCall = true,
    channel      = channel,
    target       = target,
    rtcId = rtc
  })

  exports["tokovoip_script"]:addPlayerToRadio(channel)
  -- NetworkSetVoiceChannel(channel)
  -- NetworkSetTalkerProximity(0.0)

end)

RegisterNetEvent('esx_phone:endCall')
AddEventHandler('esx_phone:endCall', function(msg)
  if flightmode then
    return
  end

  OnCall = false

  if msg ~= nil then
    ESX.ShowNotification(msg)
  end

  SendNUIMessage({
    endCall = true
  })

  if exports["tokovoip_script"]:isPlayerInChannel(cachedChannel) then
    exports["tokovoip_script"]:removePlayerFromRadio(cachedChannel)
  end

  cachedChannel = nil

  RequestAnimDict('anim@cellphone@in_car@ps')

  while not HasAnimDictLoaded('anim@cellphone@in_car@ps') do
    Citizen.Wait(0)
  end

  ePhoneStopCall()

end)

RegisterNetEvent('esx_phone:openPhone')
AddEventHandler('esx_phone:openPhone', function()
  ESX.UI.Menu.CloseAll()
  ESX.UI.Menu.Open('phone', GetCurrentResourceName(), 'main')
end)

RegisterNetEvent('esx:setAccountMoney')
AddEventHandler('esx:setAccountMoney', function(account)

  if account.name == 'bank' then
    SendNUIMessage({
      setBank = true,
      money   = account.money
    })
  end

end)

AddEventHandler('esx_phone:showIcon', function(icon, show)

  if show then
    SendNUIMessage({
      showIcon = true,
      icon     = icon
    })
  else
    SendNUIMessage({
      showIcon = false,
      icon     = icon
    })
  end

end)

RegisterNUICallback('activate_gps', function(data)
  SetNewWaypoint(data.x, data.y)
  ESX.ShowNotification('Ställer in GPS')
end)

-- Contacts
RegisterNUICallback('add_latest', function(data)
    TriggerServerEvent('esx_phone:add_latest', data)
end)

RegisterNUICallback('add_favorite', function(data)
    TriggerServerEvent('esx_phone:add_favorite', data)
end)

RegisterNUICallback('remove_favorite', function(number)
    TriggerServerEvent('esx_phone:remove_favorite', number)
end)



-- Save settings
RegisterNUICallback('save_settings', function(data)
  TriggerServerEvent('esx_phone:save_settings', data)
end)

-- Darkweb
RegisterNUICallback('darkweb_get_messages', function()
    RegisterNetEvent('bingo_core:darkweb_get_messages')
    TriggerServerEvent('bingo_core:darkweb_get_messages')
end)
RegisterNUICallback('darkweb_post_message', function(message, cb)
    RegisterNetEvent('bingo_core:darkweb_post_message')
    TriggerServerEvent('bingo_core:darkweb_post_message', message)
    cb('ok')
end)

-- Twitter
RegisterNUICallback('post_tweet', function(data, cb)
    TriggerServerEvent('esx_phone:post_tweet', data)
    cb('ok')
end)

RegisterNUICallback('load_tweets', function()
    TriggerServerEvent('esx_phone:load_tweets')
end)

RegisterNUICallback('register_twittername', function(data, cb)
    TriggerServerEvent('esx_phone:register_twittername', data)
    cb('ok')
end)

RegisterNUICallback('check_twitter_name', function(data, cb)
    TriggerServerEvent('esx_phone:check_twitter_name', data)
    cb('ok')
end)

RegisterNUICallback('tweet_at_user', function(data, cb)
    TriggerServerEvent('esx_phone:tweet_at_user', data)
    cb('ok')
end)

RegisterNUICallback('load_companies', function()
    TriggerServerEvent('esx_phone:load_companies')
end)

RegisterNetEvent('esx_phone:tweet_at_user')
AddEventHandler('esx_phone:tweet_at_user', function()
    ESX.ShowNotification('Du vart omnämnd i en tweet!')
    PlaySound(-1, "Menu_Accept", "Phone_SoundSet_Default", 0, 0, 1)
    Citizen.Wait(250)
    PlaySound(-1, "Menu_Accept", "Phone_SoundSet_Default", 0, 0, 1)
    Citizen.Wait(250)
    PlaySound(-1, "Menu_Accept", "Phone_SoundSet_Default", 0, 0, 1)
end)

RegisterNetEvent('esx_phone:sendFetchedMessages')
AddEventHandler('esx_phone:sendFetchedMessages', function(messagesFetched)
  if #messagesFetched > 0 then
    SendNUIMessage({
      ["loadMessages"] = true,
      ["messagesSent"] = messagesFetched
    })
  end
end)



-- Din bil app
RegisterNUICallback('request_mechanic', function(veh, cb)
    local coords = GetEntityCoords(veh)
    local health = GetVehicleBodyHealth(veh)
    local engineHealth = GetVehicleEngineHealth(veh)
    local message = 'Mekaniker behövs vid bifogad position. Skick: ' .. round(health/10, 2)  .. '%. Motor: ' .. round(engineHealth/10, 2) .. '%. Skickat från Din bil.'

    TriggerServerEvent('esx_phone:send', 'mecano', message, false, {
          x = coords.x,
          y = coords.y,
          z = coords.z
      });
  ESX.ShowNotification('Mekaniker tillkallad')
  cb('ok')
end)
RegisterNUICallback('request_mechanic_towing', function(veh, cb)
    local coords = GetEntityCoords(veh)
    local health = GetVehicleBodyHealth(veh)
    local engineHealth = GetVehicleEngineHealth(veh)
    local message = 'Bärgare behövs vid bifogad position. Skick: ' .. round(health/10, 2)  .. '%. Motor: ' .. round(engineHealth/10, 2) .. '%. Skickat från Din bil.'

    TriggerServerEvent('esx_phone:send', 'mecano', message, false, {
          x = coords.x,
          y = coords.y,
          z = coords.z
      })
  ESX.ShowNotification('Bärgare tillkallad')
  cb('ok')
end)

RegisterNUICallback('update_current_vehicle', function(plate, cb)
    TriggerEvent('esx_phone:look_for_vehicle_nearby', plate)
    cb('ok')
end)

RegisterNUICallback('search_nearby', function(vehicleList, cb)
    TriggerEvent('currentvehicle:startLooking', vehicleList)
    cb('ok')
end)

RegisterNUICallback('update_vehicle_list', function()
    TriggerServerEvent('esx_phone:update_vehicle_list')
end)

RegisterNUICallback('test_honk', function(veh, cb)
    TriggerServerEvent('esx_phone:honk_vehicle', veh)
    cb('ok')
end)

RegisterNUICallback('set_engine_off', function(veh)
    TriggerServerEvent('esx_phone:toggleEngine', veh, 0)
end)

RegisterNUICallback('set_engine_on', function(veh)
    TriggerServerEvent('esx_phone:toggleEngine', veh, 1)
end)

RegisterNUICallback('update_current_vehicle_known', function(veh, cb)
    TriggerEvent('currentvehicle:update', veh)
    cb('ok')
end)

-- Inställningar
RegisterNUICallback('set_flightmode', function(val, cb)
  flightmode = val
  cb('ok')
end)

RegisterNUICallback('flightmode_off', function()
  TriggerServerEvent('esx_phone:flightmode_off')
end)

RegisterNUICallback('set_sharelocation', function(val, cb)
  Sharelocation = val
  cb('ok')
end)

RegisterNUICallback('start_call', function(data, cb)
  TriggerServerEvent('esx_phone:startCall', data.number, data.name, data.rtcId)

  ePhoneStartCall()

  cb('OK')
end)

RegisterNUICallback('accept_call', function(data, cb)

  ePhoneStartCall()
  OnCall = true

  TriggerServerEvent('esx_phone:acceptCall', data.target, data.channel, data)

  cachedChannel = data.channel

  exports["tokovoip_script"]:addPlayerToRadio(data.channel)
  -- NetworkSetVoiceChannel(data.channel)
  -- NetworkSetTalkerProximity(0.0)
  cb('OK')
end)

RegisterNUICallback('end_call', function(data, cb)
  if data.channel == 1337 then
    exports["InteractSound"]:playSound("pizza", 0.1)

    ePhoneStopCall()

    ePhoneOutAnim()
  end

  TriggerServerEvent('esx_phone:endCall', data.channel, data.target)
  cb('OK')
end)

RegisterNUICallback('send', function(data)
  local phoneNumber = data["messageData"]["number"]
  local playerPed   = GetPlayerPed(-1)
  local coords      = GetEntityCoords(playerPed)

  TriggerServerEvent('esx_phone:send', phoneNumber, data["messageData"]["body"], data["messageData"]["anon"], {
    x = coords.x,
    y = coords.y,
    z = coords.z
}, Sharelocation, false, data["messageData"])

  ESX.ShowNotification("Meddelande: <" .. data["messageData"]["body"] .. "> skickades till: " .. phoneNumber)
end)

RegisterNUICallback('add_contact', function(data, cb)

  local phoneNumber = data.phoneNumber
  local contactName = tostring(data.contactName)

  if phoneNumber then
    TriggerServerEvent('esx_phone:addPlayerContact', phoneNumber, contactName)
  end

  cb('OK')

end)

RegisterNUICallback('call_stockholm', function()
  if exports["fs_taxi"]:IsTaxiOnGoing() then
    ESX.ShowNotification("Du har redan en taxi")
    return
  end

  ESX.UI.Menu.Open('phone', GetCurrentResourceName(), 'main')

  ePhoneStartCall()

  SendNUIMessage({
    fakeCall = true
  })
end)

RegisterNUICallback('escape', function()
  ESX.UI.Menu.Close('phone', GetCurrentResourceName(), 'main')
  ClosePhone()
end)

RegisterNUICallback('request_focus', function()
  GUI.HasFocus = true
  SetNuiFocus(true, true)
end)

RegisterNUICallback('request_input_focus', function()
  GUI.HasFocus = true
  SetNuiFocus(true, false)
end)

RegisterNUICallback('release_focus', function()
  GUI.HasFocus = false
  SetNuiFocus(false)
end)

RegisterNUICallback('request_vehicle_data', function()
    TriggerServerEvent('esx_phone:update_vehicle_list');
end)

RegisterNUICallback('show_vehicle_blip', function(veh, cb)
    TriggerEvent('currentVehicle:showOnMap', veh);
    cb('ok');
end)
RegisterNUICallback('hide_vehicle_blip', function()
    TriggerEvent('currentVehicle:hideOnMap');
end)

RegisterNUICallback('request_current_vehicle_data', function(plate, cb)
    TriggerServerEvent('esx_phone:update_current_vehicle', plate);
    cb('ok');
end)

RegisterNUICallback('lock_car', function(veh, cb)
    TriggerEvent('currentvehicle:setLock', veh, true);
    cb('ok');
end)
RegisterNUICallback('unlock_car', function(veh, cb)
    TriggerEvent('currentvehicle:setLock', veh, false);
    cb('ok');
end)

RegisterNUICallback('bingo_checknumber', function(number, cb)
    TriggerServerEvent('bingo_core:phone:checkNumber', number);
    cb('ok');
end)

RegisterNUICallback('bingo_updatenumber', function(number, cb)
    TriggerServerEvent('bingo_core:phone:updateNumber', number);
    cb('ok');
end)

RegisterNUICallback('bingo_resetphone', function()
    ClosePhone();
    ESX.ShowNotification('Återställer telefon');
    TriggerServerEvent('esx_phone:reset_phone', ESX.GetPlayerData());
end)

-- Swish - swisha
RegisterNUICallback('send_swish', function(data)
    local amount = tonumber(data.amount)

    if amount then
      TriggerServerEvent('esx_swish:send_swish', data.number, data.amount)
    else
      ESX.ShowNotification('Ogiltigt belopp')
    end
end)

-- battery logic

Citizen.CreateThread(function()
  while true do
    local sleepThread = 500

    if GUI.IsOpen then
      if Flightmode then
        Citizen.Wait(240000)
      else
        Citizen.Wait(120000)
      end

      phoneBattery = phoneBattery - 1

      if phoneBattery < 0 then
        phoneBattery = 0
      end

      SendNUIMessage({
        updateBattery = true,
        battery = phoneBattery
      })
    end

    Citizen.Wait(sleepThread)
  end
end)

-- Key controls
Citizen.CreateThread(function()
  local talking = true

  while true do

    Wait(0)

    if GUI.IsOpen then
      if IsControlJustReleased(0, Keys['TOP']) then
        SendNUIMessage({
          controlPressed = true,
          control        = 'TOP'
        })
      end

      if IsControlJustReleased(0, Keys['DOWN']) then
        SendNUIMessage({
          controlPressed = true,
          control        = 'DOWN'
        })
      end

      if IsControlJustReleased(0, Keys['LEFT']) then
        SendNUIMessage({
          controlPressed = true,
          control        = 'LEFT'
        })
      end

      if IsControlJustReleased(0, Keys['RIGHT']) then
        SendNUIMessage({
          controlPressed = true,
          control        = 'RIGHT'
        })
      end

      if IsControlJustReleased(0, Keys['ENTER']) then
        SendNUIMessage({
          controlPressed = true,
          control        = 'ENTER'
        })
      end

      if IsControlJustReleased(0, Keys['BACKSPACE']) then
        SendNUIMessage({
          controlPressed = true,
          control        = 'BACKSPACE'
        })
      end

      if NetworkIsPlayerTalking(PlayerId()) and not talking then
        talking = true

        SendNUIMessage({
          controlPressed = true,
          control        = 'SPEAKING',
          isHolding = true
        })
      end
      if not NetworkIsPlayerTalking(PlayerId()) and talking then
        talking = false

        SendNUIMessage({
          controlPressed = true,
          control        = 'SPEAKING',
          isHolding = false
        })
      end

    end

    if GUI.HasFocus then -- codes here: https://pastebin.com/guYd0ht4
      DisableControlAction(0, 1,    true) -- LookLeftRight
      DisableControlAction(0, 2,    true) -- LookUpDown
      DisableControlAction(0, 25,   true) -- Input Aim
      DisableControlAction(0, 106,  true) -- Vehicle Mouse Control Override

      DisableControlAction(0, 24,   true) -- Input Attack
      DisableControlAction(0, 140,  true) -- Melee Attack Alternate
      DisableControlAction(0, 141,  true) -- Melee Attack Alternate
      DisableControlAction(0, 142,  true) -- Melee Attack Alternate
      DisableControlAction(0, 257,  true) -- Input Attack 2
      DisableControlAction(0, 263,  true) -- Input Melee Attack
      DisableControlAction(0, 264,  true) -- Input Melee Attack 2

      DisableControlAction(0, 12,   true) -- Weapon Wheel Up Down
      DisableControlAction(0, 14,   true) -- Weapon Wheel Next
      DisableControlAction(0, 15,   true) -- Weapon Wheel Prev
      DisableControlAction(0, 16,   true) -- Select Next Weapon
      DisableControlAction(0, 17,   true) -- Select Prev Weapon
    else
    	if IsDisabledControlJustReleased(0, Keys['F1']) then
    		if not GUI.IsOpen then
    		  local hasItem = exports["qalle-base"]:GetInventoryItem("phone")

          if hasItem then
            if not IsPedCuffed(PlayerPedId()) then
              OpenPhone()
            else
              ESX.ShowNotification("Du har handfängsel/buntband på dig.")
            end
          else
            ESX.ShowNotification("Du har ingen iPhone 8")
          end
    		end
    	end

      if IsControlJustReleased(246, Keys['Y']) and GUI.IsOpen then

        SendNUIMessage({
          activateGPS = true
        })

      end

    end
  end
end)

-- Key controls
Citizen.CreateThread(function()

  SetNuiFocus(false)

  while true do

    Citizen.Wait(0)

    if CurrentAction ~= nil then

      SetTextComponentFormat('STRING')
      AddTextComponentString(CurrentActionMsg)
      DisplayHelpTextFromStringLabel(0, 0, 1, -1)

      if IsControlJustReleased(0, Keys['Y']) then

        if CurrentAction == 'dispatch' then
          local playerData = ESX.GetPlayerData()
          if playerData.job.name ~= 'police' and playerData.job.name ~= 'ambulance' then
            TriggerServerEvent('esx_phone:send', playerData.job.name, playerData.character.firstname .. ' tar det samtalet.', false)
            TriggerServerEvent('esx_phone:send', CurrentActionData.phoneNumber, playerData.character.firstname .. ' kommer så fort som möjligt, var god vänta på platsen.', false)
            TriggerServerEvent('esx_phone:stopDispatch', CurrentDispatchRequestId)
          elseif playerData.job.name == 'ambulance' then
            TriggerServerEvent('esx_phone:send', playerData.job.name, 'En enhet har åkt iväg på senast inkomna samtal. Invänta uppgifter!', false)
            TriggerServerEvent('esx_phone:send', CurrentActionData.phoneNumber, 'SOS Operatör: Ambulans är på väg mot din angivna larmposition. Vid skada på andra part, kontrollera så personen har puls och fria luftvägar. Om inte, påbörja hjärt- och lungräddning!', false)
            TriggerServerEvent('esx_phone:stopDispatch', CurrentDispatchRequestId)
          elseif playerData.job.name == 'police' then
            TriggerServerEvent('esx_phone:send', playerData.job.name, 'En patrull har åkt iväg på senast inkomna samtal. Invänta uppgifter!', false)
            TriggerServerEvent('esx_phone:send', CurrentActionData.phoneNumber, 'SOS Operatör: Polis är på väg mot din angivna larmpostion. Vänligen invänta ingripande patrull för att ange uppgifter. Vid personskador, larma ambulans och försäkra dig om att personen har puls och fria luftvägar. Om inte, påbörja hjärt- och lungräddning!', false)
            TriggerServerEvent('esx_phone:stopDispatch', CurrentDispatchRequestId, true)
          end
          SetNewWaypoint(CurrentActionData.position.x,  CurrentActionData.position.y)
        end

        CurrentAction = nil

      end

    end

  end
end)

-- simple round with decimals
function round(num, numDecimalPlaces)
  local mult = 10^(numDecimalPlaces or 0)
  return math.floor(num * mult + 0.5) / mult
end


local inAnim = "cellphone_text_in"
local outAnim = "cellphone_text_out"
local textToCall = "cellphone_text_to_call"
local CallToText = "cellphone_call_to_text"
local lastAnim = nil

function ePhoneInAnim()

    if IsPlayerDead(PlayerId()) then
      return
    end
    local bone = GetPedBoneIndex(GetPlayerPed(-1), 28422)
    local dict = "cellphone@"
    if IsPedInAnyVehicle(GetPlayerPed(-1), false) then
      dict = dict .. "in_car@ds"
    end

    loadAnimDict(dict)

    TaskPlayAnim(GetPlayerPed(-1), dict, inAnim, 4.0, -1, -1, 50, 0, false, false, false)
    lastAnim = inAnim
    Citizen.Wait(157)
    newPhoneProp()
end


function ePhoneStartCall ()
    local playerPed = GetPlayerPed(-1)

    if lastAnim ~= inAnim and lastAnim ~= CallToText then
      return
    end

    local dict = "cellphone@"
    if IsPedInAnyVehicle(GetPlayerPed(-1), false) then
      dict = dict .. "in_car@ds"
    end
    loadAnimDict(dict)
    StopAnimTask(GetPlayerPed(-1), dict, lastAnim, 1.0)
    TaskPlayAnim(GetPlayerPed(-1), dict, textToCall, 3.0, -1, -1, 50, 0, false, false, false)
    lastAnim = textToCall
end


function ePhoneStopCall ()
    if lastAnim ~= textToCall then
      return
    end

    local dict = "cellphone@"
    if IsPedInAnyVehicle(GetPlayerPed(-1), false) then
      dict = dict .. "in_car@ds"
    end
    loadAnimDict(dict)
    StopAnimTask(GetPlayerPed(-1), dict, lastAnim, 1.0)
    TaskPlayAnim(GetPlayerPed(-1), dict, CallToText, 3.0, -1, -1, 50, 0, false, false, false)
    lastAnim = CallToText
end


function ePhoneOutAnim()

    if IsPlayerDead(PlayerId()) then
      return
    end
    local dict = "cellphone@"
    if IsPedInAnyVehicle(GetPlayerPed(-1), false) then
      dict = dict .. "in_car@ds"
    end

    loadAnimDict(dict)
    DeleteObject(CellphoneObject1)
    Citizen.Wait(250)

    StopAnimTask(GetPlayerPed(-1), dict, lastAnim, 1.0)
    TaskPlayAnim(GetPlayerPed(-1), dict, outAnim, 5.0, 1, -1, 50, 0, false, false, false)
    Citizen.Wait(350)

    lastAnim = nil

    Citizen.Wait(250)
    DeleteObject(CellphoneObject)

    StopAnimTask(GetPlayerPed(-1), dict, outAnim, 1.0)
end



function loadAnimDict(dict)
    RequestAnimDict(dict)
    while not HasAnimDictLoaded(dict) do
        Citizen.Wait(1)
    end
end

function newPhoneProp()
  if not DoesEntityExist(CellphoneObject) then
    local playerPed = GetPlayerPed(-1)
    local coords     = GetEntityCoords(playerPed)
    local bone       = GetPedBoneIndex(playerPed, 28422)
    local phoneModel = GetHashKey('prop_phone_ing')
    local phoneModel1 = GetHashKey('prop_phone_overlay_03')
    RequestModel(phoneModel)
    while not HasModelLoaded(phoneModel) do
        Citizen.Wait(0)
    end
    CellphoneObject = CreateObject(phoneModel, coords.x, coords.y, coords.z, 1, 1, 0)
    CellphoneObject1 = CreateObject(phoneModel1, coords.x, coords.y, coords.z, 1, 1, 0)

    AttachEntityToEntity(CellphoneObject, playerPed, bone, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1, 1, 0, 0, 2, 1)
    AttachEntityToEntity(CellphoneObject1, CellphoneObject, bone, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1, 1, 0, 0, 2, 1)
  end
end
RegisterNetEvent('closeallui')
AddEventHandler('closeallui', function()
  ClosePhone()
end)