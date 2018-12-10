$(function() {
  /* dev functions */
  function border($element) {
    $element.css('border', '10px solid black');
  }
  console.clear();

  /* production functions */

  $('form').hide();
  console.log('function running');
  let $navSignin = $('#nav__signin');
  let $navSignup = $('#nav__signup');
  let $navLogout = $('#nav__logout');
  let $navProfile = $('#nav__profile');

  const $formSignup = $('#form__signup');
  const $formSignin = $('#form__signin');
  let $formSubmit = $('#form__submit');

  let $profileMain = $('#profile__main');
  let $profileMainDiv = $('#profile__main div');

  let $articleList = $('#article__list');
  //returns to home page when hack or snooze text clicked
  $('#nav__hack-or-snooze').on('click', function() {
    $profileMain.addClass('dont-display');
    $articleList.removeClass('dont-display');
    loadAllStories();
  });

  $('#submit-nav').on('click', function() {
    if (localStorage.getItem('token') === null) return;
    $formSubmit.slideToggle(1000);
  });

  $navSignin.on('click', function() {
    if ($formSignup.is(':visible')) {
      $formSignup.slideToggle(1000);
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

  $navLogout.on('click', function() {
    logOutUser();
    setWelcomeText();
    $navSignin.removeClass('dont-display');
    $navSignup.removeClass('dont-display');
    $navLogout.addClass('dont-display');
    $navProfile.addClass('dont-display');
  });

  //SIGN IN FORM SUBMISSION
  $($formSignin).on('submit', function() {
    event.preventDefault();
    let username = $('#username').val();
    let password = $('#password').val();
    login(username, password).then(function(res) {
      localStorage.setItem('token', res.data.token);
      $formSignin.trigger('reset');
      $formSignin.slideToggle(1000);
      setWelcomeText(username);
      $navSignin.addClass('dont-display');
      $navSignup.addClass('dont-display');
      $navLogout.removeClass('dont-display');
      $navProfile.removeClass('dont-display');
    });
  });

  $($formSignup).on('submit', function() {
    event.preventDefault();
    let name = $('#name__signup').val();
    let username = $('#username__signup').val();
    let password = $('#password__signup').val();
    signUpUser(name, username, password)
      .then(function(res) {
        return login(username, password);
      })
      .then(function(res) {
        $formSignup.trigger('reset');
        $formSignup.slideToggle(1000);
        setWelcomeText(username);
        $navSignin.addClass('dont-display');
        $navSignup.addClass('dont-display');
        $navLogout.removeClass('dont-display');
        $navProfile.removeClass('dont-display');
      });
  });

  //SUBMIT FORM
  $($formSubmit).on('submit', function() {
    event.preventDefault();
    let titleVal = $('#title').val();
    let url = $('#url').val();
    let author = $('#author').val();
    addStory(getUsername(), titleVal, author, url).then(function(res) {
      $formSubmit.trigger('reset');
      $formSubmit.slideToggle(1000);
      loadAllStories();
    });
  });

  $navProfile.on('click', function() {
    event.preventDefault();
    $articleList.addClass('dont-display');
    $profileMain.removeClass('dont-display');
    $profileMainDiv.empty();
    getUserInfo(getUsername()).then(function(res) {
      let { favorites, stories } = res.data;
      let name = $('<p>').text(`Name: ${res.data.name}`);
      let username = $('<p>').text(`Username: ${res.data.username}`);
      $profileMainDiv.append(name, username);
      //display stories, starred stories first, then unstarred
      for (let favorite of favorites) {
        let { title, url, author, username, storyId } = favorite;
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
      for (let story of stories) {
        let { title, url, author, username, storyId } = story;
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
      // .attr('id', 'storyId')
      .addClass('dont-display storyId')
      .text(storyId);

    $container.append($span1, title, $span2, $p, $span3);
    $newArticle.append($container);
    if (addDeleteButton === true) {
      let $deleteBtn = $('<button>', {
        text: 'X',
        class: 'btn btn-secondary btn-xs delete-btn',
        css: {
          height: 40
        }
      });
      $newArticle.append($deleteBtn);
    }
    appendLocation.append($newArticle);
  }

  // delete story handler
  $('.main').on('click', '.delete-btn', function(event) {
    $li = $(this).closest('li');
    let storyId = $li.find('.storyId').text()
    debugger
    deleteStory(getUsername(), storyId)
    $li.remove();
  });

  /* STAR CLICK EVENT HANDLER*/
  $('#article__list ol').on('click', '.fa-star', function(event) {
    let $target = $(event.target);
    let storyId = $target
      .closest('li')
      .find('.storyId')
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

  $profileMain.on('click', '.fa-star', function(event) {
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

  function deleteStory(username, storyId) {
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

  /* LOG OUT */
  function logOutUser() {
    localStorage.clear();
    $('form').hide();
  }
});
