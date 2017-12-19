/* jshint esversion: 6 */

/* eslint-disable */

angular.module('mean.system')
.controller('GameController', ['$scope', 'socket', 'game', '$timeout', '$location', 'MakeAWishFactsService', '$http', '$window', '$dialog', function ($scope, socket, game, $timeout, $location, MakeAWishFactsService, $http, $window, $dialog) {
    $scope.hasPickedCards = false;
    $scope.winningCardPicked = false;
    $scope.showTable = false;
    $scope.game = game;
    $scope.pickedCards = [];

    $scope.inviteCounter = 0;
    $scope.invited = [];
    $scope.inviteList = [];
    $scope.notifications = [];

    var makeAWishFacts = MakeAWishFactsService.getMakeAWishFacts();
    $scope.makeAWishFact = makeAWishFacts.pop();
    
    $scope.pickCard = function(card) {
      playTone('beep1');
      if (!$scope.hasPickedCards) {
        if ($scope.pickedCards.indexOf(card.id) < 0) {
          $scope.pickedCards.push(card.id);
          if (game.curQuestion.numAnswers === 1) {
            $scope.sendPickedCards();
            $scope.hasPickedCards = true;
          } else if (game.curQuestion.numAnswers === 2 &&
            $scope.pickedCards.length === 2) {
            //delay and send
            $scope.hasPickedCards = true;
            $timeout($scope.sendPickedCards, 300);
          }
        } else {
          $scope.pickedCards.pop();
        }
      }
    };

    $scope.startGame = function() {
      if(game.players.length < game.playerMinLimit) {
        const infoModal = $('#infoModal');
        infoModal.find('.modal-title')
          .text('Player requirement');
        infoModal.find('.modal-body')
         .text('Oops! Can\'t start game now, you need a minimum of (3) players to get started');
        infoModal.modal('show');
      } else {
        game.startGame();
      }
    };


    $scope.pointerCursorStyle = function() {
      if ($scope.isCzar() && $scope.game.state === 'waiting for czar to decide') {
        return {'cursor': 'pointer'};
      } else {
        return {};
      }
    };

    $scope.sendPickedCards = function() {
      game.pickCards($scope.pickedCards);
      $scope.showTable = true;
    };

    $scope.cardIsFirstSelected = function(card) {
      if (game.curQuestion.numAnswers > 1) {
        return card === $scope.pickedCards[0];
      } else {
        return false;
      }
    };

    $scope.cardIsSecondSelected = function(card) {
      if (game.curQuestion.numAnswers > 1) {
        return card === $scope.pickedCards[1];
      } else {
        return false;
      }
    };

    $scope.firstAnswer = function($index){
      if($index % 2 === 0 && game.curQuestion.numAnswers > 1){
        return true;
      } else{
        return false;
      }
    };

    $scope.secondAnswer = function($index){
      if($index % 2 === 1 && game.curQuestion.numAnswers > 1){
        return true;
      } else{
        return false;
      }
    };

    $scope.showFirst = function(card) {
      return game.curQuestion.numAnswers > 1 && $scope.pickedCards[0] === card.id;
    };

    $scope.showSecond = function(card) {
      return game.curQuestion.numAnswers > 1 && $scope.pickedCards[1] === card.id;
    };

    $scope.isCzar = function() {
      return game.czar === game.playerIndex;
    };

    $scope.isPlayer = function($index) {
      return $index === game.playerIndex;
    };

    $scope.isCustomGame = function() {
      return !(/^\d+$/).test(game.gameID) && game.state === 'awaiting players';
    };

    $scope.isPremium = function($index) {
      return game.players[$index].premium;
    };

    $scope.currentCzar = function($index) {
      return $index === game.czar;
    };

    $scope.winningColor = function($index) {
      if (game.winningCardPlayer !== -1 && $index === game.winningCard) {
        return $scope.colors[game.players[game.winningCardPlayer].color];
      } else {
        return '#f9f9f9';
      }
    };

    $scope.pickWinning = function(winningSet) {
      if ($scope.isCzar()) {
        playTone('beep2', 0.4);
        game.pickWinning(winningSet.card[0]);
        $scope.winningCardPicked = true;
      }
    };

    $scope.winnerPicked = function() {
      return game.winningCard !== -1;
    };

    $scope.shuffleCards = () => {
      const card = $(`#${event.target.id}`);
      card.addClass('animated flipOutY');
      setTimeout(() => {
        $scope.startNextRound();
        card.removeClass('animated flipOutY');
        $('#start-modal').modal('hide');
      }, 500);
    };

    $scope.startNextRound = () => {
      playTone('newRound');
      if ($scope.isCzar()) {
        game.startNextRound();
      }
    };


    $scope.startModal = function() {
      $('#start').modal({
        show: true,
        backdrop: 'static',
        keyboard: false
      });
    };

    $scope.dismissInfo = function() {
      $('#infoModal').modal('hide');
      $scope.startModal();
    };

    $scope.abandonGame = function() {
      game.leaveGame();
      $location.path('/');
      $('#start').modal('hide');
      $('body').removeClass('modal-open');
      $('.modal-backdrop').remove();
    };

    // search user function
    $scope.search = function() {
      const { identifier } = $scope;
      if (identifier && identifier.length !== 0) {
        $http({
          method: 'GET',
          url: `/api/search/users?q=${identifier}`
        }).then((response) => { 
          const users = response.data.user;
          if (users && users.length !== 0) {
            email = game.players[game.playerIndex].email;
            $scope.users = users.filter(e => e.email !== email);
            $scope.usersShow = true;
          }
          $scope.result = true;
          $scope.message = response.data.message;
          if ($scope.message) {
            $scope.users = '';
          }
        });
      }
    };

    // Pop up modals
    $scope.invitePlayers = function() {
      $scope.result = false;
      $('#search').modal('show');
    };

    $scope.viewNotification = function() {
      $('#notify').modal('show');
    };

    // Send invite to users
    $scope.sendInvite = (email, _id, btn) => {
      if ($scope.inviteCounter !== 11) {

        $http.post('/api/users/invite', {
          email: email,
          gameLink: document.URL 
        }).then((response, err) => {
          if (response.status === 200) {
            $scope.invited.push(_id);
          } 
          $scope.inviteCounter++; 
          $scope.inviteMsg = `You have Sent Invtes to ${$scope.inviteCounter} Players`;
        }, function(err) {
          $scope.inviteMsg = err.data.message;
        });
      } else {
        $scope.inviteMsg = 'You cannot invite more that 11 Players.';
      }
    };
    
    // Set http header
    $scope.setHttpHeader = () => {
      const token = $window.localStorage.getItem('token');
      $http.defaults.headers.common.token = token;
    };

    // add friends

    $scope.addFriend = (friendName, friendId, friendEmail) => {
      const payload = {
        friendId,
        friendName,
        friendEmail
      };

      $scope.setHttpHeader();
      $http.put('/api/user/friends', payload)
        .then(
        (response) => {
          $scope.getFriendsList();
        },
        (error) => {
          $scope.getFriendsList();
        });

    };

    // get Friends list
    $scope.getFriendsList = () => {
      $scope.setHttpHeader();
      $http.get('/api/user/friends')
        .then(
        (response) => {
          $scope.friendsList = response.data;
          $scope.friendsId = response.data.map(friend => friend.friendId);
          
        },
        (error) => {
          $scope.friendsList = [];
        });
    };

    // remove friend
    $scope.removeFriend = (friendId) => {
      $scope.setHttpHeader();
      $http.delete(`/api/user/friends/${friendId}`).then((response) => {
        $scope.getFriendsList();
      }, (error) => {
        $scope.getFriendsList();
      });
    };

    // send notifications
    $scope.sendNotification =  (friendId, friendEmail) => {
      const payload = {
        link: document.URL,
        friendId
      };
      $scope.setHttpHeader();
      $http.post('/api/notifications', payload).then(
        (response) => {
          $scope.inviteList.push(friendId);
          userID = game.players.filter(e => e.email === friendEmail);
          if (userID.length > 0) {
            game.broadcastNotification(userID[0].socketID);
          }
        });
    };

   
    socket.on('notificationReceived', (userId) => {
      userID = game.players[game.playerIndex].socketID;
      if (userId === userID) {
        $scope.loadNotifications();
      }
    });

    

    $scope.loadNotifications = () => {
      $scope.setHttpHeader();
      $http.get('/api/notifications')
        .then(
        (response) => {
          $scope.notifications = response.data.notifications.sort(function(a, b){ return b.id - a.id; });
          if ($scope.notifications.length >= 1) {
            toastr.success(`You have ${$scope.notifications.length} new Notification${$scope.notifications.length >1?'s': ''}!`);
          }
        },
        (error) => {
          $scope.notifications = $scope.notifications;
        }
        );
    };

    $scope.loadNotifications();

    $scope.readNotifications = (id) => {
      $http.put(`/api/notification/${id}`).then((response) => {
          $scope.loadNotifications();
          },
          (error) => {
          $scope.loadNotifications();
        });
    };
    
    // Catches changes to round to update when no players pick card
    // (because game.state remains the same)
    $scope.$watch('game.round', function() {
      $scope.hasPickedCards = false;
      $scope.showTable = false;
      $scope.winningCardPicked = false;
      $scope.makeAWishFact = makeAWishFacts.pop();
      if (!makeAWishFacts.length) {
        makeAWishFacts = MakeAWishFactsService.getMakeAWishFacts();
      }
      $scope.pickedCards = [];
    });

    // In case player doesn't pick a card in time, show the table
    $scope.$watch('game.state', function() {
      if (game.state === 'game ended') {
        if (game.gameWinner === game.playerIndex) {
          playTone('winner');
        } else {
          playTone('loser');
        }
      }

      if(game.state === 'awaiting players' || game.state === null) {
        $('#start').modal({
          show: true,
          backdrop: 'static',
          keyboard: false
        });
      }

      if(game.state === 'waiting for players to pick'){
        $('#start').modal('hide');
      }         
      if ($scope.isCzar() && game.state === 'czar pick card' && game.table.length === 0) {
        const myModal = $('#start-modal');
        myModal.modal('show');
      }

      if (game.state === 'game dissolved') {
        playTone('error', 0.4);
        $('#start-modal').modal('hide');
      }

      if (game.state === 'waiting for czar to decide' && $scope.showTable === false) {
        $scope.showTable = true;
      }

      if (game.state !== 'czar pick card' && game.state !== 'awaiting players' && game.state !== 'game dissolve') {
      $scope.czarHasDrawn = '';
    }
    
    });
    $scope.link = document.URL;
    $scope.$watch('game.gameID', function() {
      if (game.gameID && game.state === 'awaiting players') {
        if (!$scope.isCustomGame() && $location.search().game) {
          // If the player didn't successfully enter the request room,
          // reset the URL so they don't think they're in the requested room.
          $location.search({});
        } else if ($scope.isCustomGame() && !$location.search().game) {
          // Once the game ID is set, update the URL if this is a game with friends,
          // where the link is meant to be shared.
          $location.search({game: game.gameID});
        }
      }
    });

    if ($location.search().game && !(/^\d+$/).test($location.search().game)) {
      console.log('joining custom game');
      game.joinGame('joinGame',$location.search().game);
    } else if ($location.search().custom) {
      game.joinGame('joinGame',null,true);
    } else {
      game.joinGame();
    }
}]);
