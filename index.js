
var https = require('follow-redirects').https;
var placeDetails = function() {
	this.places = [];
}

//Step 1: Get coordinates based on the entered zipcode.

function getCoordinates(zipcode) {
	https.request({
		host: 'maps.googleapis.com',
		path: '/maps/api/geocode/json?address=' + zipcode + '&key=AIzaSyDTx3rvRsbCwYKmlTyDg1KFbvqcRFi4CF4',
		method: 'GET'},
		CoordinateResponse).end();
}

//Step 2: Find places within the specified radius, based on the coordinates provided by the getCoordinates function.

function placeSearch(latitude, longitude, businessName, radius) {
	https.request({
		host: 'maps.googleapis.com',
		path: '/maps/api/place/nearbysearch/json?location=' + latitude + ',' + longitude + '&radius=' + radius * 1600 + '&type=' + businessName + '&key=AIzaSyDTx3rvRsbCwYKmlTyDg1KFbvqcRFi4CF4',
		method: 'GET'},
		PlaceResponse).end();
}

function CoordinateResponse(response) {
	var data = "";
	var sdata = "";
	var latitude = "";
	var longitude = "";

	response.on('data', function(chunk) {
		data += chunk;
	});
	response.on('end', function() {
		sdata = JSON.parse(data);
		latitude = sdata.results[0].geometry.viewport.northeast.lat;
		longitude = sdata.results[0].geometry.viewport.northeast.lng;
		placeSearch(latitude, longitude, 'restaurant', 50);
	});
}

const fs = require("fs");

function PlaceResponse(response) {
	var p;
	var data = "";
	var sdata = "";
	var PD = new placeDetails();

	response.on('data', function(chunk) {
		data += chunk;
	});
	response.on('end', function() {
		sdata = JSON.parse(data);
		if (sdata.status === 'OK') {
			console.log('Status: ' + sdata.status);
			console.log('Results: ' + sdata.results.length);
			for (p = 0; p < sdata.results.length; p++) {
				PD.places.push(sdata.results[p]);
			}
            fs.writeFileSync('list.csv', '');
			for (r = 0; r < sdata.results.length; r++) {
				console.log('----------------------------------------------');
				console.log(PD.places[r].name);
				console.log('Place ID (for Place Detail search on Google):' + PD.places[r].place_id);
				console.log('Rating: ' + PD.places[r].rating);
				console.log('Vicinity: ' + PD.places[r].vicinity);
                const csv = `${PD.places[r].name},${PD.places[r].place_id},${PD.places[r].rating},${PD.places[r].vicinity}\n`;
                try {
                    fs.appendFileSync('list.csv', csv);
                } catch (err) {
                  console.error(err);
                }
			}
		} else {
			console.log(sdata.status);
		}
	});
}

getCoordinates(64105); //Enter a zip code here to try it out (Nashville in this case)