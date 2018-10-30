var app = angular.module('printApp', [])
    .controller("print", function($scope)
    {
        // location.reload();
        var s = localStorage.getItem("data");
        console.log(s);
        $scope.data = JSON.parse(s);
        $scope.data1 = JSON.parse(s);
    });