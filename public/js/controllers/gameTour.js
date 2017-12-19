/* jshint esversion: 6 */

let timer;
angular.module('mean.system')
  .controller('GameTourController', ['$scope', 'game', function ($scope, game) {
    $scope.$on('$locationChangeSuccess', function () {
      if ($scope.gameTour) {
        $scope.gameTour.exit();
      }
    });

    // declare variables
    $scope.time = 20;
    $scope.state = '';
    $scope.showTimer = false;
    $scope.modal = '';
    $scope.isCzar = false;
    $scope.question = 'Ain\'t no ______ on a sunny day';
    $scope.answers = ['Mountain', 'Valley', 'River', 'Food'];
    $scope.avatars = ['../img/chosen/FA04.png', '../img/chosen/F01.png', '../img/chosen/E01.png'];

    $scope.$watch('showTimer', (newValue) => {
      if (newValue) {
        clearInterval(timer);
        $scope.time = 20;
        timer = setInterval(() => {
          $scope.time -= 1;
        }, 1000);
      }
    });

    $scope.$watch('time', (newValue) => {
      if (newValue === 0) {
        clearInterval(timer);
      }
    });

    $scope.gameTour = introJs();
    $scope.gameTour.setOptions({
      steps: [{
        intro: `<center><img src="../img/cfh-logo.png"/><br/> <strong>Welcome to Cards for Humanity.</strong> </center><br/> Let's walk you through this game, Shall we?
        <br/> Use the arrow keys for navigation or hit ESC to proceed to playing the game.`
      },
      {
        element: '#regionModal',
        intro: `Begin the game by selecting a region.
        Questions are categorised based on region.`
      },
      {
        element: '#finding-player',
        intro: `Game needs a minimum of 3 players to start.
      You have to wait for the minimum number of players to join the game.`
      },
      {
        element: '#invite-friends',
        intro: 'You can invite your friends to join you in a game.'
      },
      {
        element: '#start-game',
        intro: 'With a minimum number of 3 users, you can start the game by clicking this button.'
      },
      {
        element: '#player-star',
        intro: `This icon helps you identify yourself amongst
     other players.`
      },
      {
        element: '#player-points',
        intro: `This shows the number of points you have acquired during the course of the game.`
      },
      {
        element: '#question',
        intro: 'Once a game is started, a question is displayed.',
        position: 'top'
      },
      {
        element: '#cards',
        intro: 'You are also provided with a list of alternatives to pick answer(s) from.',
        position: 'top'
      },
      {
        element: '#inner-timer-container',
        intro: `Choose an answer
      to the current question. After time out, CZAR then select a favorite answer. whoever submitted
      CZARs favorite answer wins the round.`
      },
      {
        element: '#the-czar',
        intro: `Check the CZAR icon to 
      know who's the CZAR.
      <br/>As a Czar, you wait for all players to
      submit their answers after which you select your favorite answer`
      },
      {
        element: '#game-end-container',
        intro: 'After a game ends, you can join a new a game or return to Lobby',
        position: 'top'
      },
      {
        element: '#charity-widget-container',
        intro: 'Click here to donate to charity at the end of the game.',
        position: 'top'
      },
      {
        element: '#home',
        intro: `<center><img src="../img/cfh-logo.png"/> <br /><strong>Thanks for your time.</strong><br/> And that's it! <br/> You can view this tour again by clicking the <strong>Take a Tour</strong> button above. </center>`,
        position: 'bottom'
      }]
    });

    const tourComplete = () => {
      $('.modal-backdrop').removeClass('modal-backdrop');
      $('#myModal').modal('show');
    };

    const beforeTourChange = (targetElement) => {
      switch (targetElement.id) {
        case 'regionModal':
          {
            $scope.$apply(() => {
              $scope.modal = 'region';
            });
            break;
          }
        case 'finding-player':
          {
            $scope.$apply(() => {
              $scope.modal = 'start-game';
            });
            break;
          }
        case 'player-star':
          {
            $scope.$apply(() => {
              $scope.modal = '';
              $scope.state = 'game is started';
            });
            break;
          }
        case 'start-game':
          {
            $scope.$apply(() => {
              $scope.modal = 'start-game';
              $scope.state = '';
            });
            break;
          }
        case 'question':
          {
            $scope.$apply(() => {
              $scope.showTime = true;
            });
            break;
          }
        case 'inner-timer-container':
          {
            $scope.$apply(() => {
              $scope.showTimer = true;
              $scope.isCzar = false;
              $scope.state = 'game is started';
            });
            break;
          }
        case 'the-czar':
          {
            $scope.$apply(() => {
              $scope.isCzar = true;
              $scope.showTimer = false;
              $scope.state = 'game is started';
            });
            break;
          }
        case 'game-end-container': {
          $scope.$apply(() => {
            $scope.state = 'game ended';
            $scope.time = 0;
          });
          break;
        }
      }
    };

    $scope.gameTour.start()
      .oncomplete(tourComplete)
      .onexit(tourComplete)
      .onbeforechange(beforeTourChange);
  }]);
