/**
 * Created by dipu on 18/9/18.
 */

var app = angular.module('doctorApp', ["ngRoute"])
    .factory('printer', ['$rootScope', '$compile', '$http', '$timeout', '$q', 'spinner',
        function ($rootScope, $compile, $http, $timeout, $q, spinner) {
            var printHtml = function (html) {
                var deferred = $q.defer();
                var hiddenFrame = $('<iframe style="visibility: hidden"></iframe>').appendTo('body')[0];
                hiddenFrame.contentWindow.printAndRemove = function () {
                    hiddenFrame.contentWindow.print();
                    $(hiddenFrame).remove();
                    deferred.resolve();
                };
                var htmlContent = "<!doctype html>" +
                    "<html>" +
                    '<body onload="printAndRemove();">' +
                    html +
                    '</body>' +
                    "</html>";
                var doc = hiddenFrame.contentWindow.document.open("text/html", "replace");
                doc.write(htmlContent);
                doc.close();
                return deferred.promise;
            };

            var openNewWindow = function (html) {
                var newWindow = window.open("printTest.html");
                newWindow.addEventListener('load', function () {
                    $(newWindow.document.body).html(html);
                }, false);
            };

            var print = function (templateUrl, data) {
                $rootScope.isBeingPrinted = true;
                $http.get(templateUrl).then(function (templateData) {
                    var template = templateData.data;
                    var printScope = $rootScope.$new();
                    angular.extend(printScope, data);
                    var element = $compile($('<div>' + template + '</div>'))(printScope);
                    var renderAndPrintPromise = $q.defer();
                    var waitForRenderAndPrint = function () {
                        if (printScope.$$phase || $http.pendingRequests.length) {
                            $timeout(waitForRenderAndPrint, 1000);
                        } else {
                            // Replace printHtml with openNewWindow for debugging
                            printHtml(element.html()).then(function () {
                                $rootScope.isBeingPrinted = false;
                                renderAndPrintPromise.resolve();
                            });
                            printScope.$destroy();
                        }
                        return renderAndPrintPromise.promise;
                    };
                    spinner.forPromise(waitForRenderAndPrint());
                });
            };

            var printFromScope = function (templateUrl, scope, afterPrint) {
                $rootScope.isBeingPrinted = true;
                $http.get(templateUrl).then(function (response) {
                    var template = response.data;
                    var printScope = scope;
                    var element = $compile($('<div>' + template + '</div>'))(printScope);
                    var renderAndPrintPromise = $q.defer();
                    var waitForRenderAndPrint = function () {
                        if (printScope.$$phase || $http.pendingRequests.length) {
                            $timeout(waitForRenderAndPrint);
                        } else {
                            printHtml(element.html()).then(function () {
                                $rootScope.isBeingPrinted = false;
                                if (afterPrint) {
                                    afterPrint();
                                }
                                renderAndPrintPromise.resolve();
                            });
                        }
                        return renderAndPrintPromise.promise;
                    };
                    spinner.forPromise(waitForRenderAndPrint());
                });
            };
            return {
                print: print,
                printFromScope: printFromScope
            };
        }])
    .config(function($routeProvider, $locationProvider){
        $routeProvider
            .when("/loadList",
                {
                    templateUrl: "List.html",
                    controller : "listLoader"
                });
        // $locationProvider.html5Mode(true);


            // .when("/addToList",
            //     {
            //         templateUrl: "List.html",
            //         resolve:{
            //             "check":function($location){
            //                 if(true){
            //                     console.log("nothing");
            //                 }else{
            //                     $location.path('/');    //redirect user to home.
            //                     alert("You don't have access here");
            //                 }
            //             }
            //         },
            //         controller : "listLoader"
            //     })
            // .when("/removeFromList",
            //     {
            //         templateUrl: "List.html",
            //         controller : "listLoader"
            //     })
            // .otherwise ({
            //     redirectTo: '/loadList'
            // });
    })
    .controller('listLoader', function($scope, $window, $rootScope, $http, $location) {
        $rootScope.drug;
        $rootScope.patientsList;
        $rootScope.PID;
        $scope.searchText;
        $scope.disp_pname = -1;
        $scope.disp_page = -1;
        $scope.disp_pid = -1;
        $scope.disp_pphone = -1;
        $scope.disp_paddr = -1;
        $rootScope.DID = -1;
        $scope.disp_psex = -1;
        $scope.changed_val = -1;
        $scope.hide_table= true;
        $scope.hide_presc= true;
        $rootScope.hide_details= true;
        $scope.true_list = true;
        $scope.counter = 1;
        $scope.filter_name;
        $scope.filter_age;
        $scope.date = "";
        $scope.prescList = [];
        $scope.prescBooleanList = [];
        $scope.printHide = true;

        var d = new Date();
        $scope.date += d.getDate() + "/";
        $scope.date += d.getMonth() + "/";
        $scope.date += d.getFullYear();


        //get drugList and load it in the select list
        $.ajax({
            url: "http://localhost:3000/getDrugList",
            type: "GET",
            success: function (response) {
                    // this callback will be called asynchronously
                    // when the response is available
                    if(!Array.isArray(response))
                        response = [response];
                    $rootScope.drug = response;
                    for(i=0; i< $rootScope.drug.length; i++)
                    {
                        $rootScope.drug[i].show_in_list = false;
                    }
                    $rootScope.DID = $rootScope.drug.length;
                    console.log($rootScope.drug);
                },
            error: function (response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    alert("can't get drugList check server " + response.status);
                }
        });
        // to get prescription list
        $.ajax({
            url: "http://localhost:3000/getPrescription",
            type: "GET",
            success: function (response) {
                if(!Array.isArray(response))
                    response = [response];
                $scope.prescList = response;
                for(var i =0; i< response.length; i++)
                    $scope.prescList[i].show_in_list = false;
            },
            error: function(response){
                alert("can't fetch prescList, please check the server")
            }
        });
        // get the patients-list and PID
        $.ajax({
            url: "http://localhost:3000/getPatientsList",
            type: "GET",
            success: function (response) {
                $rootScope.patientsList = response;
                $rootScope.PID = response.length;
                console.log($rootScope.PID);
            },
            error: function (response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                alert("can't get patients list check server " + response.status);
            }
        });
        $scope.showTable = function(){

            if($("#inp_pname").val().trim().length === 0 && $("#inp_page").val().trim().length === 0
                && $("#inp_pid").val().trim().length === 0 && $("#inp_paddr").val().trim().length === 0
                && $("#inp_pphone").val().trim().length === 0)
                $scope.hide_table= true;
            else
                $scope.hide_table= false;
        };

        //  add to drugList by changing dropdown list
        $scope.addToDruglist = function(){
                $scope.hide_details = true;
                $scope.hide_presc = false;
                $rootScope.drug[$scope.changed_val].show_in_list = true;
                $rootScope.drug[$scope.changed_val].seq = $scope.counter++;
                $location.path("/loadList");
        };

        //  add to list by index numbers
        $scope.addToDruglist1 = function(event){
                if (event.charCode == 13) //if enter then hit the search button
                {
                    $scope.hide_details = true;
                    $scope.hide_presc = false;
                    var ind = $('#drug_index').val().trim();
                    $rootScope.drug[ind -1].show_in_list = true;
                    $rootScope.drug[ind -1].seq = $scope.counter++;
                    $location.path("/loadList");
                }
            $('#drug_index').val("");
            $('#drug_index').focus();

        };
        $scope.removeFromDruglist = function(index){
            $rootScope.drug[index].show_in_list = false;
            $location.path("/loadList");
            // var list = document.getElementById("list_show_drug_list");
            // list.innerHTML = makeList($scope.drug);
            // var s = makeList();
            // list.innerHTML = s;
        };
        $scope.addPatientDetails = function(){
            $scope.hide_table = true;
            $rootScope.PID++;
            var obj = {
                    pid: $rootScope.PID,
                    pname: $("#inp_pname").val(),
                    page: $("#inp_page").val(),
                    psex: $("#select_psex").val(),
                    paddr: $("#inp_paddr").val(),
                    pphone: $("#inp_pphone").val()
                };

            if(obj.pname.trim().length === 0){
                alert("enter name");
                return;
            }
            if(obj.page.trim().length === 0){
                alert("enter age");
                return;
            }
            if(obj.psex.trim().length === 0){
                alert("select sex");
                return;
            }
            if(obj.pphone.trim().length === 0){
                alert("phone no not added");
            }
            if(obj.paddr.trim().length === 0){
                alert("address no not added");
            }
            $.ajax({
                type: "POST",
                url: "http://localhost:3000/addPatientDetails",
                data: obj,
                async: false,
                success: function(response){
                            $rootScope.PID++;
                            console.log($rootScope.PID);
                            $("#inp_pname").val("");
                            $("#inp_page").val("");
                            $("#select_psex").val("");
                            $("#inp_pid").val("");
                            $("#inp_paddr").val("");
                            $("#inp_pphone").val("");
                            //  preparing data for showing in the box
                            $scope.disp_pid = response.pid;
                            $scope.disp_pname = response.pname;
                            $scope.disp_page = response.page;
                            $scope.disp_psex = response.psex;
                            $scope.disp_pphone = response.pphone;
                            $scope.disp_paddr = response.paddr;

                            //  deleting text from the boxes
                            $scope.searchText.pname = "";
                            $scope.searchText.page = "";
                            $scope.searchText.pphone = "";
                            $scope.searchText.paddr = "";

                            $rootScope.hide_details = false;

                },
                error: function(response){
                            alert("details not added\ncheck the db server and retry" + response.status);
                }
            });


        };
        $scope.addDrugDetails = function () {
            var obj = {
                drug_index: $rootScope.DID,
                drug_name: $("#add_drug_name").val()
            };

            if(obj.drug_name.trim().length == 0){
                alert("enter drug name");
                return;
            }

            $.ajax({
                url: "http://localhost:3000/addDrugDetails",
                data: obj,
                type: "POST",
                success: function (data) {
                    alert(data);
                    location.reload();
                }
            });
        };
        $scope.showDetails = function(pid, pname, page, psex){
            $("#inp_pname").val("");
            $("#inp_page").val("");
            $("#select_psex").val("");
            $("#inp_pid").val("");
            $("#inp_paddr").val("");
            $("#inp_pphone").val("");
            $scope.disp_pid = pid;
            $scope.disp_pname = pname;
            $scope.disp_page = page;
            $scope.disp_psex = psex;
            $rootScope.hide_details = false;
            $scope.hide_table = true;
        };
        $scope.addDrugList = function () {
            var list = [];
            var prescList = [];
            for(i= 0; i< $rootScope.drug.length; i++){
                if($rootScope.drug[i].show_in_list)
                    list.push($rootScope.drug[i].drug_name);
            }
            for(i =0; i< $scope.prescList.length; i++){
                if($scope.prescList[i].show_in_list)
                    prescList.push($scope.prescList[i].presc);
            }
            var date = (new Date()).toJSON();
            var obj = {
                pid: $scope.disp_pid,
                date: date,
                dlist: list,
                plist: prescList,
                description: $('#txt_area_description').val()
            };

            var data = {
                name: $scope.disp_pname,
                age: $scope.disp_page,
                sex: $scope.disp_psex,
                id: $scope.disp_pid,
                phone: $scope.disp_pphone,
                address: $scope.disp_paddr,
                list: list
                // phone_no: $scope.disp_pname,
                // address: $scope.disp_pname,
            };

            if($scope.pid == null)
            {
                alert('select a patient');
                return;
            }

            if(obj.dlist.length === 0){
                alert("warning, no drugs in prescription");
                return;
            }
            // localStorage.setItem("data", JSON.stringify(data));
            // window.open("/home/dipu/WebstormProjects/Doctor/HTML/PrintPage.html");
            // window.open("/PrintPage.html");

            $.ajax({
                url: "http://localhost:3000/addDrugList",
                data: obj,
                type: "POST",
                success: function (data) {
                    console.log("succesfully stored");
                },
                error: function () {
                    alert("patients drug data couldn't be stored\n" +
                        "try restarting the server");
                }
            });

        };
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

            $location.reload();
        };
        $scope.addPrescription = function(){
            var obj = $("#inp_presc").val();
            $.ajax({
                url: "http://localhost:3000/addPrescription",
                data: {presc: obj},
                type: "POST",
                success: function (data) {
                    location.reload();
                    alert("presc added");
                }
            });
        };
        $scope.addToPrescList = function($event){
            var obj = event.target;
            var x1 = ! $scope.prescList[obj.value].show_in_list;
            $scope.prescList[obj.value].show_in_list = x1;
        }
    });