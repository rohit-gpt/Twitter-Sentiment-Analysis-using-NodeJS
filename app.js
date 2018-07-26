var express = require("express");
var app = express();
var Sentiment = require("sentiment");
var sentiment = new Sentiment();
var twitter = require("ntwitter");
var tweeter = new twitter({
	consumer_key: "TS5fJJh2VDHsvO6wv11Q8K4g4",
	consumer_secret: "C6kRN0XIAnD7zgEy1ns0yRIggryGZ2B3L2sthZVuuPOyZMwBtf",
	access_token_key: "1010470358212755456-J5DjQTCBOWihCk42qXc9sxW9Tlsv86",
	access_token_secret: "1I9jDstMAELk5pXxAFcpFa1eR9kErnnrnhxQrOVkCu5KA"
});

app.use(express.static("images"));

var tweetCount = 0;
var tweetTotalSentiment = 0;
var monitoringPhrase;

app.get("/", function(req,res) {
	if(!monitoringPhrase) {
		res.render("landing.ejs");
	} else {
		var avg = tweetTotalSentiment/tweetCount;
		res.render("results.ejs", {host:req.headers.host, monitoringPhrase:monitoringPhrase, tweetCount:tweetCount, avg:avg});
	}
});

app.get("/analyze", function(req, res) {
	if(monitoringPhrase) {
		monitoringPhrase = "";
	}
	monitoringPhrase = req.query.phrase;
	tweetCount = 0;
 	tweetTotalSentiment = 0;
 	tweeter.verifyCredentials(function (error, data) {
 		if (error) {
 			return "Error connecting to Twitter: " + error;
 		} else {
 			tweeter.stream('statuses/filter', {'track': monitoringPhrase}, function (stream) {
 				console.log("Monitoring Twitter for " + monitoringPhrase);
 				stream.on('data', function (data) {
 					if (data.lang === 'en') {
 						sentiment.analyze(data.text, function (err, result) {
 							tweetCount++;
 							tweetTotalSentiment += result.score;
 						});
 					}
				});
 			});
 		}
 	});
 	res.redirect("/");
});

app.get("/refresh", function(req, res) {
	monitoringPhrase="";
	res.redirect("/");
});

app.listen(process.env.PORT, process.env.IP, function() {
	console.log("Server running");
});