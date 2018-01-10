/**
* (C) Copyright IBM Corporation 2016.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

var WebSocketClient = require('websocket').client;
var request = require('request');
var response = require('response');
var https = require('https');
 
var client = new WebSocketClient();
// replace the hostname of Hyperledger Composer REST server
client.connect('ws://hyperledger-composer-rest-server:3000/');
 
client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});
 
client.on('connect', function(connection) {
    console.log('Connection established');
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('Connection Closed');
    });
    connection.on('message', function(message) {
		var jsonString = JSON.parse(message.utf8Data);
		
		if (jsonString.$class == "org.acme.vehicle.lifecycle.manufacturer.PlaceOrderEvent") {
			console.log("PlaceOrderEvent received: '" + message.utf8Data + "'");
			console.log("Starting IBM BPM process to process order... ");
			
			// replace username:password and the hostname of bpmserver
			var base64encoded = Buffer.from("username:password").toString('base64');
			var urlcomplete = 'https://bpmserver:9443/rest/bpm/wle/v1/process?action=sendMessage&message=<eventmsg><event processApp="OP" ucaname="OrderProcessingUCA"></event><parameters><parameter><key>Input</key><value type="NameValuePair"><name>message</name><value>' + encodeURIComponent(message.utf8Data) + '</value></value></parameter></parameters></eventmsg>';
			
			// if class of event is "org.acme.vehicle.lifecycle.manufacturer.PlaceOrderEvent" call the BPM UCA to process the order. 
			request({
				url: urlcomplete,
				method: 'POST',
				headers: {'Content-Type': 'application/json', 'Authorization' : 'Basic ' + base64encoded},
				rejectUnauthorized: false
			}, function (err, resp, body) {
				if (err){
					console.log("resp = " + resp);
				}
				else{    
					console.log("StatusCode: "+resp.statusCode);
					if (resp.statusCode == 200) {
						console.log(body); 
					}	
				}	  
			});
		};	
    });    
});
 