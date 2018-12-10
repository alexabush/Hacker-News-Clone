$(function() {
  /* dev functions */
  function border($element) {
    $element.css('border', '10px solid black');
  }
  console.clear();

  /* production functions */

  $('form').hide();
  console.log('function running');
  //returns to home page when hack or snooze text clicked
  $('#nav__hack-or-snooze').on('click', function() {
    $profileMain.addClass('dont-display');
    $('#article__list').removeClass('dont-display');
    loadAllStories();
  });

  $('#submit-nav').on('click', function() {
    if (localStorage.getItem('token') === null) return;
    $('#form__submit').slideToggle(1000);
  });

  // change so doesn't work if sign up is displayed
  const $formSignup = $('#form__signup');
  const $formSignin = $('#form__signin');

  $('#nav__signin').on('click', function() {
    if ($formSignup.is(':visible')) {
      $formSignup.slideToggle(1000)
    } else {
      $formSignin.slideToggle(1000);
    }
  });

  $('#has-existing-login').click(() => {
    $formSignup.hide();
    $formSignin.show();
    return false;
  });

  $('#no-account-sign-up').click(() => {
    $formSignin.hide();
    $formSignup.show();
    return false;
  });

  $('#nav__logout').on('click', function() {
    logOutUser();
    setWelcomeText();
    $('#nav__signin').removeClass('dont-display');
    $('#nav__signup').removeClass('dont-display');
    $('#nav__logout').addClass('dont-display');
    $('#nav__profile').addClass('dont-display');
  });

  //Favoriting NAV  AND DISPLAYING ONLY FAVORITES WHEN ONE CLICKS "FAVORITE"

  $('#fav-nav').on('click', function() {
    debugger;
    event.preventDefault();
    let $favNavTitle = $(this);
    if ($favNavTitle.text() == $favNavTitle.data('text-swap')) {
      $favNavTitle.text($favNavTitle.data('text-original'));
    } else {
      $favNavTitle.data('text-original', $favNavTitle.text());
      $favNavTitle.text($favNavTitle.data('text-swap'));
    }
    $('li:not(.favorite)').toggleClass('dont-display');
  });

  //SUBMIT FORM JS
  let $formSub = $('#form__submit');
  $($formSub).on('submit', function() {
    event.preventDefault();
    let titleVal = $('#title').val();
    let url = $('#url').val();
    let author = $('#author').val();
    addStory(getUsername(), titleVal, author, url).then(function(res) {
      $formSub.trigger('reset');
      $formSub.slideToggle(1000);
      loadAllStories();
    });
  });

  //SIGN IN FORM JS
  // let $formSignin = $('#form__signin');
  $($formSignin).on('submit', function() {
    event.preventDefault();
    let username = $('#username').val();
    let password = $('#password').val();
    login(username, password).then(function(res) {
      localStorage.setItem('token', res.data.token);
      $formSignin.trigger('reset');
      $formSignin.slideToggle(1000);
      setWelcomeText(username);
      $('#nav__signin').addClass('dont-display');
      $('#nav__signup').addClass('dont-display');
      $('#nav__logout').removeClass('dont-display');
      $('#nav__profile').removeClass('dont-display');
    });
  });

  //SIGN UP FORM JS

  // async function signUpUserWrittenByElie() {
  //   let name = $('#name__signup').val();
  //   let username = $('#username__signup').val();
  //   let password = $('#password__signup').val();
  //   try {
  //     let res = await signUpUser(name, username, password);
  //     let nextRes = await login(username, password);
  //     localStorage.setItem('token', res.data.token);
  //   } catch (e) {
  //     alert('you messed up!');
  //   }
  //   return username;
  // }

  let $formSignUp = $('#form__signup');
  $($formSignUp).on('submit', function() {
    event.preventDefault();
    let name = $('#name__signup').val();
    let username = $('#username__signup').val();
    let password = $('#password__signup').val();
    // debugger;
    signUpUser(name, username, password)
      .then(function(res) {
        return login(username, password);
      })
      .then(function(res) {
        // signUpUserWrittenByElie().then(function(username) {
        $formSignUp.trigger('reset');
        //slide up isn't working, not sure why not
        $formSignUp.slideToggle(1000);
        setWelcomeText(username);
        $('#nav__signin').addClass('dont-display');
        $('#nav__signup').addClass('dont-display');
        $('#nav__logout').removeClass('dont-display');
        $('#nav__profile').removeClass('dont-display');
      });
  });
  // });

  $('#nav__profile').on('click', function() {
    event.preventDefault();
    let $profileMain = $('#profile__main');
    let $profileMainDiv = $('#profile__main div');
    $('#article__list').addClass('dont-display');
    $profileMain.removeClass('dont-display');
    getUserInfo(getUsername()).then(function(res) {
      let { favorites, stories } = res.data;
      let name = $('<p>').text(`Name: ${res.data.name}`);
      let username = $('<p>').text(`Username: ${res.data.username}`);
      $('#profile__main div').empty();
      $profileMainDiv.append(name, username);
      for (let i = 0; i < favorites.length; i++) {
        let { title, url, author, username, storyId } = favorites[i];
        appendArticle(
          $profileMainDiv,
          title,
          url,
          author,
          username,
          storyId,
          true
        );
      }
      for (let i = 0; i < stories.length; i++) {
        let { title, url, author, username, storyId } = stories[i];
        appendArticle(
          $profileMainDiv,
          title,
          url,
          author,
          username,
          storyId,
          true
        );
      }
    });
  });

  function appendArticle(
    appendLocation,
    title,
    url,
    author,
    username,
    storyId,
    addDeleteButton
  ) {
    let $newArticle = $('<li>').addClass('profile__main--story');
    let $container = $('<div>');
    let $span1 = $('<span>').html(
      '<i class="far fa-star fa-sm" style="color:lightgrey"></i>'
    );
    let $span2 = $('<span>').html(
      `<a href="${url}" target="_blank" class="text-muted">&nbsp;(${url})</a>`
    );
    let $p = $('<p>').text(`Posted By: ${username} | Author: ${author}`);
    let $span3 = $('<span>')
      .attr('id', 'storyId')
      .addClass('dont-display')
      .text(storyId);

    $container.append($span1, title, $span2, $p, $span3);
    $newArticle.append($container);
    if (addDeleteButton === true) {
      let $deleteBtn = $('<button>', {
        text: 'X',
        class: 'btn btn-secondary btn-xs',
        css: {
          height: 40
        }
      });
      $newArticle.append($deleteBtn);
    }
    appendLocation.append($newArticle);
  }

  /* STAR CLICK EVENT HANDLER*/
  $('ol').on('click', '.fa-star', function(event) {
    let $target = $(event.target);
    let storyId = $target
      .closest('li')
      .find('#storyId')
      .text()
      .trim();
    if ($target.closest('li').hasClass('favorite')) {
      removeFavoriteStory(getUsername(), storyId).then(function(res) {
        $target.toggleClass('far fa-star fas fa-star');
        $target.closest('li').toggleClass('favorite');
      });
    } else {
      addFavoriteStory(getUsername(), storyId).then(function(res) {
        $target.toggleClass('far fa-star fas fa-star');
        $target.closest('li').toggleClass('favorite');
      });
    }
  });

  $('#profile__main').on('click', '.fa-star', function(event) {
    let $target = $(event.target);
    let storyId = $(event.target)
      .closest('li')
      .find('#storyId')
      .text()
      .trim();
    if ($target.closest('li').hasClass('favorite')) {
      removeFavoriteStory(getUsername(), storyId).then(function(res) {
        $target.toggleClass('far fa-star fas fa-star');
        $target.closest('li').toggleClass('favorite');
      });
    } else {
      addFavoriteStory(getUsername(), storyId).then(function(res) {
        $target.toggleClass('far fa-star fas fa-star');
        $target.closest('li').toggleClass('favorite');
      });
    }
  });

  /* AJAX BUSINESSS */
  /*##################################*/
  (function main() {
    loadAllStories();
  })();

  function loadAllStories() {
    getStories().then(function(stories) {
      const data = stories.data;
      const $ol = $('ol');
      $ol.empty();
      data.forEach(function(story) {
        appendArticle(
          $ol,
          story.title,
          story.url,
          story.author,
          story.username,
          story.storyId
        );
        //can be updated to get more info
      });
    });
  }

  /*POPULATE STORIES FOR NON LOGGED IN USER*/
  function getStories() {
    return $.getJSON('https://hack-or-snooze.herokuapp.com/stories');
  }

  /*CREATE NEW USER ACCOUNT*/
  function signUpUser(name, username, password) {
    // debugger;
    return $.ajax({
      method: 'POST',
      url: 'https://hack-or-snooze.herokuapp.com/users',
      data: {
        data: {
          name,
          username,
          password
        }
      }
    });
  }
  // });

  /*LOGIN EXISTING USER*/
  function login(username, password) {
    // debugger;
    return $.ajax({
      method: 'POST',
      url: 'https://hack-or-snooze.herokuapp.com/auth',
      data: {
        data: {
          username,
          password
        }
      }
    });
  }

  /*Set Welcome Text*/
  function setWelcomeText(username) {
    if (username === undefined) $('#welcome-text').addClass('dont-display');
    else {
      $('#welcome-text').removeClass('dont-display');
      $('#welcome-text').text(`Welcome ${username}`);
    }
  }

  /*Get Individual User Document*/
  function getUserInfo(username) {
    // debugger;
    let token = localStorage.getItem('token');
    return $.ajax({
      method: 'GET',
      url: `https://hack-or-snooze.herokuapp.com/users/${username}`,
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  function deleteStory(storyId) {
    let token = localStorage.getItem('token');
    return $.ajax({
      method: 'DELETE',
      url: `https://hack-or-snooze.herokuapp.com/users/${username}/favorites/${storyId}`,
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  /*ADD STORY TO LOGGED IN USER*/
  function addStory(username, title, author, url) {
    // debugger;
    let token = localStorage.getItem('token');
    return $.ajax({
      method: 'POST',
      url: 'https://hack-or-snooze.herokuapp.com/stories',
      headers: {
        Authorization: `Bearer ${token}`
      },
      data: {
        data: {
          username,
          title,
          author,
          url
        }
      }
    });
  }

  function getUserList() {
    // debugger;
    let token = localStorage.getItem('token');
    return $.ajax({
      url: 'https://hack-or-snooze.herokuapp.com/users',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  function getUsername() {
    let token = localStorage.getItem('token');
    return JSON.parse(atob(token.split('.')[1])).username;
  }

  function addFavoriteStory(username, storyId) {
    // debugger;
    let token = localStorage.getItem('token');
    return $.ajax({
      method: 'POST',
      url: `https://hack-or-snooze.herokuapp.com/users/${username}/favorites/${storyId}`,
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  function removeFavoriteStory(username, storyId) {
    let token = localStorage.getItem('token');
    return $.ajax({
      method: 'DELETE',
      url: `https://hack-or-snooze.herokuapp.com/users/${username}/favorites/${storyId}`,
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  /* 
LOG OUT
*/
  function logOutUser() {
    localStorage.clear();
    $('form').hide();
  }
});
