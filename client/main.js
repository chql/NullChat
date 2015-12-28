(function( angular, document, undefined ) {

var app = angular.module('chatApp',['ngRoute','btford.socket-io']);

app.factory('$socket', function(socketFactory){
	var socket = socketFactory();
	
	socket.loggedIn = false;
	
	socket.forward('login:accepted');
	socket.forward('chat:message');
	socket.forward('chat:leave');
	socket.forward('chat:status');
	
	return socket;
});

app.config(function($routeProvider){
	$routeProvider
		.when('/', {
			templateUrl: 'login.html',
			controller: 'loginController'
		})
		.when('/chat', {
			templateUrl: 'chat.html',
			controller: 'chatController'
		});
});

app.controller('chatController', ['$scope', '$socket','$location','$timeout',
function($scope, $socket, $location, $timeout){
	
	if($socket.loggedIn === false) {
		$location.path('/');
	}
	
	$scope.messages = [];
	$scope.people = 0;
	$scope.message_body = "";
	$scope.nickname = $socket.nickname;
	
	var messagesContainer = document.getElementById('messages-container');
	
	$scope.$watchCollection('messages', function(){
		$timeout(function(){
			messagesContainer.scrollTop = messagesContainer.scrollHeight;
		},100);
	});
	
	$scope.$on('socket:chat:message', function( ev, message ){
		message.other = ($scope.nickname != message.from);
		$scope.messages.push(message);
	});
	
	$scope.$on('socket:chat:leave', function( ev, message ){
		$socket.loggedIn = false;
		$location.path('/');
	});
	
	$scope.$on('socket:chat:status', function( ev, people ){
		console.log(people);
		$scope.people = people;
	});
	
	$scope.logout = function() {
		$socket.emit('chat:logout');
	};
	
	$scope.sendMessage = function() {
		$socket.emit('chat:message', $scope.message_body);
		$scope.message_body = "";
	};
	
	$socket.emit('chat:checkin');
	
}]);

app.controller('loginController', ['$scope','$socket','$location',
function( $scope, $socket, $location ){
	
	$scope.nickname = "";
	
	$scope.$on('socket:login:accepted', function( ev, nickname ){
		$socket.loggedIn = true;
		$socket.nickname = nickname;
		$location.path('/chat');
	});
	
	$scope.login = function() {
		$socket.emit('login', $scope.nickname);
	};
	
}]);

})( angular, document );
