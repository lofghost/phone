/* Twitter */
onNet('esx_phone:post_tweet', data => {
    //console.log('Twitter post :', data);
    emit('bingo_newcore:update', `INSERT INTO twitter_posts (sender, at, message, img, verified, time) VALUES ('${data.sender}', '${data.at}', '${data.message}', '${data.img}', '${data.verified}', ${Date.now()})`, result => {
        //console.log('Result is:', result);
        emit('esx_phone:load_tweets_all');
    });
});

onNet('esx_phone:load_tweets', src => {
    let _source = source;

    emit('bingo_newcore:query', `SELECT * FROM twitter_posts`, result => {
        // //console.log('result is: ', result);
        emitNet('esx_phone:sendnui', _source, {updateTwitter: true, tweets: result});
    });
});

onNet('esx_phone:load_tweets_all', () => {
    emit('bingo_newcore:query', `SELECT * FROM twitter_posts LIMIT 25`, result => {
        emitNet('esx_phone:sendnui', -1, {updateTwitter: true, tweets: result});
    });
});

onNet('esx_phone:register_twittername', data => {
    //console.log('register_twittername: ', data);
    emit('bingo_newcore:update', `INSERT INTO twitter_users (identifier, name, img, time) VALUES ('${data.identifier}', '${data.name}', '${data.img}', ${Date.now()})`, result => {
        //console.log('Twitter name registered =) ', result);
    });
});

onNet('esx_phone:check_twitter_name', data => {
    let _source = source;
    emit('bingo_newcore:update', `SELECT name FROM twitter_users WHERE LOWER(name) = '${data.toLowerCase()}'`, result => {
        emitNet('esx_phone:sendnui', _source, {twitterCheck: true, passed: result.length ? false : true});
    });
});

onNet('esx_phone:load_twittername', () => {
    let _source = source;
    let identifier = GetPlayerIdentifier(_source);

    emit('bingo_newcore:update', `SELECT name, img, verified FROM twitter_users WHERE identifier='${identifier}'`, result => {
        if(result.length){
            emitNet('esx_phone:sendnui', _source, {updateTwitterName: true, twitterName: result[0].name, twitterImg: result[0].img, twitterVerified: result[0].verified});
        }
    });
});

onNet('esx_phone:set_verified', src => {
    let _source = src ? src : source;
    let identifier = GetPlayerIdentifier(_source);
    //console.log('Trying to verify: ', identifier);
    emit('bingo_newcore:update', `UPDATE twitter_users SET verified=1 WHERE identifier='${identifier}'`, result => {

    });
});

onNet('esx_phone:tweet_at_user', name => {
    name = name.replace('@', '').replace('\n', '');
    ////console.log('Name to compare is "' + name + '"');
    emit('bingo_newcore:query', `SELECT identifier FROM twitter_users WHERE LOWER(name) = '${name.toLowerCase()}'`, result => {
        if(result.length){
            for(let i = 1; i <= 31; i++){
                let identifier = GetPlayerIdentifier(i);
                if(identifier){
                    if(identifier == result[0].identifier){
                        ////console.log('Tweet at user found: ', identifier);
                        emitNet('esx_phone:tweet_at_user', i);
                    }
                }
            }
        } else {
            ////console.log('no result.');
        }
    });
});
