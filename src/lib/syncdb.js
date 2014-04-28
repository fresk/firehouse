
var _ = require('underscore');
var async = require('async');
var request = require('superagent');
var tabletop = require('tabletop');
var jsonfile = require('jsonfile');

var sponsor_sheet_url = "https://docs.google.com/spreadsheet/pub?key=0AlN0Yr61Qrn1dDNHZm1XRENORHZCQnV1VVBsM0c3MEE&output=html";
var event_location_url = "http://dmsc.fresk.io/wp-content/themes/fresk-wp-bootstrap/event-json.php";

var sponsor_feed_url = "http://dmsc.fresk.io/?json=1&post_type=sponsors";



function fetchSpreadhseetData(callback){
  console.log("fetching sponsor list from google docs...");
  tabletop.init({
    key: sponsor_sheet_url,
    callback: function(data, tabletop){
      console.log("got sponsor list");
      callback(null, data);
    },
    simpleSheet: true
  });
}

function fetchEventsAndLocations(callback){
  console.log("fetching event and venue data from dmsc.fresk.io...");
  request(event_location_url, function(res){
    console.log("got event and venue data");
    var events = res.body.events;
    _.each(events, function(element){
      var cats = _.values(element.categories.categories);
      element.categories = cats;
      element.categories_string = _.map(cats, function(c){
        return c.slug}).join(" ");
    });
    console.log(res.body.events[0]);
    callback(null, res.body);
  });
}


function fetchSponsors(callback){
  console.log("fetching sponsors dmsc.fresk.io...");
  request(sponsor_feed_url, function(res){
    console.log("got sponsor data");
    var posts = res.body.posts;
    var sponsors = _.map(posts, function(p){
        return {
            'name': p['title'],
            'image': p['attachments'][0]['images']['full']['url'],
            'level': p['taxonomy_sponsorlevel'][0]['slug'],
        }
    });
    console.log("SPONSORS:", sponsors);
    callback(null, sponsors);
  });
}





exports.syncdb = function(){

  async.parallel({
      sponsors: fetchSponsors,
      website: fetchEventsAndLocations
  },
  function(err, results) {
     var db = {
      events: results.website.events,
      locations: results.website.locations,
      sponsors: results.sponsors
    };
    console.log("writing: db.json");
    jsonfile.writeFileSync(__dirname+"/../db.json", db);
  });

};


if (require.main === module)
    exports.syncdb();
