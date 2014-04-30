
var _ = require('underscore');
var async = require('async');
var request = require('superagent');
var tabletop = require('tabletop');
var jsonfile = require('jsonfile');

var event_location_url = "http://dmsc.fresk.io/wp-content/themes/fresk-wp-bootstrap/event-json.php";

var sponsor_feed_url = "http://dmsc.fresk.io/?json=1&post_type=sponsors";
var screen_modules_url = "http://dmsc.fresk.io/?json=1&post_type=screen-module";
var screen_tallslides_url = "http://dmsc.fresk.io/?json=1&post_type=tallslides";
var screen_signagesliders_url = "http://dmsc.fresk.io/?json=1&post_type=signagesliders";



function fetchEventsAndLocations(callback){
  console.log("fetching event and venue data from dmsc.fresk.io...");
  request(event_location_url, function(res){
    console.log("got event and venue data");
    res.body.events = _.map(res.body.events, function(e){
        var find = '\r\n';
        var re = new RegExp(find, 'g');
        e.content = e.content.replace(re, "<br/>");
        return e;

    });
    callback(null, res.body);
  });
}


function fetchSponsors(callback){
  console.log("fetching sponsors dmsc.fresk.io...");
  request(sponsor_feed_url, function(res){
    var posts = res.body.posts;
    var sponsors = _.map(posts, function(p){
        return {
            'name': p['title'],
            'image': p['attachments'][0]['images']['full']['url'],
            'level': p['taxonomy_sponsorlevel'][0]['slug'],
        }
    });
    callback(null, sponsors);
  });
}



function fetchScreenModules(callback){
  console.log("fetching screen modules dmsc.fresk.io...");
  request(screen_modules_url, function(res){
    var posts = res.body.posts;
    var modules = _.map(posts, function(p){
        var module = {
            'name': p['title'],
            'content': p['content'],
            'slug': p['slug']
        };
        if (p['attachments'].length > 0){
            module['image'] =  p['attachments'][0]['images']['full']['url'];
        }
        return module;
    });
    var mods = {};
    _.forEach(modules, function(m){
        mods[m.slug] = m;
    });
    callback(null, mods);
  });
}



function fetchTallSlides(callback){
  console.log("fetching tallslides from dmsc.fresk.io...");
  request(screen_tallslides_url, function(res){
    var posts = res.body.posts;
    var modules = _.map(posts, function(p){
        //console.log(p);
        var module = {
            'name': p['title'],
            'content': p['content'],
            'slug': p['slug']
        };
        if (p['thumbnail_images'] && p['thumbnail_images']['full'] ){
            module['image'] =  p['thumbnail_images']['full']['url'];
        }
        return module;
    });
    var mods = {};
    _.forEach(modules, function(m){
        mods[m.slug] = m;
    });
    callback(null, mods);
  });
}




function fetchSignageSlides(callback){
  console.log("fetching tallslides from dmsc.fresk.io...");
  request(screen_signagesliders_url, function(res){
    var posts = res.body.posts;
    var modules = _.map(posts, function(p){
        var module = {
            'name': p['title'],
            'content': p['content'],
            'slug': p['slug']
        };
        if (p['attachments'].length > 0){
            module['image'] =  p['attachments'][0]['images']['full']['url'];
        }
        return module;
    });
    var mods = {};
    _.forEach(modules, function(m){
        mods[m.slug] = m;
    });
    callback(null, mods);
  });
}


exports.syncdb = function(cb){

  async.parallel({
      sponsors: fetchSponsors,
      modules: fetchScreenModules,
      tallslides: fetchTallSlides,
      website: fetchEventsAndLocations
  },
  function(err, results) {
     var db = {
      events: results.website.events,
      locations: results.website.locations,
      sponsors: results.sponsors,
      modules: results.modules,
      tallslides: results.tallslides
    };
    console.log("writing: db.json");
    jsonfile.writeFileSync(__dirname+"/../db.json", db);
    if (cb) cb(null, db);
  });

};


if (require.main === module)
    exports.syncdb();
