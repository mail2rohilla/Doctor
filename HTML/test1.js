var app = angular.module('printApp', [])
        .controller("print", function($scope, $window){
            $scope.url = "PrintTemplate.html";
            $scope.prescList = ["list1", "presc2", "presc3"];
            $scope.val = true;
            $scope.print = function(){
                // $timeout($window.print(), 0);
                $scope.val = false;
                var divID = 'printDiv';
                var divElements = document.getElementById(divID).innerHTML;
                var oldPage = document.body.innerHTML;

                document.body.innerHTML =
                    "<html><head><title></title></head><body>" +
                    divElements + "</body>";

                $window.print();

                location.reload();
            };
            $scope.checked = function($event){
                var v = $event.target;
                if(v.checked){
                    console.log(v.value);
                //    remove from list
                }
                else{
                //    add to list
                    console.log(v.value + "not checked");
                }
            };
        });



