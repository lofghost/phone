ESX                       = nil
local DisptachRequestId   = 0
local PhoneNumbers        = {}


TriggerEvent('esx:getSharedObject', function(obj)
  ESX = obj
end)

function GenerateUniquePhoneNumber()

  local foundNumber = false
  local phoneNumber = nil

  while not foundNumber do

    local regions = {
      '073',
      '072',
      '070'
    }

    beforeNumber = regions[math.random(#regions)]
    phoneNumber = math.random(1000000, 9999999)

    local result = MySQL.Sync.fetchAll(
      'SELECT COUNT(*) as count FROM characters WHERE phonenumber = @phoneNumber',
      {
        ['@phoneNumber'] = beforeNumber .. phoneNumber
      }
    )

    local count  = tonumber(result[1].count)

    if count == 0 then
      foundNumber = true
    end

  end

  return beforeNumber .. phoneNumber
end

function GetDistpatchRequestId()

  if DisptachRequestId < 65535 then
    DisptachRequestId = DisptachRequestId + 1
  else
    DisptachRequestId = 0
  end

  return DisptachRequestId

end

function EndCall(source, channel, target)

  local xPlayer = ESX.GetPlayerFromId(source)

  xPlayer.set('onCall', nil)

  TriggerClientEvent('esx_phone:endCall', source)

  if target then
    local targetXPlayer = ESX.GetPlayerFromId(target)

    if targetXPlayer then
      targetXPlayer.set('onCall', nil)
      TriggerClientEvent('esx_phone:endCall', target)
    end

  end

end

RegisterServerEvent('esx_phone:checkItem')
AddEventHandler('esx_phone:checkItem', function()
  local _source = source
  local xPlayer = ESX.GetPlayerFromId(_source)
  local item    = xPlayer.getInventoryItem('phone').count
  if item > 0 then
    TriggerClientEvent('esx_phone:openPhone', _source)
  else
    TriggerClientEvent("esx:showNotification", _source, "Du har ingen telefon!", "Telefon", "3500")
  end
end)

AddEventHandler("onResourceStart", function(resource)
  if resource == GetCurrentResourceName() then
    local players = ESX.GetPlayers()

    for playerIndex = 1, #players do
      local player = ESX.GetPlayerFromId(players[playerIndex])

      if player then
        Citizen.Wait(50)

        LoadPhone(player["source"])
      end
    end
  end
end)

RegisterServerEvent('esx_phone:startCall')
AddEventHandler('esx_phone:startCall', function(number, name, rtc)
  local _source     = source
  local xPlayer     = ESX.GetPlayerFromId(_source)
  local channel     = _source + 1000
  local foundPlayer = false
  local isJob = false

  for i = 1, #Config.Contacts do
    local data = Config.Contacts[i]

    if data.number == number then
      local players = ESX.GetPlayers()

      for i = 1, #players, 1 do
        local player = ESX.GetPlayerFromId(players[i])

        if not (_source == player.source) then
          if player.job.name == data.job then
            if not player.get('onCall') then
              foundPlayer = player
              isJob = true
              break
            end
          end
        end
      end

      break
    end
  end

  if not foundPlayer then
    local xPlayers = ESX.GetPlayers()
    for i = 1, #xPlayers, 1 do
      local targetXPlayer = ESX.GetPlayerFromId(xPlayers[i])
      if targetXPlayer.get('phoneNumber') == number then
        foundPlayer = targetXPlayer
        break
      end
    end
  end

  if foundPlayer then
    if not foundPlayer.get("onCall") then
      xPlayer.set('onCall', {channel = channel, target = foundPlayer.source})
      foundPlayer.set('onCall', {channel = channel, target = xPlayer.source})

      local table = {
        src = _source,
        name = isJob and 'Växel' or name,
        number = number,
        missed = false,
        incoming = 0,
        time = os.time()
      }

      TriggerEvent('esx_phone:add_latest', table)

      TriggerClientEvent('esx_phone:incomingCall', foundPlayer.source, xPlayer.source, channel, xPlayer.get('phoneNumber'), isJob, rtc)
    else
      TriggerClientEvent('esx_phone:endCall', _source, 'Kontakten är upptagen i ett annat samtal.')
    end
  else
    TriggerClientEvent('esx_phone:endCall', _source, 'Kontakten kan inte nås för tillfället.')
  end

end)

RegisterServerEvent('esx_phone:end_call_for_number')
AddEventHandler('esx_phone:end_call_for_number', function(contact)
  local _source     = source
  local xPlayer     = ESX.GetPlayerFromId(_source)
  local xPlayers    = ESX.GetPlayers()
  local foundPlayer = false

  for i=1, #xPlayers, 1 do
    local targetXPlayer = ESX.GetPlayerFromId(xPlayers[i])

    if targetXPlayer.get('phoneNumber') == contact.number then
      foundPlayer = targetXPlayer
      break
    end
  end

  if foundPlayer then
    xPlayer.set("onCall", nil)
    foundPlayer.set("onCall", nil)

    TriggerClientEvent('esx_phone:endCall', foundPlayer.source)
  end

end)

RegisterServerEvent('esx_phone:acceptCall')
AddEventHandler('esx_phone:acceptCall', function(target, channel, rtc)

  local _source = source

  TriggerClientEvent('esx_phone:onAcceptCall', target, channel, _source, rtc)

end)

RegisterServerEvent('esx_phone:endCall')
AddEventHandler('esx_phone:endCall', function(channel, target)
  EndCall(source, channel, target)
end)

AddEventHandler('esx_phone:getDistpatchRequestId', function(cb)
  cb(GetDistpatchRequestId())
end)

LoadPhone = function(source)
  local xPlayer = ESX.GetPlayerFromId(source)

  ESX.Trace("Loading phone for", xPlayer["character"]["firstname"], xPlayer["character"]["lastname"])

  if PhoneNumbers[xPlayer.get('phoneNumber')] then
    PhoneNumbers[xPlayer.get('phoneNumber')] = nil

    local onCall  = xPlayer.get('onCall')
  
    TriggerClientEvent('esx_phone:setPhoneNumberSource', -1, xPlayer.get('phoneNumber'), -1)
    
    if PhoneNumbers[xPlayer.job.name] then
      TriggerEvent('esx_phone:removeSource', xPlayer.job.name, source)
    end

    if onCall then
      EndCall(source, onCall.channel, onCall.target)
    end
  end

  for num,v in pairs(PhoneNumbers) do
    if tonumber(num) == num then -- If phonenumber is a player phone number
      for src,_ in pairs(v.sources) do
        TriggerClientEvent('esx_phone:setPhoneNumberSource', source, num, tonumber(src))
      end
    end
  end

  MySQL.Async.fetchAll(
    'SELECT phonenumber FROM characters WHERE id = @identifier',
    {
      ['@identifier'] = xPlayer.characterId
    },
    function(result)

      local phoneNumber = result[1].phonenumber

      if phoneNumber == nil or phoneNumber == '0' then

        phoneNumber = GenerateUniquePhoneNumber()

        MySQL.Async.execute(
          'UPDATE characters SET phonenumber = @phone_number WHERE id = @identifier',
          {
            ['@identifier']   = xPlayer.characterId,
            ['@phone_number'] = phoneNumber
          }
        )
      end

      TriggerClientEvent('esx_phone:setPhoneNumberSource', -1, phoneNumber, source)

      PhoneNumbers[phoneNumber] = {
        type          = 'player',
        hashDispatch  = false,
        sharePos      = false,
        hideNumber    = false,
        hidePosIfAnon = false,
        sources       = {[source] = true}
      }

      xPlayer.set('phoneNumber', phoneNumber)

      if PhoneNumbers[xPlayer.job.name] ~= nil then
        TriggerEvent('esx_phone:addSource', xPlayer.job.name, source)
      end

      local contacts = {}

      for i = 1, #Config.Contacts do

        table.insert(contacts, {
          name = Config.Contacts[i].name,
          number = Config.Contacts[i].number
        })
      end

      MySQL.Async.fetchAll(
        'SELECT name, number FROM user_contacts WHERE characterId = @identifier ORDER BY name ASC',
        {
          ['@identifier'] = xPlayer.characterId
        },
        function(result2)

          for i=1, #result2, 1 do

            table.insert(contacts, {
              name   = result2[i].name,
              number = result2[i].number,
            })
          end

          xPlayer.set('contacts', contacts)

          TriggerClientEvent('esx_phone:loaded', source, phoneNumber, contacts, 100, xPlayer.identifier)

        end
      )

      local fetchSMS = [[
        SELECT
          messageData, messageSender
        FROM
          characters_messages
        WHERE
          messageHolder = @cid OR messageSender = @cid
      ]]

      MySQL.Async.fetchAll(fetchSMS, {
        ["@cid"] = xPlayer["characterId"]
      }, function(responses)
        local sendSMS = {}

        for i = 1, #responses do
          local messageSender = responses[i]["messageSender"]
          local messageData = json.decode(responses[i]["messageData"])

          if messageData then
            if messageSender ~= xPlayer["characterId"] then
              messageData["self"] = false

              local getHolderSQL = [[
                SELECT
                  phonenumber
                FROM
                  characters
                WHERE
                  id = @number
              ]]

              local holderPhoneNumber = MySQL.Sync.fetchAll(getHolderSQL, {
                ["@number"] = messageSender
              })

              if holderPhoneNumber then
                messageData["number"] = holderPhoneNumber[1]["phonenumber"]
              end
            end

            table.insert(sendSMS, messageData)
          end
        end

        TriggerClientEvent("esx_phone:sendFetchedMessages", xPlayer["source"], sendSMS)
      end)

    end
  )
end

AddEventHandler('esx:playerLoaded', function(source)
  LoadPhone(source)
end)

AddEventHandler('esx:playerDropped', function(source)

  local xPlayer = ESX.GetPlayerFromId(source)
  local onCall  = xPlayer.get('onCall')

  TriggerClientEvent('esx_phone:setPhoneNumberSource', -1, xPlayer.get('phoneNumber'), -1)

  PhoneNumbers[xPlayer.get('phoneNumber')] = nil

  if PhoneNumbers[xPlayer.job.name] then
    TriggerEvent('esx_phone:removeSource', xPlayer.job.name, source)
  end

  if onCall then
    EndCall(source, onCall.channel, onCall.target)
  end
end)

AddEventHandler('esx:setJob', function(source, job, lastJob)

  if PhoneNumbers[lastJob.name] ~= nil then
    TriggerEvent('esx_phone:removeSource', lastJob.name, source)
  end

  if PhoneNumbers[job.name] ~= nil then
    TriggerEvent('esx_phone:addSource', job.name, source)
  end

end)

RegisterServerEvent('esx_phone:reload')
AddEventHandler('esx_phone:reload', function(phoneNumber)

  local _source  = source
  local xPlayer  = ESX.GetPlayerFromId(_source)
  local contacts = xPlayer.get('contacts') or {}
  TriggerClientEvent('esx_phone:loaded', _source, phoneNumber, contacts, encryptingCard, xPlayer.identifier)

end)

function sendToDiscord(name,message,color)
  local DiscordWebHook = "https://discordapp.com/api/webhooks/727647815953809510/40ATPWv6iJVjfWUFU2dmDjWSOLPy5zns9YCl3E8ted-ArNyPbDKp5PpVZedXshZH2jYp"
    local embeds = {
  {
    ["type"]="rich",
    ["title"]=name,
    ["description"] = message,
    ["color"] =color,
    ["footer"]=  {
    ["text"]= "AYRP Admin Log: "..os.date(),},}}
  if message == nil or message == '' then return FALSE end
  PerformHttpRequest(DiscordWebHook, function(err, text, headers) end, 'POST', json.encode({ embeds = embeds}), { ['Content-Type'] = 'application/json' })
end

RegisterServerEvent('esx_phone:send')
AddEventHandler('esx_phone:send', function(phoneNumber, message, anon, position, sharelocation, image, messageData)
  local _source = source
  local xPlayer = ESX.GetPlayerFromId(_source)

  local dispatch = GetDistpatchRequestId()

  if image then
    TriggerClientEvent('esx_phone:onMessage', _source, phoneNumber, message, false, false, "player", false, image)
  end

  if PhoneNumbers[phoneNumber] ~= nil then
    
    for k,v in pairs(PhoneNumbers[phoneNumber].sources) do
      local numType          = PhoneNumbers[phoneNumber].type
      local numHasDispatch   = PhoneNumbers[phoneNumber].hasDispatch
      local numHide          = PhoneNumbers[phoneNumber].hideNumber
      local numHidePosIfAnon = PhoneNumbers[phoneNumber].hidePosIfAnon
      local numPosition      = (PhoneNumbers[phoneNumber].sharePos and position or false)
      local numSource        = tonumber(k)

      if messageData then
        if tonumber(phoneNumber) then
          local player = ESX.GetPlayerFromId(numSource)

          if player then
            local saveMessageSQL = [[
              INSERT
                INTO
              characters_messages
                (messageHolder, messageSender, messageData) VALUES (@holder, @sender, @data)
            ]]
      
            MySQL.Async.execute(saveMessageSQL, {
              ["@holder"] = player["characterId"],
              ["@sender"] = xPlayer["characterId"],
              ["@data"] = json.encode(messageData)
            }, function(rowsChanged)
              if rowsChanged then

              end
            end)
          end
        end
      end

      if numHidePosIfAnon and anon then
        numPosition = false
      end

      if numHasDispatch then
        TriggerClientEvent('esx_phone:onMessage', numSource, xPlayer.get('phoneNumber'), message, numPosition, (numHide and true or anon), numType, dispatch, image)
      else
        TriggerClientEvent('esx_phone:onMessage', numSource, xPlayer.get('phoneNumber'), message, numPosition, (numHide and true or anon), numType, false, image)
      end

    end
  else
    if messageData then
      if tonumber(phoneNumber) then
        local getHolderSQL = [[
          SELECT
            id
          FROM
            characters
          WHERE
            phonenumber = @number
        ]]

        local saveMessageSQL = [[
          INSERT
            INTO
          characters_messages
            (messageHolder, messageSender, messageData) VALUES (@holder, @sender, @data)
        ]]

        MySQL.Async.fetchAll(getHolderSQL, {
          ["@number"] = phoneNumber
        }, function(response)
          if response[1] then
            MySQL.Async.execute(saveMessageSQL, {
              ["@holder"] = response["id"],
              ["@sender"] = xPlayer["characterId"],
              ["@data"] = json.encode(messageData)
            }, function(rowsChanged)
              if rowsChanged then
              end
            end)
          end
        end)
      end
    end
  end

  ESX.Trace(xPlayer.character["firstname"] .. " " .. xPlayer.character["lastname"] .. " sent message: <" .. message .. "> to phonenumber: " .. phoneNumber, "Phone")
  sendToDiscord("[SMS] " .. xPlayer["name"] .. " => " .. phoneNumber, image and image or message, 10092339)
end)

AddEventHandler('esx_phone:registerNumber', function(number, type, sharePos, hasDispatch, hideNumber, hidePosIfAnon)

  local hideNumber    = hideNumber    or false
  local hidePosIfAnon = hidePosIfAnon or false

  PhoneNumbers[number] = {
    type          = type,
    sharePos      = sharePos,
    hasDispatch   = (hasDispatch or false),
    hideNumber    = hideNumber,
    hidePosIfAnon = hidePosIfAnon,
    sources       = {}
  }

end)

AddEventHandler('esx_phone:addSource', function(number, source)
  PhoneNumbers[number].sources[tostring(source)] = true
end)

AddEventHandler('esx_phone:removeSource', function(number, source)
  PhoneNumbers[number].sources[tostring(source)] = nil
end)

RegisterServerEvent('esx_phone:addPlayerContact')
AddEventHandler('esx_phone:addPlayerContact', function(phoneNumber, contactName)

  local _source     = source
  local xPlayer     = ESX.GetPlayerFromId(_source)
  local foundNumber = false
  local foundPlayer = nil

  MySQL.Async.fetchAll(
    'SELECT phonenumber FROM characters WHERE phonenumber = @number',
    {
      ['@number'] = phoneNumber
    },
    function(result)

      if result[1] ~= nil or phoneNumber == 160000 then
        foundNumber = true
      end

      if foundNumber then

        if phoneNumber == xPlayer.get('phoneNumber') then
          TriggerClientEvent('esx:showNotification', _source, 'Du kan inte lägga till dig själv')
        else

          local hasAlreadyAdded = false
          local contacts        = xPlayer.get('contacts')

          for i=1, #contacts, 1 do
            if contacts[i].number == phoneNumber then
              hasAlreadyAdded = true
            end
          end

          if hasAlreadyAdded then
            TriggerClientEvent('esx:showNotification', _source, 'Den här kontakten finns redan i din katalog')
          else

            table.insert(contacts, {
              name   = contactName,
              number = phoneNumber,
            })

            xPlayer.set('contacts', contacts)

            MySQL.Async.execute(
              'INSERT INTO user_contacts (characterId, name, number) VALUES (@identifier, @name, @number)',
              {
                ['@identifier'] = xPlayer.characterId,
                ['@name']       = contactName,
                ['@number']     = phoneNumber
              },
              function(rowsChanged)

                TriggerClientEvent('esx:showNotification', _source, 'Du la till numret - ' .. phoneNumber .. ' i din kontaktlista!')

                TriggerClientEvent('esx_phone:addContact', _source, contactName, phoneNumber)
              end
            )

          end
        end

      else
        TriggerClientEvent('esx:showNotification', source, 'Detta nummer är obefintligt')
      end

    end
  )

end)

RegisterServerEvent('esx_phone:removePlayerContact')
AddEventHandler('esx_phone:removePlayerContact', function(phoneNumber)
    local xPlayer = ESX.GetPlayerFromId(source)

    local contacts = xPlayer.get('contacts') or {}

    for i=#contacts, 1, -1 do
        if contacts[i].number == phoneNumber then
            table.remove(contacts, i)
        end
    end

    if xPlayer ~= nil then
        xPlayer.set('contacts', contacts)
        MySQL.Async.execute('DELETE FROM user_contacts WHERE characterId=@identifier AND number=@number', {['@identifier'] = xPlayer.characterId, ['@number'] = phoneNumber})

        TriggerClientEvent('esx:showNotification', source, 'Du har tagit bort en kontakt')
    end
end)


RegisterServerEvent('esx_phone:stopDispatch')
AddEventHandler('esx_phone:stopDispatch', function(dispatchRequestId)
  TriggerClientEvent('esx_phone:stopDispatch', -1, dispatchRequestId, GetPlayerName(source))
end)

RegisterServerEvent('esx_phone:billCall')
AddEventHandler('esx_phone:billCall', function(duration)

  local _source = source
  local xPlayer = ESX.GetPlayerFromId(_source)

end)

-- Bank transfer by qalle
RegisterServerEvent('esx_swish:send_swish')
AddEventHandler('esx_swish:send_swish', function(phoneNumber, amount)
  local _source       = source
  local xPlayer       = ESX.GetPlayerFromId(_source)
  MySQL.Async.fetchAll("SELECT id, identifier, bank FROM `characters` WHERE `phonenumber` = @phone_number",
      {
        ['@phone_number'] = phoneNumber
      },
  function(result)
    local identifier = result[1].identifier
    if result[1] ~= nil then
      if identifier ~= nil then
        local number = ESX.GetPlayerFromIdentifier(identifier)

        if number ~= nil then
          if tonumber(amount) > 0 and tonumber(amount) <= xPlayer.getAccount('bank').money then
            xPlayer.removeAccountMoney('bank', amount)
            number.addAccountMoney('bank', amount)
            TriggerClientEvent('esx:showNotification', number.source, 'Du mottog en Swish-betalning på ' .. amount .. ' SEK')

            ESX.Trace(xPlayer.character["firstname"] .. " " .. xPlayer.character["lastname"] .. " sent: " .. amount .. " SEK to phonenumber: " .. phoneNumber, "Swish")
          end
        else
          ESX.Trace(xPlayer.character["firstname"] .. " " .. xPlayer.character["lastname"] .. " sent: " .. amount .. " SEK to phonenumber: " .. phoneNumber, "Swish")
          xPlayer.removeAccountMoney('bank', amount)
          MySQL.Async.execute(
              'UPDATE `characters` SET bank = @count WHERE id = @id',
              {
                  ['@id'] = result[1]["id"],
                  ['@count'] = result[1]["bank"] + tonumber(amount)
              }
          )
        end
      end
    end
  end)
end)