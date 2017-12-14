/* jshint esversion: 6 */

function scrollMessages() {
  var chats = $('.chat_messages');
  setTimeout(() => {
    scrollToTop(chats);
  }, 200);
}

function scrollToTop(chats) {
  chats.animate({
    scrollTop: chats[0].scrollHeight
  }, 1000);
}

angular.module('mean.system')
  .controller('chatController', ['$scope', 'game', '$firebaseArray', function ($scope, game, $firebaseArray) {
    const ref = new Firebase(`https://elendil-cfh.firebaseio.com/${game.gameID}`);
    $scope.isChatOpen = false;
    let oldLength = 0, newLength = 0;
    $scope.unreadCount = null;

    const firstTime = true;

    $scope.chats = $firebaseArray(ref);

    if (firstTime) {
      ref.remove();
    }

    const emoji = $('#messageInput').emojioneArea({
      hidePickerOnBlur: true,
      recentEmojis: true,
      pickerPosition: 'top',
      emojiPlaceholder: ':smile_cat:',
    });

    $scope.chats.$watch(function (e) {
      if (!$scope.isChatOpen) {
        playTone();
        newLength = $scope.chats.length;
        $scope.unreadCount = newLength - oldLength;
        var { author, message } = $scope.chats[newLength - 1];
        toastr.clear();
        toastr.info(message, author);
      }
      else {
        oldLength = $scope.chats.length;
        $scope.unreadCount = null;
      }
    });

    $scope.addChat = function () {
      $scope.messageInput = (emoji.data('emojioneArea').getText());
      if ($scope.messageInput) {
        $scope.isChatOpen = true;
        $scope.newMessage = {
          author: game.players[game.playerIndex].username,
          avatar: game.players[game.playerIndex].avatar,
          message: $scope.messageInput,
          time: new Date().toISOString(),
        };
        $scope.chats.$add($scope.newMessage);
        emoji.data('emojioneArea').setText('');
        $scope.messageInput = '';
        scrollMessages();
      }
    };

    $scope.showTime = function (time) {
      return moment(time).fromNow();
    };

    $scope.openChat = function () {
      toastr.clear();
      $scope.isChatOpen = !$scope.isChatOpen;
      oldLength = newLength;
      $scope.unreadCount = null;
    };
  }]);

const playTone = function () {
  const audio = new Audio('../../sounds/newMessage.mp3');
  audio.volume = 0.2;
  audio.play();
};
