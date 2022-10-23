(function() {
  Phone.apps['camera-app'] = {};
  const app = Phone.apps['camera-app'];
  const headerList = $('#app-camera-app .camera-app-header-item');
  const contentList = $('#app-camera-app .camera-app-content-item');
  let activeList = headerList;
  let activeIndex = 1;
  let landscape = false;
  let callSound = null;
  let lastPhotoTaken = null;

  app.open = function (data) {
    setActive(headerList[2], 2);
    // console.log('LOL: ', Phone.photos);
    updateImage();
    Phone.emitClientEvent('esx_phone:start_camera');
    // $.post('http://esx_phone3/darkweb_post_message', JSON.stringify({text: 'Started application..', time: Date.now()}))
  };

  // console.log(headerList);
  // console.log(contentList);

  app.move = function (direction) {

    if (landscape) {
      switch (direction) {
        case 'TOP':
          handleMoveTop();
          break;
        case 'DOWN':
          handleMoveDown();
          break;
        case 'LEFT':
          changeList();
          break;
        case 'RIGHT':
          changeList();
          break;
        default:
          break;
      }
    } else {
      switch (direction) {
        case 'TOP':
          changeList();
          break;
        case 'DOWN':
          changeList();
          break;
        case 'LEFT':
          handleMoveDown();
          break;
        case 'RIGHT':
          handleMoveTop();
          break;
        default:
          break;
      }
    }
    handleMove();
  };

  app.update = function (data) {
    updateImage();
  };


  $(document).on('click', () => {
    app.enter();
  });

  app.enter = function () {
    const action = $(activeList[activeIndex]).data('action');
    if (action === 'take_photo') {
      takePhoto();
    } else if(action === 'switch_camera') {
      Phone.emitClientEvent(`esx_phone:${action}`);
    } else if(action === 'open_images_app') {
      safeClose();
      setTimeout(() => {
        Phone.opened = ['home'];
        Phone.open('images-app');
      }, 1000);
    }
  };

  app.close = function () {
    setActiveIndex(null);
    handleMove();
    $('#screen').css({
      backgroundImage: `url(${Phone.settings.background.url})`
    });

    safeClose();
    return true;
  };


  function safeClose() {

    Phone.emitClientEvent('esx_phone:exit_camera');
    $.post('http://esx_phone3/release_focus');

    $('#phone').removeClass('camera-app-portrait');
    $('#phone').removeClass('camera-app-landscape');
    setTimeout(() => {
      $('#phone').removeClass('camera-app-position');
    }, 400);
  }


  function takePhoto () {
    // PHOTO TIME, DELAY TIME, DELAY
    if (lastPhotoTaken + 2000 > Date.now()) {
      return;
    }
    lastPhotoTaken = Date.now();
    Phone.emitClientEvent(`esx_phone:take_photo`, landscape ? 'landscape' : 'portrait');
    
    /* Play sound etc */  
    callSound      = new Audio('ogg/snapshot.ogg');
    callSound.loop = false;
    
    callSound.play();
    
    setTimeout(() => {
      if(callSound != null) {
        callSound.pause();
        callSound = null;
      }
    }, 500);
  }
  
  function handleMoveDown () {
    let newIndex = activeIndex - 1;
    
    // console.log('newindex: ', newIndex);
    // console.log('activeList: ', activeList);

    if (newIndex < 0) {
      newIndex = activeList.length - 1
    }

    setActive(activeList[newIndex], newIndex)
  }

  function handleMoveTop () {
    let newIndex = activeIndex + 1;

    if (newIndex >= activeList.length) {
      newIndex = 0
    }

    setActive(activeList[newIndex], newIndex)
  }

  function changeList () {
    if (activeList === headerList) {
      activeList = contentList;
      setActive(contentList[1], 1);
    } else {
      activeList = headerList;
      setActive(headerList[2], 2);
    }
  }


  function setActive (element, index) {
    setActiveIndex(index)
    $('#app-camera-app .active').removeClass('active');
    $(element).addClass('active');
  }

  function setActiveIndex (index) {
    activeIndex = index;
  }


  function updateImage () {
    const photoLength = Phone.photos.length;

    if (photoLength) {
      const link = Phone.photos[photoLength - 1].link;

      $('#app-camera-app .menu-content-image').css({
        backgroundImage: `url(${link})`
      });

    }
  }


  function handleMove () {
    // console.log('moving: ', activeList[activeIndex]);
    if (activeList === headerList) {
      //console.log('Active list is header list');
      switch (activeIndex) {
        case 0:

          /* Slow-mo */
          $('#app-camera-app .menu-header ul').css({
            left: '96px'
          });
          break;
        case 1:

          /* Landscape */
          $('#app-camera-app .menu-header ul').css({
            left: '23px'
          });
          $('#phone').removeClass('camera-app-portrait');
          $('#phone').addClass('camera-app-landscape');
          landscape = true;
          break;
        case 2:

          /* Photo */
          $('#app-camera-app .menu-header ul').css({
            left: '-50px'
          });
          $('#phone').removeClass('camera-app-landscape');
          $('#phone').addClass('camera-app-portrait');
          landscape = false;
          break;
        case 3:

          /* Portrait */
          $('#app-camera-app .menu-header ul').css({
            left: '-117px'
          });
          break;
        case 4:

          /* Square */
          $('#app-camera-app .menu-header ul').css({
            left: '-187px'
          });
          break;
        default:
          $('#app-camera-app .menu-header ul').css({
            left: '-59px'
          });
          break;
      }
    }
  }

})();
