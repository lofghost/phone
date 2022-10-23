RegisterCommand("cameramode", function()
    TriggerEvent("esx_phone:start_camera")
end)
  
local usingPhone = false
local usingSelfieMode = false
local phoneId = 0

RegisterNetEvent("esx_phone:start_camera")
AddEventHandler("esx_phone:start_camera", function()
    if not usingPhone then		
        CreateMobilePhone(phoneId)

        CellCamActivate(true, true)

        usingPhone = true
    end
end)

RegisterNetEvent("esx_phone:exit_camera")
AddEventHandler("esx_phone:exit_camera", function()
    if usingPhone then		
        DestroyMobilePhone()
                
        usingPhone = false

        CellCamActivate(false, false)
    end
end)

RegisterNetEvent("esx_phone:switch_camera")
AddEventHandler("esx_phone:switch_camera", function()		
    usingSelfieMode = not usingSelfieMode

    CellFrontCamActivate(usingSelfieMode)
end)

RegisterNetEvent("esx_phone:take_photo")
AddEventHandler("esx_phone:take_photo", function(mode)		
    TakePhoto(mode)
end)

RegisterNetEvent("esx_phone:save_photo")
AddEventHandler("esx_phone:save_photo", function(data)		
    local linkURL = data["link"]
    local timeStamp = data["datetime"]

    ESX.TriggerServerCallback("esx_phone:savePhoto", function(photoSaved)
        if photoSaved then
            ESX.ShowNotification("Du sparade ett foto!")
        else
            ESX.ShowNotification("Fotot sparades ej, testa igen!")
        end
    end, linkURL, timeStamp)
end)

RegisterNetEvent("remove_image")
AddEventHandler("remove_image", function(data)		
    local linkURL = data["link"]

    ESX.TriggerServerCallback("esx_phone:deletePhoto", function(photoRemoved)
        if photoRemoved then
            ESX.ShowNotification("Du tog bort ett foto!")
        else
            ESX.ShowNotification("Fotot togs ej bort, testa igen!")
        end
    end, linkURL)
end)

RegisterNetEvent("send_image")
AddEventHandler("send_image", function(data)		
    ESX.TriggerServerCallback("esx_phone:sendPhoto", function(photoSent)
        if photoSent then
            ESX.ShowNotification(("Du kickade ett foto till %s!"):format(data["name"]))
            TriggerServerEvent("esx_phone:send", data["number"], "MMS", false, false, false, data["link"])
        else
            ESX.ShowNotification("Fotot skickades ej, detta kan bero på att personens telefon är avstängd!")
        end
    end, data)
end)
  
Citizen.CreateThread(function()
    DestroyMobilePhone()

    while true do
        local sleepThread = 500
        
        if usingPhone then
            sleepThread = 5
            
            if IsControlJustPressed(0, 177) then
                DestroyMobilePhone()
            
                usingPhone = false
        
                CellCamActivate(false, false)
            end
        end

        Citizen.Wait(sleepThread)
    end
end)

TakePhoto = function(mode)
    local options = {
        headers = {
            Authorization = "Client-ID 483dfe811ef5cd0"
        },

        mode = mode
    }

    exports['screenshot-basic']:requestScreenshotUpload('https://api.imgur.com/3/upload', options)
end

CellFrontCamActivate = function(activate)
    return Citizen.InvokeNative(0x2491A93618B7D838, activate)
end