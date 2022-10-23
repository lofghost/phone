resource_manifest_version '44febabe-d386-4d18-afbe-5e627f4af937'

description 'ESX Phone'

version '1.0.0'

server_scripts {
  '@mysql-async/lib/MySQL.lua',
  'config.lua',
  'server/main.lua',
  'server/spotify.js',
  'server/twitter.js',
  'server/car-app.js',
  'server/database.lua',
  'server/camera.lua'
}

client_scripts {
  'config.lua',
  'client/main.lua',
  'client/car-app.js',
  'client/currentvehicle.js',
  'client/camera.lua'
}

ui_page 'html/index.html'

files {
  'html/css/animate.css',
  'html/css/app.css',
  'html/css/settings.css',
  'html/css/car.css',
  'html/css/spotify.css',
  'html/css/darkweb.css',
  'html/css/camera-app.css',
  'html/css/images-app.css',
  'html/css/twitter.css',
  'html/css/companies.css',
  'html/css/font-awesome.css',
  'html/fonts/fontawesome-webfont.eot',
  'html/fonts/fontawesome-webfont.svg',
  'html/fonts/fontawesome-webfont.ttf',
  'html/fonts/fontawesome-webfont.woff',
  'html/fonts/fontawesome-webfont.woff2',
  'html/fonts/FontAwesome.otf',
  'html/img/apps/bank/logo.png',
  'html/img/backgroundPhone.png',
  'html/img/deadBackground.png',
  'html/img/deadBackgroundAnimated.png',
  'html/img/phone.png',
  'html/img/apps/icons/spotify-brand.png',
  'html/img/apps/icons/verified.png',
  'html/img/apps/icons/post.png',
  'html/img/apps/settings/space.jpg',
  'html/img/apps/settings/hitman.jpg',
  'html/img/apps/settings/mountain.jpg',
  'html/img/apps/settings/abstract.jpg',
  'html/img/apps/icons/rotate-camera.png',
  'html/index.html',

  'html/ogg/incoming-call.ogg',
  'html/ogg/svampbob.ogg',
  'html/ogg/gammal.ogg',
  'html/ogg/modern.ogg',
  'html/ogg/croads.ogg',
  'html/ogg/songpop.ogg',
  'html/ogg/outgoing-call.ogg',
  'html/ogg/sms_receive.ogg',

  'html/ogg/letmeloveyou.ogg',
  'html/ogg/closer.ogg',
  'html/ogg/djsnake.ogg',
  'html/ogg/sexualhealing.ogg',
  'html/ogg/snapshot.ogg',
  'html/ogg/shape_of_you_marimba.ogg',
  'html/ogg/takitaki.ogg',
  'html/ogg/talkdirty.ogg',
  'html/ogg/knas.ogg',

  'html/ogg/sms_send.ogg',
  'html/scripts/app.js',
  'html/scripts/rtc.js',

  'html/scripts/apps/bank.js',
  'html/scripts/apps/bank-transfer.js',
  'html/scripts/apps/bank-transfer-menu.js',
  'html/scripts/apps/home.js',
  'html/scripts/apps/messages.js',
  'html/scripts/apps/incoming-call.js',
  'html/scripts/apps/settings.js',
  'html/scripts/apps/darkweb.js',
  'html/scripts/apps/twitter.js',
  'html/scripts/apps/car-app.js',
  'html/scripts/apps/camera-app.js',
  'html/scripts/apps/images-app.js',
  'html/scripts/apps/car-play.js',
  'html/scripts/apps/contacts.js',
  'html/scripts/apps/companies.js',
  'html/scripts/apps/contact-add.js',
  'html/scripts/apps/contact-actions.js',
  'html/scripts/apps/contact-action-call.js',
  'html/scripts/apps/contact-action-message.js',
  'html/scripts/apps/dead.js',
  'html/scripts/mustache.min.js',

}

exports {
  "getBattery"
}