local spawnedVehicles = {}

RegisterServerEvent("esx_phone:load_latest")
AddEventHandler("esx_phone:load_latest", function()
	local src = source

	local xPlayer = ESX.GetPlayerFromId(src)

	local sqlQuery = [[
		SELECT * FROM phone_latest WHERE identifier=@cid
	]]

	if xPlayer ~= nil then
		MySQL.Async.fetchAll(sqlQuery, { ["@cid"] = xPlayer.characterId}, function(response)
			if response[1] ~= nil then
				TriggerClientEvent('esx_phone:sendnui', src, { updateLatestCalls = true, data = response });
			end
		end)
	end
end)

RegisterServerEvent("esx_phone:add_latest")
AddEventHandler("esx_phone:add_latest", function(data)
	local src = source

	local xPlayer = ESX.GetPlayerFromId(src)

	local sqlQuery = [[
		INSERT INTO phone_latest (identifier, name, number, incoming, missed, time) VALUES (@cid, @name, @number, @incoming, @missed, @time)
	]]

	if xPlayer ~= nil then
		MySQL.Async.execute(sqlQuery, { ["@cid"] = xPlayer["characterId"], ["@name"] = data.name, ["@number"] = data.number, ["@incoming"] = data.incoming, ["@missed"] = data.missed, ["@time"] = data.time })
	end
end)

RegisterServerEvent("esx_phone:load_favorites")
AddEventHandler("esx_phone:load_favorites", function()
	local src = source

	local xPlayer = ESX.GetPlayerFromId(src)

	local sqlQuery = [[
		SELECT * FROM phone_favorites WHERE identifier=@cid
	]]

	if xPlayer ~= nil then
		MySQL.Async.fetchAll(sqlQuery, { ["@cid"] = xPlayer.characterId }, function(response)
			if response[1] ~= nil then
				TriggerClientEvent('esx_phone:sendnui', src, { updateFavorites = true, data = result })
			end
		end)
	end
end)

RegisterServerEvent("esx_phone:add_favorite")
AddEventHandler("esx_phone:add_favorite", function(data)
	local src = source

	local xPlayer = ESX.GetPlayerFromId(src)

	local sqlQuery = [[
		DELETE FROM phone_favorites WHERE identifier=@cid AND number=@number
	]]

	if xPlayer ~= nil then
		MySQL.Async.execute(sqlQuery, { ["@cid"] = xPlayer.characterId, ["number"] = data })

		TriggerEvent("esx_phone:load_favorites", src)
	end
end)

RegisterServerEvent("esx_phone:remove_favorite")
AddEventHandler("esx_phone:remove_favorite", function(data)
	local src = source

	local xPlayer = ESX.GetPlayerFromId(src)

	local sqlQuery = [[
		INSERT INTO phone_favorites (identifier, name, number, time) VALUES (@cid, @name, @number, @time)
	]]

	if xPlayer ~= nil then
		MySQL.Async.execute(sqlQuery, { ["@cid"] = xPlayer.characterId, ["@name"] = data.name, ["number"] = data.number, ["time"] = data.time })

		TriggerEvent("esx_phone:load_favorites", src)
	end
end)

RegisterServerEvent("esx_phone:save_settings")
AddEventHandler("esx_phone:save_settings", function(data)
	local src = source

	local xPlayer = ESX.GetPlayerFromId(src)

	local sqlQuery = [[
		REPLACE INTO phone_settings (identifier, settings) VALUES (@cid, @settings)
	]]

	if xPlayer ~= nil then
		MySQL.Async.execute(sqlQuery, { ["@cid"] = xPlayer.characterId, ["@settings"] = json.encode(data.settings) })
	end
end)

RegisterServerEvent("esx_phone:load_settings")
AddEventHandler("esx_phone:load_settings", function(identifier)
	local src = source

	local xPlayer = ESX.GetPlayerFromId(src)

	local sqlQuery = [[
		SELECT settings FROM phone_settings WHERE identifier=@cid
	]]

	if xPlayer ~= nil then
		MySQL.Async.fetchAll(sqlQuery, {["@cid"] = xPlayer.characterId }, function(response)
			if response[1] ~= nil then
				local settings = json.decode(response[1]["settings"])
				TriggerClientEvent("esx_phone:load_settings", src, settings)
			end
		end)
	end
end)

RegisterServerEvent("esx_phone:flightmode_off")
AddEventHandler("esx_phone:flightmode_off", function()
	local src = source

	TriggerEvent("esx_phone:load_latest", src)
end)

RegisterServerEvent("esx_phone:load_all")
AddEventHandler("esx_phone:load_all", function()
	local src = source

	TriggerEvent("esx_phone:load_favorites", src)
	TriggerEvent("esx_phone:load_latest", src)
end)

------------------ ### TWITTER ### ----------------

RegisterServerEvent("esx_phone:post_tweet")
AddEventHandler("esx_phone:post_tweet", function(data)
	local sqlQuery = [[
		INSERT INTO twitter_posts (sender, at, message, img, verified, time) VALUES (@sender, @at, @message, @img, @verified, @time)
	]]

	if data.verified == nil then
		data.verified = 0
	end

	MySQL.Async.execute(sqlQuery, {["@sender"] = data.sender, ["@at"] = data.at, ["@message"] = data.message, ["@img"] = data.img, ["@verified"] = data.verified, ["@time"] = data.time }, function(response)
		TriggerEvent("esx_phone:load_tweets_all")
	end)
end)

RegisterServerEvent("esx_phone:load_tweets")
AddEventHandler("esx_phone:load_tweets", function(src)
	local src = source

	local sqlQuery = [[
		SELECT * FROM twitter_posts ORDER BY id DESC LIMIT 20
	]]

	MySQL.Async.fetchAll(sqlQuery, {}, function(response)
		if response[1] then
			TriggerClientEvent('esx_phone:sendnui', src, {updateTwitter = true, tweets = response})
		end
	end)
end)

RegisterServerEvent("esx_phone:load_tweets_all")
AddEventHandler("esx_phone:load_tweets_all", function(src)
	local src = source

	local sqlQuery = [[
		SELECT * FROM twitter_posts ORDER BY id DESC LIMIT 20
	]]

	MySQL.Async.fetchAll(sqlQuery, {}, function(response)
		if response[1] then
			TriggerClientEvent('esx_phone:sendnui', -1, {updateTwitter = true, tweets = response})
		end
	end)
end)

RegisterServerEvent("esx_phone:register_twittername")
AddEventHandler("esx_phone:register_twittername", function(data)
	local xPlayer = ESX.GetPlayerFromId(source)

	local sqlQuery = [[
		INSERT INTO twitter_users (identifier, name, img, time) VALUES (@cid, @name, @img, @time)
	]]

	if xPlayer ~= nil then
		MySQL.Async.execute(sqlQuery, {["@cid"] = xPlayer.characterId, ["@name"] = data.name, ["@img"] = data.img, ["time"] = data.time }, function(response)

		end)
	end
end)

RegisterServerEvent("esx_phone:check_twitter_name")
AddEventHandler("esx_phone:check_twitter_name", function(data)
	local src = source

	local sqlQuery = [[
		SELECT name FROM twitter_users WHERE LOWER(name) = @name
	]]

	MySQL.Async.fetchAll(sqlQuery, { ["@name"] = string.lower(data) }, function(response)
		if response[1] ~= nil then
			TriggerClientEvent('esx_phone:sendnui', src, {twitterCheck = true, passed = false})
		else
			TriggerClientEvent('esx_phone:sendnui', src, {twitterCheck = true, passed = true})
		end
	end)
end)

RegisterServerEvent("esx_phone:load_twittername")
AddEventHandler("esx_phone:load_twittername", function()
	local src = source

	local xPlayer = ESX.GetPlayerFromId(src)

	local sqlQuery = [[
		SELECT name, img, verified FROM twitter_users WHERE identifier=@cid
	]]

	if xPlayer ~= nil then
		MySQL.Async.fetchAll(sqlQuery, { ["@cid"] = xPlayer.characterId }, function(response)
			if response[1] ~= nil then
				TriggerClientEvent('esx_phone:sendnui', src, {updateTwitterName = true, twitterName = response[1].name, twitterImg = response[1].img, twitterVerified = response[1].verified})
			else
				TriggerClientEvent('esx_phone:sendnui', src, {updateTwitterName = true, twitterName = nil, twitterImg = nil, twitterVerified = nil})
			end
		end)
	end
end)

RegisterServerEvent("esx_phone:tweet_at_user")
AddEventHandler("esx_phone:tweet_at_user", function(name)
	local src = source

	local sqlQuery = [[
		SELECT identifier FROM twitter_users WHERE LOWER(name) = @name
	]]

	MySQL.Async.fetchAll(sqlQuery, { ["@name"] = string.lower(name) }, function(response)
		if response[1] ~= nil then
			local Players = ESX.GetPlayers()

			for i = 1, #Players do
				local xPlayer = ESX.GetPlayerFromId(Players[i])

				if xPlayer ~= nil then
					if xPlayer["characterId"] == response[1]["name"] then
						TriggerClientEvent("esx_phone:tweet_at_user", src, i)
					end
				end
			end
		end
	end)
end)

RegisterServerEvent("esx_phone:update_vehicle_list")
AddEventHandler("esx_phone:update_vehicle_list", function()
	local src = source

	local player = ESX.GetPlayerFromId(src)

	local sqlQuery = [[
		SELECT * FROM characters_vehicles WHERE owner=@cid
	]]

	if player ~= nil then
		MySQL.Async.fetchAll(sqlQuery, { ["@cid"] = player["characterId"] }, function(response)
			if response[1] ~= nil then
				local data = {
					source = src,
					first = 1,
					updateVehicles = true,
					vehicles = response,
					found = true,
					vehicle = response[1]
				}

				TriggerClientEvent('esx_phone:vehicles_sendnui', src, data)
			end
		end)
	end
end)

---------------

RegisterCommand("loadme", function(source)
	TriggerEvent("esx:playerLoaded", source)
end)