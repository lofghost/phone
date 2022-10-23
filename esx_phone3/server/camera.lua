RegisterServerEvent("esx_phone:load_photos")
AddEventHandler("esx_phone:load_photos", function()
    local src = source

    local player = ESX.GetPlayerFromId(src)

    local fetchSQL = [[
        SELECT 
            photos
        FROM
            phone_images
        WHERE
            cid = @cid
    ]]

    local newPhotoArray = {}

    MySQL.Async.fetchAll(fetchSQL, { ["@cid"] = player["characterId"] }, function(response)
        if response[1] ~= nil and response[1]["photos"] ~= nil then
            newPhotoArray = json.decode(response[1]["photos"])
        end

        TriggerClientEvent("esx_phone:sendnui", src, { ["updatePhotos"] = true, ["photos"] = newPhotoArray })
    end)
end)

ESX.RegisterServerCallback("esx_phone:savePhoto", function(source, cb, linkURL, timeStamp)
    local player = ESX.GetPlayerFromId(source)

    local fetchSQL = [[
        SELECT 
            photos
        FROM
            phone_images
        WHERE
            cid = @cid
    ]]

    local insertSQL = [[
        INSERT
            INTO
        phone_images
            (cid, photos)
        VALUES
            (@cid, @photos)
    ]]

    local updateSQL = [[
        UPDATE
            phone_images
        SET
            photos = @updatedPhotos
        WHERE
            cid = @cid
    ]]

    local newPhotoArray = {}

    MySQL.Async.fetchAll(fetchSQL, { ["@cid"] = player["characterId"] }, function(response)
        if response[1] ~= nil and response[1]["photos"] ~= nil then
            newPhotoArray = json.decode(response[1]["photos"])

            table.insert(newPhotoArray, { ["link"] = linkURL, ["time"] = timeStamp })

            MySQL.Async.execute(updateSQL, { ["@cid"] = player["characterId"], ["@updatedPhotos"] = json.encode(newPhotoArray) }, function(rowsChanged)
                if rowsChanged > 0 then
                    cb(true)
                else
                    cb(false)
                end
            end)
        else
            table.insert(newPhotoArray, { ["link"] = linkURL, ["time"] = timeStamp })

            MySQL.Async.execute(insertSQL, { ["@cid"] = player["characterId"], ["@photos"] = json.encode(newPhotoArray)}, function(rowsChanged)
                if rowsChanged > 0 then
                    cb(true)
                else
                    cb(false)
                end
            end)
        end

        TriggerClientEvent("esx_phone:sendnui", source, { ["updatePhotos"] = true, ["photos"] = newPhotoArray })
    end)
end)

ESX.RegisterServerCallback("esx_phone:deletePhoto", function(source, cb, linkURL)
    local src = source

    local player = ESX.GetPlayerFromId(source)

    local fetchSQL = [[
        SELECT 
            photos
        FROM
            phone_images
        WHERE
            cid = @cid
    ]]

    local updateSQL = [[
        UPDATE
            phone_images
        SET
            photos = @updatedPhotos
        WHERE
            cid = @cid
    ]]

    local editedPhotoArray = {}

    MySQL.Async.fetchAll(fetchSQL, { ["@cid"] = player["characterId"] }, function(response)
        if response[1] ~= nil and response[1]["photos"] ~= nil then
            editedPhotoArray = json.decode(response[1]["photos"])

            for i = 1, #editedPhotoArray do
                local photo = editedPhotoArray[i]

                if photo["link"] == linkURL then
                    table.remove(editedPhotoArray, i)
                    
                    TriggerClientEvent("esx_phone:sendnui", src, { ["updatePhotos"] = true, ["photos"] = editedPhotoArray })

                    break
                end
            end

            MySQL.Async.execute(updateSQL, { ["@cid"] = player["characterId"], ["@updatedPhotos"] = json.encode(editedPhotoArray) }, function(rowsChanged)
                if rowsChanged > 0 then
                    cb(true)
                else
                    cb(false)
                end
            end)
        end
    end)
end)

ESX.RegisterServerCallback("esx_phone:sendPhoto", function(source, cb, data)
    local player = ESX.GetPlayerFromId(source)
    local targetPlayer = nil

    local players = ESX.GetPlayers()

    for i = 1, #players do
        local player = ESX.GetPlayerFromId(players[i])

        if player ~= nil then
            if player.get("phoneNumber") == data["number"] then
                targetPlayer = player

                break
            end
        end
    end

    if targetPlayer == nil then
        cb(false)

        return
    end

    local fetchSQL = [[
        SELECT 
            photos
        FROM
            phone_images
        WHERE
            cid = @cid
    ]]

    local insertSQL = [[
        INSERT
            INTO
        phone_images
            (cid, photos)
        VALUES
            (@cid, @photos)
    ]]

    local updateSQL = [[
        UPDATE
            phone_images
        SET
            photos = @updatedPhotos
        WHERE
            cid = @cid
    ]]

    local newPhotoArray = {}

    MySQL.Async.fetchAll(fetchSQL, { ["@cid"] = targetPlayer["characterId"] }, function(response)
        if response[1] ~= nil and response[1]["photos"] ~= nil then
            newPhotoArray = json.decode(response[1]["photos"])

            table.insert(newPhotoArray, { ["link"] = data["link"], ["time"] = data["time"] })

            MySQL.Async.execute(updateSQL, { ["@cid"] = targetPlayer["characterId"], ["@updatedPhotos"] = json.encode(newPhotoArray) }, function(rowsChanged)
                if rowsChanged > 0 then
                    cb(true)
                else
                    cb(false)
                end
            end)
        else
            table.insert(newPhotoArray, { ["link"] = data["link"], ["time"] = data["time"] })

            MySQL.Async.execute(insertSQL, { ["@cid"] = targetPlayer["characterId"], ["@photos"] = json.encode(newPhotoArray)}, function(rowsChanged)
                if rowsChanged > 0 then
                    cb(true)
                else
                    cb(false)
                end
            end)
        end

        TriggerClientEvent("esx:showNotification", targetPlayer.source, "Du mottog en bild!")
        TriggerClientEvent("esx_phone:sendnui", targetPlayer.source, { ["updatePhotos"] = true, ["photos"] = newPhotoArray })
    end)
end)