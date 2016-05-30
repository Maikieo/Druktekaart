/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
        $("#over_map").click(function(){
            displayInfoScreen("yes");
        });
        $("#infoScreenWrapper").click(function(){
            displayInfoScreen("no");
        });
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function() {
        // app.receivedEvent('deviceready');
        navigator.geolocation.getCurrentPosition(onSuccess, onError, { timeout: 5000 }); ////hier naar kijken!!!!!!!!!!
        //  navigator.geolocation.watchPosition(onSuccess, onError, { timeout: 5000 }); ////kijkt elke 5 sec waar je ben!!!!!!!!!!
        //loads the searchbar
        var options = {
            url: "js/bridges_locks.json",
            getValue: "name",
            theme: "square",
            requestDelay: 500,
            placeholder: "Zoek een brug of sluis..",
            list: {
                match: {
                    enabled: true
                },
                maxNumberOfElements: 4,

                onSelectItemEvent: function() {
                    var lattitude = $("#provider-json").getSelectedItemData().location.coordinates[1];
                    var longitude = $("#provider-json").getSelectedItemData().location.coordinates[0];
                    var latlong = new google.maps.LatLng(lattitude,longitude);
                    map.setCenter(latlong);
                    map.setZoom(18);
                    windowSlideUp();
                }
            }
        };

        $("#provider-json").easyAutocomplete(options);
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');
        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};
var styles = [[{
    url: 'js/images/people35.png',
    height: 35,
    width: 35,
    anchor: [16, 0],
    textColor: '#ff00ff',
    textSize: 10
}, {
    url: 'js/images/people45.png',
    height: 45,
    width: 45,
    anchor: [24, 0],
    textColor: '#ff0000',
    textSize: 11
}, {
    url: 'js/images/people55.png',
    height: 55,
    width: 55,
    anchor: [32, 0],
    textColor: '#ffffff',
    textSize: 12
}], [{
    url: 'js/images/conv30.png',
    height: 27,
    width: 30,
    anchor: [3, 0],
    textColor: '#ff00ff',
    textSize: 10
}, {
    url: 'js/images/conv40.png',
    height: 36,
    width: 40,
    anchor: [6, 0],
    textColor: '#ff0000',
    textSize: 11
}, {
    url: 'js/images/conv50.png',
    width: 50,
    height: 45,
    anchor: [8, 0],
    textSize: 12
}], [{
    url: 'js/images/heart30.png',
    height: 26,
    width: 30,
    anchor: [4, 0],
    textColor: '#ff00ff',
    textSize: 10
}, {
    url: 'js/images/heart40.png',
    height: 35,
    width: 40,
    anchor: [8, 0],
    textColor: '#ff0000',
    textSize: 11
}, {
    url: 'js/images/heart50.png',
    width: 50,
    height: 44,
    anchor: [12, 0],
    textSize: 12
}], [{
    url: 'js/images/pin.png',
    height: 48,
    width: 30,
    anchor: [-18, 0],
    textColor: '#ffffff',
    textSize: 10,
    iconAnchor: [15, 48]
}]];
var map;
var markerArray = new Array();
var container = $( "#container" );
function onSuccess(position) {
    var localLat = position.coords.latitude;
    var localLong = position.coords.longitude;
    initialize(localLat, localLong);

}
// onError Callback receives a PositionError object
function onError(error) {
    alert('code: '    + error.code    + '\n' +
        'message: ' + error.message + '\n');
}
var icons = {
    0: {
        icon: 'js/images/bridgeBussy.png', // bridge bussy
        time: '38'
    },
    1: {
        icon: 'js/images/m1.png',    //bridge semi bussy
        time: '22'
    },
    2: {
        icon: 'js/images/people35.png',//bridge not bussy
        time: '11'
    },
    3: {
        icon: 'js/images/bridgeBlocked.png',//bridge not working
        time: 'X'
    },
    4: {
        icon: 'js/images/lockBussy.png', //lock bussy
        time: '36'
    },
    5: {
        icon: 'js/images/m1.png',     //lock semi bussy
        time: '23'
    },
    6: {
        icon: 'js/images/people35.png',//lock not bussy
        time: '14'
    },
    7: {
        icon: 'js/images/lockBlocked.png', //lock not working
        time: 'X'
    }
};
function initialize(lat, long) {
    // Giving the map som options
    var mapOptions = {
        zoom: 16,
        center: new google.maps.LatLng(lat, long),
        disableDefaultUI: true
    };
    // Creating the map
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    map.addListener('click', function() {
        windowSlideDown();
    });
    Marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat,long),
        map: map,
        draggable:false,
        optimized:false,
        icon: 'js/images/locationdot.png'
    });
    addMarkerLock();
    addMarkerBridge();
}
function addMarkerLock(){
    $.getJSON("js/locks.json", function(jsonLock) {
        // Looping through all the entries from the JSON data
        for(var i = 0; i < jsonLock.length; i++) {
            var obj = jsonLock[i];
            random = randomIntFromInterval(4,7);
            latlng = new google.maps.LatLng(obj.location.coordinates[1],obj.location.coordinates[0]);
            markerArray[i] = new google.maps.Marker({
                id: i,
                position: new google.maps.LatLng(obj.location.coordinates[1],obj.location.coordinates[0]),
                map: map,
                title: icons[random].time,
                icon: icons[random].icon
            });

            (function (i) {
                google.maps.event.addListener(markerArray[i], 'click', function () {

                    if (jsonLock[this.id] != null)
                    {
                        var name = jsonLock[this.id].name;
                        if(name.length > 18) name = name.substring(0,18)+'...';
                    }
                    if (jsonLock[this.id].lockOpening)
                    {
                        var heightClosed = jsonLock[this.id].lockOpening[0].heightClosed + " meter";
                    }
                    if (jsonLock[this.id].phoneNumber)
                    {
                        var phoneNumber = jsonLock[this.id].phoneNumber;
                        if(phoneNumber.length > 11) phoneNumber = phoneNumber.substring(0,11);
                    }
                    if (jsonLock[this.id].vhfChannel)
                    {
                        var vhf = jsonLock[this.id].vhfChannel;
                    }
                    if (jsonLock[this.id].operatingTimes)
                    {
                        var monday = converter(jsonLock[this.id].operatingTimes.operatingPeriods[0].operatingRules[0].isMonday);
                        var tuesday = converter(jsonLock[this.id].operatingTimes.operatingPeriods[0].operatingRules[0].isTuesday);
                        var wednesday = converter(jsonLock[this.id].operatingTimes.operatingPeriods[0].operatingRules[0].isWednesday);
                        var thursday = converter(jsonLock[this.id].operatingTimes.operatingPeriods[0].operatingRules[0].isThursday);
                        var friday = converter(jsonLock[this.id].operatingTimes.operatingPeriods[0].operatingRules[0].isFriday);
                        var saturday = converter(jsonLock[this.id].operatingTimes.operatingPeriods[0].operatingRules[0].isSaturday);
                        var sunday = converter(jsonLock[this.id].operatingTimes.operatingPeriods[0].operatingRules[0].isSunday);
                        var holiday = converter(jsonLock[this.id].operatingTimes.operatingPeriods[0].operatingRules[0].isHoliday);
                    }
                    var time = markerArray[this.id].title+" minuten";
                    windowSlideUp(name, heightClosed,time, phoneNumber, vhf, monday, tuesday, wednesday, thursday, friday, saturday, sunday, holiday);
                });
            })(i);
        }
        var mcOptions = {gridSize: 60, maxZoom: 20, styles: styles[3]};
        var mc = new MarkerClusterer(map, markerArray, mcOptions);
    });
}
function addMarkerBridge(){
    $.getJSON("js/bridges.json", function(jsonBridge) {
        // Looping through all the entries from the JSON data
        for(var i = 0; i < jsonBridge.length; i++) {
            var obj = jsonBridge[i];
            random = randomIntFromInterval(0,3);
            latlng = new google.maps.LatLng(obj.location.coordinates[1],obj.location.coordinates[0]);
            markerArray[i] = new google.maps.Marker({
                id: i,
                position: new google.maps.LatLng(obj.location.coordinates[1],obj.location.coordinates[0]),
                map: map,
                title: icons[random].time,
                icon: icons[random].icon
            });

            (function (i) {
                google.maps.event.addListener(markerArray[i], 'click', function () {
                    // console.log(markerArray[this.id].title);
                    //  console.log(jsonBridge[this.id]);
                    //  var position = markerArray[this.id].internalPosition;
                    //   map.setCenter(position);

                    if (jsonBridge[this.id] != null)
                    {
                        var name = jsonBridge[this.id].name;
                        if(name.length > 18) name = name.substring(0,18)+'...';
                    }
                    if (jsonBridge[this.id].bridgeOpening[0])
                    {
                        var heightClosed = jsonBridge[this.id].bridgeOpening[0].heightClosed + " meter";
                    }
                    if (jsonBridge[this.id].phoneNumber)
                    {
                        var phoneNumber = jsonBridge[this.id].phoneNumber;
                        if(phoneNumber.length > 11) phoneNumber = phoneNumber.substring(0,11);
                    }
                    if (jsonBridge[this.id].vhfChannel)
                    {
                        var vhf = jsonBridge[this.id].vhfChannel;
                    }
                    if (jsonBridge[this.id].operatingTimes)
                    {
                        var monday = converter(jsonBridge[this.id].operatingTimes.operatingPeriods[0].operatingRules[0].isMonday);
                        var tuesday = converter(jsonBridge[this.id].operatingTimes.operatingPeriods[0].operatingRules[0].isTuesday);
                        var wednesday = converter(jsonBridge[this.id].operatingTimes.operatingPeriods[0].operatingRules[0].isWednesday);
                        var thursday = converter(jsonBridge[this.id].operatingTimes.operatingPeriods[0].operatingRules[0].isThursday);
                        var friday = converter(jsonBridge[this.id].operatingTimes.operatingPeriods[0].operatingRules[0].isFriday);
                        var saturday = converter(jsonBridge[this.id].operatingTimes.operatingPeriods[0].operatingRules[0].isSaturday);
                        var sunday = converter(jsonBridge[this.id].operatingTimes.operatingPeriods[0].operatingRules[0].isSunday);
                        var holiday = converter(jsonBridge[this.id].operatingTimes.operatingPeriods[0].operatingRules[0].isHoliday);
                    }
                    var time = markerArray[this.id].title+" minuten";
                    windowSlideUp(name, heightClosed,time, phoneNumber, vhf, monday, tuesday, wednesday, thursday, friday, saturday, sunday, holiday);
                });
            })(i);
        }
        var mcOptions = {gridSize: 60, maxZoom: 20, styles: styles[3]};
        var mc = new MarkerClusterer(map, markerArray, mcOptions);
    });
}
//convert bool to string
function converter(value){
    if(value == true){
        value = "Ja";
        return value;
    }
    if(value == false){
        value = "Nee";
        return value;
    }
}
//generates a random between 2 numbers
function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}
// Initialize the map
google.maps.event.addDomListener(window, 'load', initialize);

function windowSlideUp(name,heightClosed,time,phoneNumber,vhf,monday,tuesday, wednesday, thursday, friday, saturday, sunday, holiday){
    $('#name').text(name);
    console.log(heightClosed);
    if(heightClosed != "undefined meter"){
        $('#doorvaarhoogte').text(heightClosed);}
    $('#wachttijd').text(time);
    $('#telefoonnummer').text(phoneNumber);
    $('#vhf').text(vhf);
    $('#maandag').text(monday);
    $('#dinsdag').text(tuesday);
    $('#woensdag').text(wednesday);
    $('#donderdag').text(thursday);
    $('#vrijdag').text(friday);
    $('#zaterdag').text(saturday);
    $('#zondag').text(sunday);
    $('#feestdagen').text(holiday);


    if (container.is( ":visible" )){
        // Hide - slide up.
        container.slideUp( 500 );
    } else {
        // Show - slide down.
        container.slideDown( 500 );
    }
}
function windowSlideDown(){

    if (container.is( ":visible" )){
        // Hide - slide up.
        container.slideUp(500 );
        $('#name').text("Niet beschikbaar");
        $('#doorvaarhoogte').text("Niet beschikbaar");
        $('#telefoonnummer').text("Niet beschikbaar");
        $('#vhf').text("Niet beschikbaar");
        $('#maandag').text("Niet beschikbaar");
        $('#dinsdag').text("Niet beschikbaar");
        $('#woensdag').text("Niet beschikbaar");
        $('#donderdag').text("Niet beschikbaar");
        $('#vrijdag').text("Niet beschikbaar");
        $('#zaterdag').text("Niet beschikbaar");
        $('#zondag').text("Niet beschikbaar");
        $('#feestdagen').text("Niet beschikbaar");
    }
}
function displayInfoScreen(show){
    if(show == "yes"){
        $('#infoScreenWrapper').css( "visibility", "visible" );
    }
    if(show == "no"){
        $('#infoScreenWrapper').css( "visibility", "hidden" );
    }
}


