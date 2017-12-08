/* jshint esversion: 6 */

angular.module('mean.system')
  .controller(
    'IndexController',
    ['$scope', 'Global', '$location',
      'socket', 'game', 'AvatarService', '$http', '$window',
      (
        $scope, Global, $location, socket, game,
        AvatarService, $http, $window
      ) => {
        $scope.global = Global;
        $scope.errorMessage = '';
        $scope.signup = () => {
          if (
            $scope.name &&
            $scope.name.length > 0 &&
            $scope.email &&
            $scope.password
          ) {
            const newUser = {
              name: $scope.name,
              password: $scope.password,
              email: $scope.email
            };
            $http.post('/api/auth/signup', newUser)
              .then((response) => {
                $window.localStorage.setItem('token', response.data.token);
                $window.location = '#!/';
                $window.location.reload();
              }, (err) => {
                $location.search(`error=${err.data.error}`);
              });
          }
        };

        $scope.login = () => {
          if (
            $scope.email &&
            $scope.password
          ) {
            const user = {
              email: $scope.email,
              password: $scope.password
            };
            $http.post('/api/auth/login', user)
              .then((response) => {
                $window.localStorage.setItem('token', response.data.token);
                $location.path('/#!/');
                $window.location.reload();
              }, (err) => {
                $location.search(`error=${err.data.error}`);
              });
          } else {
            $location.search('error=invalid');
          }
        };

        $scope.playAsGuest = () => {
          if ($scope.region === undefined || $scope.region === '') {
            $scope.error = 'Select a region first!';
          } else {
            $('#close').click();
            $location.path('/app');
          }
        };

        $scope.playWithStrangers = () => {
          if ($scope.region === undefined || $scope.region === '') {
            $scope.error = 'Select a region first!';
          } else {
            $('#close').click();
            $location.path('/app');
          }
        };

        $scope.playWithFriends = () => {
          if ($scope.region === undefined || $scope.region === '') {
            $scope.error = 'Select a region first!';
          } else {
            $('#close').click();
            $location.path('/app');
          }
        };


        $scope.showError = () => {
          if ($location.search().error) {
            return $location.search().error;
          }
          return false;
        };

        $scope.avatars = [];
        AvatarService.getAvatars()
          .then((data) => {
            $scope.avatars = data;
          });
      }]
  );
