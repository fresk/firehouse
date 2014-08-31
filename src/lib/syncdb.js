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



function fetchEventsAndLocations(callback) {
  console.log("fetching event and venue data from dmsc.fresk.io...");
  request.get(event_location_url)
    .set('user-agent', 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13')
    .end(function(res) {
      console.log("got event and venue data");
      //console.log(res)
      res.body.events = _.map(res.body.events, function(e) {
        var find = '\r\n';
        var re = new RegExp(find, 'g');
        e.content = e.content.replace(re, "<br/>");
        return e;

      });
      callback(null, res.body);
    });
}


function fetchSponsors(callback) {
  console.log("fetching sponsors dmsc.fresk.io...");
  request(sponsor_feed_url)
    .set('user-agent', 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13')
    .end(function(res) {
      var posts = res.body.posts;
      var sponsors = _.map(posts, function(p) {
        try {
          return {
            'name': p['title'],
            'image': p['attachments'][0]['images']['full']['url'],
            'level': p['taxonomy_sponsorlevel'][0]['slug'],
          }
        } catch (e) {
          return null;
        }

      });
      callback(null, _.compact(sponsors));
    });
}



function fetchScreenModules(callback) {
  console.log("fetching screen modules dmsc.fresk.io...");
  request(screen_modules_url)
    .set('user-agent', 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13')
    .end(function(res) {
      var posts = res.body.posts;
      var modules = _.map(posts, function(p) {

        try {
          var module = {
            'name': p['title'],
            'content': p['content'],
            'slug': p['slug']
          };
          if (p['attachments'].length > 0) {
            module['image'] = p['attachments'][0]['images']['full']['url'];
          }

          if (p['custom_fields'] && p['custom_fields']['backgroundVideo']) {
            module['video'] = p['custom_fields']['backgroundVideo'];
            return module;
          }
        } catch (e) {
          return null
        }

      });
      var mods = {};
      _.forEach(_.compact(modules), function(m) {
        mods[m.slug] = m;
      });
      callback(null, mods);
    });
}



function checkExclude(tags) {
  for (var i = 0; i < tags.length; i++) {
    if (tags[0].slug == "excludefromfeatured")
      return true;
  }
  return false;
}

function fetchTallSlides(callback) {
  console.log("fetching tallslides from dmsc.fresk.io...");
  request(screen_tallslides_url)
    .set('user-agent', 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13')
    .end(function(res) {
      var posts = res.body.posts;
      var modules = _.map(posts, function(p) {
        //console.log(p);
        try {
          var module = {
            'name': p['title'],
            'content': p['content'],
            'slug': p['slug'],
            'excludeFromFeatured': checkExclude(p['tags'])
          };
          if (p['thumbnail_images'] && p['thumbnail_images']['full']) {
            module['image'] = p['thumbnail_images']['full']['url'];
          }
          return module;
        } catch (e) {
          return null
        }
      });

      var mods = {};
      _.forEach(_.compact(modules), function(m) {
        mods[m.slug] = m;
      });
      callback(null, mods);
    });
}



function fetchSignageSlides(callback) {
  console.log("fetching tallslides from dmsc.fresk.io...");
  request(screen_signagesliders_url)
    .set('user-agent', 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13')
    .end(function(res) {
      var posts = res.body.posts;
      var modules = _.map(posts, function(p) {
        try {
          var module = {
            'name': p['title'],
            'content': p['content'],
            'slug': p['slug']
          };
          if (p['attachments'].length > 0) {
            module['image'] = p['attachments'][0]['images']['full']['url'];
          }
          return module;
        } catch (e) {
          return null;
        }
      });
      var mods = {};
      _.forEach(_.compact(modules), function(m) {
        mods[m.slug] = m;
      });
      callback(null, mods);
    });
}


exports.syncdb = function(cb) {

  async.parallel({
      sponsors: fetchSponsors,
      modules: fetchScreenModules,
      tallslides: fetchTallSlides,
      website: fetchEventsAndLocations
    },
    function(err, results) {

      var filteredEvents = _.filter(results.website.events, function(ev) {
        if (ev.categories && ev.categories.length > 0)
          return true;
      });


      var db = {
        events: filteredEvents,
        locations: results.website.locations,
        sponsors: results.sponsors,
        modules: results.modules,
        tallslides: results.tallslides
      };

      db.categories = {};
      _.forEach(db.events, function(event) {
        for (var i = 0; i < event.categories.length; i++) {
          var c = event.categories[i];
          if (db.categories[c.slug] == undefined) {
            db.categories[c.slug] = {
              'name': c.name,
              'id': c.id,
              'slug': c.slug,
              'count': 1
            };
          } else {
            db.categories[c.slug].count += 1;
          }
        }
      })



      console.log("writing: db.json");
      jsonfile.writeFileSync(__dirname + "/../db.json", db);
      if (cb) cb(null, db);
    });

};


if (require.main === module)
  exports.syncdb();