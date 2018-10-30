/**
 * Created by dipu on 12/10/18.
 */

var app = angular.module('analysisApp', []).
    controller('analysisController', function($scope){
    $scope.searchText;
    $scope.allList = ["anskdj", "laskhdzkl"];
    $.ajax({
        url: "http://localhost:3000/getAllDetails",
        type: "GET",
        success: function (response) {
            $scope.allList = response;
        },
        error: function(response){
            alert("can't fetch allList, please check the server")
        },
        async: false
    });
    $scope.getAllData = function(){
        $.ajax({
            url: "http://localhost:3000/getAllDetails",
            type: "GET",
            success: function (response) {
                $scope.allList = response;
                },
            error: function(response){
                alert("can't fetch allList, please check the server")
            }
        });

    }

});