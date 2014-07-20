;(function (window, document, gmaps, undefined) {

  "use strict";

  Number.prototype.toRad = function () {

    return this * Math.PI / 180;
  };

  Number.prototype.toDeg = function () {

    return this * 180 / Math.PI;
  };

  var pow = Math.pow,
      join = [].join,
      toString = {}.toString,
      push = [].push,
      services = {

        elevation: new gmaps.ElevationService(),
        streetView: new gmaps.StreetViewService(),
        directions: new gmaps.DirectionsService()
      },
      brandingimagesrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAAAgCAMAAADaHo1mAAAAM1BMVEUAAAD///////////////////////////////////////////////////////////////+3leKCAAAAEHRSTlMAQL+AEO9g359QMHCvzyCP56CEoQAAAj5JREFUeF61ltmOqzAQBdvd3s1S//+1d5JgzDBhpDsi5wlKqAs4GJB74mMCgpPLLC3rVyYrfxIszgEmV3EKamYKhLz8yQFcXYCfCOZfmwZg9wr8TKg7qIFQ7xVs83vyXOVWgUE7guj/VjPwtjwfCJfdm1mrvwHx7hXvgI1VM4tepLRWmzTI7wUWUA2gbpu1g7qBNrNlHYKS0BlCFNEpJVFoF9VnL+IzEN+CmoK5kiCURaQLVubHXoDmXS3lqhs/M22lA+4IphdYAuXhTaCyCyLh2WFk27gSGCx7SSSR9Qzy1l0EShf4wLpT1wXxbfV0sALlDKoHfYEE1gXxKZOopOalC9afggKhgwpYAe3AATaemnwQrOC8JbKTngDp7R1iB4CeweSAuh07BAqq2k/+UFlP1GdWA3yHCvoNzDAJkEddXdDhSAS0g6xmCsm/mhsCa2cg61ajT6zSBQbBnwzpVLOBygLkIaDUE6jiZwjNlRmTXVAA+9knoZ4EoodXC6QnCP4IROIMQJMhkLAPG8lAKCdBhb6wIjgRN0AbrVXAHwWNYViOBqblm0BiL9EF4uZhPYI+NvsuWPqw7MS73KSnJIDZinNt2uckSGYTyY2j5g56ZmCu2+CkJrICcF6/cQoAoFOrO8yquhaRC1BMFbYK7ZHnAqirfsUWOce5Kv+RmEhrdE7p9d+bDG3vnHa7oEDuoMF0u2CCUXX6gEChjB3aJ65g7sCHD5TsAF361zXK/YkAas+FV+QTWXICYPr9T+0fyZwmnCMT3PEAAAAASUVORK5CYII=",
      copyrighttext = "&copy; 2014 Google";

  // Get a LatLng for some coordinates
  var _parseLocation = function (location) {

    if(location instanceof gmaps.LatLng) {

      return location;
    }

    var lat = toString.call(location) === "[object Array]" ? location[0] : location.lat,
        lng = toString.call(location) === "[object Array]" ? location[1] : location.lng;

    return new gmaps.LatLng(lat, lng);
  };

  // build all options for hyperlapse
  var _buildFields = function (options) {

    if(!options) {

      return hyperlapse.defaults;
    }

    var o = {};

    for(var field in hyperlapse.defaults) {

      o[field] = options[field] || hyperlapse.defaults[field];
    }

    return o;
  };

  // Get renderer for context
  var getRenderer = function () {

    if(!!window.WebGLRenderingContext && !!document.createElement("canvas").getContext("experimental-webgl")) {

      return new THREE.WebGLRenderer();
    }
    else {

      console.info("WebGL not available, using CanvasRenderer");
      return new THREE.CanvasRenderer();
    }
  };

  // Load the directions route from start to end
  var loadDirections = function (start, end, success, error) {

    services.directions.route({

      origin: start,
      destination: end,
      travelMode: gmaps.DirectionsTravelMode.DRIVING
    }, function (response, status) {

      if(status === gmaps.DirectionsStatus.OK) {

        success(response);
      }
      else {

        error("No Directions Result");
      }
    });
  };

  // get panorama data for a particular location
  var getPanorama = function (location, success, error) {

    services.streetView.getPanoramaByLocation(location, 50, function (response, status) {

      if(status === gmaps.StreetViewStatus.OK) {

        success({

          heading: response.tiles.centerHeading,
          pano: response.location.pano,
          copyright: response.copyright,
          location: response.location.latLng,
          pitch: response.tiles.originPitch
        });
      }
      else {

        error("Could not load panorama");
      }
    });
  };

  // get a canvas to paint, depending on the zoom(quality) level
  var getCanvasForZoom = function (zoom) {

    var canvas = document.createElement("canvas");

    var w = pow(2, zoom),
        h = pow(2, zoom - 1);

    canvas.width = w * 416;
    canvas.height = h * 416;

    var context = canvas.getContext("2d");

    context.translate(canvas.width, 0);
    context.scale(-1, 1);

    return canvas;
  };

  // paint a canvas with a panorama
  var getPanoramaCanvas = function (id, zoom, success, error, progress) {

    var w = (zoom === 3) ? 7 : pow(2, zoom),
        h = pow(2, zoom - 1);

    var canvas = getCanvasForZoom(zoom),
        context = canvas.getContext("2d");

    var count = 0;
    var total = w * h;

    var _composeTile = function (x, y, image) {

      context.drawImage(image, x * 512, y * 512);
      count++;

      if(progress && progress.call) {

        progress.call({}, count * 100 / total);
      }

      if (count === total) {

        if (success && success.call) {

          success.call({}, canvas);
        }
      }
    };

    var _compose = function (x, y) {

      var url = join.call([
        "http://maps.google.com/cbk?output=tile&panoid=",
        id,
        "&zoom=",
        zoom,
        "&x=",
        x,
        "&y=",
        y,
        "&",
        Date.now()
      ], "");

      var image = new Image();

      image.addEventListener("load", function () {

        _composeTile(x, y, this);
      });

      image.crossOrigin = "";
      image.src = url;
    };

    for(var x = 0 ; x < w ; x++) {

      for(var y = 0 ; y < h ; y++) {

        _compose(x, y);
      }
    }
  };

  // remove null points
  var filterPoints = function (points) {

    var out = [];

    for(var i = 0 ; i < points.length ; i++) {

      if(points[i]) {

        push.call(out, points[i]);
      }
    }

    return out;
  };

  // get elevations for a set of points
  var getElevations = function (locations, success, error) {

    services.elevation.getElevationForLocations({

      locations: locations
    }, function (response, status) {

      if(status === gmaps.ElevationStatus.OK) {

        success(response);
      }
      else if(status === gmaps.ElevationStatus.OVER_QUERY_LIMIT) {

        success(null);
        error("Cannot use elevation, query limit exceeded");
      }
      else {

        error(status);
      }
    });
  };

  // hyperlapse, reloaded
  var hyperlapse = function (container, options, error, progress) {

    var material = new THREE.MeshBasicMaterial();
    material.map = new THREE.Texture();
    material.side = THREE.DoubleSide;
    material.overdraw = true;

    var fields = _buildFields(options),

        _error = error || fields.onError,
        _progress = progress || fields.onProgress,

        mesh = new THREE.Mesh(
          new THREE.SphereGeometry(
            fields.radius,
            fields.horizontalSegments,
            fields.verticalSegments
          ),
          material
        ),
        scene = new THREE.Scene(),
        camera = new THREE.PerspectiveCamera(
          fields.fov,
          fields.width / fields.height,
          fields.minDistance,
          fields.maxDistance
        ),
        renderer = getRenderer(),

        rawPoints = [],
        hlIndex = 0,
        hlPoints = [],
        hlTotal = 0,

        increasing = true,
        loadPausable = true,
        loading = false,
        playing = false,
        cancelled = false,
        lookatElevation = 0,
        lookatHeading = 0,
        pitch = 0,
        now = Date.now(),
        diff = Math.floor(1000 / fields.speed),
        currdiff = 0;

    scene.add(mesh);
    scene.add(camera);

    renderer.autoClearColor = false;
    renderer.setSize(fields.width, fields.height);

    container.appendChild(renderer.domElement);

    container.style.position = "relative";

    var brandingimage = container.appendChild(new Image());
    brandingimage.src = brandingimagesrc;
    brandingimage.style.position = "absolute";
    brandingimage.style.bottom = "10px";
    brandingimage.style.left = "8px";
    container.appendChild(brandingimage);

    var copyright = container.appendChild(document.createElement("div"));
    copyright.innerHTML = copyrighttext;
    copyright.style.backgroundColor = "rgba(200, 200, 200, 0.5)";
    copyright.style.color = "black";
    copyright.style.position = "absolute";
    copyright.style.bottom = "3px";
    copyright.style.right = 0;
    copyright.style.padding = "5px";
    copyright.style.fontSize = "10px";

    var hardReset = function () {

      rawPoints = [];
      hlIndex = 0;
      hlTotal = 0;

      increasing = true;
      loading = false;
      playing = false;
      loadPausable = true;
      cancelled = false;
      lookatElevation = 0;
      lookatHeading = 0;
      pitch = 0;
    };

    // Generate route from directions response
    var getRoute = function (route) {

      var points = [];

      var getPoint = function (a, b, m) {

        var x1 = a.lat().toRad(),
            y1 = a.lng().toRad(),
            x2 = b.lat().toRad(),
            y2 = b.lng().toRad();

        var x = x1 + m * (x2 - x1),
            y = y1 + m * (y2 - y1);

        return new gmaps.LatLng(x.toDeg(), y.toDeg());
      };

      var legs = route.legs,
          path = route.overview_path,
          distance = 0;

      for (var i = 0 ; i < legs.length ; i++) {

        distance += legs[i].distance.value;
      }

      var segment = distance / fields.maxPoints;
      segment = (segment < fields.distanceBetweenPoints) ? fields.distanceBetweenPoints : segment;

      var d = 0,
          r = 0;

      for(i = 0 ; i < path.length - 1 ; i++) {

        var a = path[i],
            b = path[i + 1];

        d = gmaps.geometry.spherical.computeDistanceBetween(a, b);

        if(r > 0) {

          if(r > d) {

            r -= d;
          }
          else {

            var point = getPoint(a, b, r / d);
            push.call(points, point);
            a = point;
            d = gmaps.geometry.spherical.computeDistanceBetween(a, b);
            r = 0;
          }
        }
        else {

          var s = Math.floor(d / segment);

          if(s > 0) {

            for(var j = 0 ; j < s ; j++) {

              var k = j / s;

              if(k > 0 || (k === 0 && i === 0)) {

                push.call(points, getPoint(a, b, k));
              }
            }

            r = d - s * segment;
          }
          else {

            r = segment - d;
          }
        }
      }

      push.call(points, path[path.length - 1]);

      return points;
    };

    // get panoramas for the whole set of points
    var parseRoute = function (route, cb) {

      var length = route.length,
          count = 0;
      var points = [];
      var prevPano = "";

      var getPanoramaForIndex = function (point, i) {

        getPanorama(point, function (response) {

          if(prevPano !== response.pano) {

            points[i] = response;

            prevPano = response.pano;

            _progress((count++ + 1) * 50 / length);
          }
          else {

            points[i] = null;
          }

          if(count === length) {

            cb(points);
          }
        }, _error);
      };

      for(var i = 0 ; i < length ; i++) {

        if(loading) {

          getPanoramaForIndex(route[i], i);
        }
        else {

          break;
        }
      }
    };

    var routeLoaded = function () {

      if(fields.onRouteLoad && fields.onRouteLoad.call) {

        fields.onRouteLoad.call();
      }
    };

    var loadImages = function (points, success) {

      if(cancelled) {

        return ;
      }

      loadPausable = false;

      routeLoaded();

      rawPoints = points;

      var length = points.length,
          count = 0;

      var getPanoramaImage = function (point) {

        getPanoramaCanvas(point.pano, fields.quality, function (canvas) {

          point.image = canvas;
          _progress(50 + (count++ + 1) * 50 / length);

          if(count === length) {

            hlPoints = points;
            hlTotal = length;
            success();
          }
        }, _error);
      };

      for(var i = 0 ; i < points.length ; i++) {

        getPanoramaImage(points[i]);
      }
    };

    // draw the current image
    var draw = function () {

      material.map.image = hlPoints[hlIndex].image;
      material.map.needsUpdate = true;

      var lookatLocation = _parseLocation(fields.lookat);

      lookatHeading = (fields.lookat) ? gmaps.geometry.spherical.computeHeading(hlPoints[hlIndex].location, lookatLocation) : 0;

      if(hlPoints[hlIndex].elevation) {

        var height = lookatElevation - hlPoints[hlIndex].elevation + fields.elevationOffset;
        var base = gmaps.geometry.spherical.computeDistanceBetween(hlPoints[hlIndex].location, lookatLocation);
        var angle = Math.atan(Math.abs(height / base)).toDeg();
        pitch = height < 0 ? -angle : angle;
      }
    };

    // set the environment up
    var set = function () {

      var d = hlIndex / hlTotal;

      var x = fields.position.x + fields.offset.x * d,
          y = fields.position.y + fields.offset.y * d,
          z = fields.offset.z.toRad() * d;

      var cameraLong = (fields.lookat) ? lookatHeading - hlPoints[hlIndex].heading + x : x,
          cameraLat = pitch + y;

      cameraLat = Math.max(-85, Math.min(85, cameraLat));

      var phi = (90 - cameraLat).toRad(),
          theta = cameraLong.toRad();

      camera.lookAt(new THREE.Vector3(
        500 * Math.sin(phi) * Math.cos(theta),
        500 * Math.cos(phi),
        500 * Math.sin(phi) * Math.sin(theta)
      ));

      camera.rotation.z = (fields.rotationComp) ? z - fields.rotationComp : z;
      mesh.rotation.z = hlPoints[hlIndex].pitch.toRad();

      renderer.render(scene, camera);
    };

    // change the currently rendered point
    var movePoint = function () {

      draw();

      if(increasing) {

        if(++hlIndex === hlTotal) {

          hlIndex = hlTotal - 1;
          increasing = !increasing;
        }
      }
      else {

        if(--hlIndex === -1) {

          hlIndex = 0;
          increasing = !increasing;
        }
      }

      if(fields.onFrameChange && fields.onFrameChange.call) {

        fields.onFrameChange.call({}, hlIndex + 1, hlTotal);
      }
    };

    // render the animation
    var render = function () {

      var p = now;
      now = Date.now();
      currdiff += now - p;

      if(currdiff >= diff && playing) {

        movePoint();
        currdiff = 0;
      }

      set();
      requestAnimationFrame(render);
    };

    var addMouseListeners = function () {

      var x = 0,
          y = 0,
          pointerX = 0,
          pointerY = 0,
          pressed = false;

      var mousedownhandler = function (e) {

        if(!pressed && !loading) {

          pressed = true;
          pointerX = e.clientX;
          pointerY = e.clientY;

          x = fields.position.x;
          y = fields.position.y;

          if(playing) {

            playing = false;
          }
        }
      };

      var mousemovehandler = function (e) {

        if(pressed && !loading) {

          var f = fields.fov / 200;
          var fx = (pointerX - e.clientX) * f;
          var fy = (e.clientY - pointerY) * f;

          fields.position.x = x + fx;
          fields.position.y = y + fy;
        }
      };

      var mouseuphandler = function () {

        if(pressed && !loading) {

          fields.position.x = 0;
          fields.position.y = 0;

          pressed = false;

          if(!playing) {

            playing = true;
          }
        }
      };

      container.addEventListener("mousedown", mousedownhandler);
      container.addEventListener("mousemove", mousemovehandler);
      container.addEventListener("mouseup", mouseuphandler);
    };

    var loaded = function () {

      loading = false;

      if(fields.onLoad && fields.onLoad.call) {

        fields.onLoad.call();
      }

      render();

      if(fields.explore) {

        addMouseListeners();
      }
    };

    var createHyperlapse = function () {

      if(!loading && !playing) {

        loading = true;

        loadDirections(_parseLocation(fields.start), _parseLocation(fields.end), function (response) {

          var route = getRoute(response.routes[0]);

          parseRoute(route, function (points) {

            points = filterPoints(points);

            if(fields.elevation) {

              var newroute = [];

              for(var i = 0 ; i < points.length ; i++) {

                newroute[i] = points[i].location;
              }

              getElevations(newroute, function(elevations) {

                if(elevations) {

                  for(var i = 0 ; i < elevations.length ; i++) {

                    points[i].elevation = elevations[i].elevation;
                  }
                }
                else {

                  fields.elevation = false;
                }

                getElevations([ _parseLocation(fields.lookat) ], function (response) {

                  if(response) {

                    lookatElevation = response[0].elevation;
                  }

                  loadImages(points, loaded);
                }, _error);
              }, _error);
            }
            else {

              loadImages(points, loaded);
            }
          });
        }, _error);
      }
    };

    var play = function () {

      if(!loading) {

        playing = true;
      }
    };

    var pause = function () {

      playing = false;
    };

    var pauseLoad = function () {

      if(loadPausable) {

        cancelled = true;
        return true;
      }

      return false;
    };

    var resumeLoad = function () {

      if(loadPausable) {

        cancelled = false;
        return true;
      }

      return false;
    };

    createHyperlapse();

    var recreate = function () {

      hardReset();
      createHyperlapse();
    };

    var resize = function (width, height) {

      renderer.setSize(width, height);
    };

    return {

      play: play,

      pause: pause,

      isLoading: function () {

        return loading;
      },

      isPlaying: function () {

        return playing;
      },

      onLoad: function (cb) {

        if(toString.call(cb) === "[object Function]") {

          fields.onLoad = cb;
        }
      },

      onMidway: function (cb) {

        if(toString.call(cb) === "[object Function]") {

          fields.onRouteLoad = cb;
        }
      },

      onProgress: function (cb) {

        if(toString.call(cb) === "[object Function]") {

          _progress = cb;
        }
      },

      onError: function (cb) {

        if(toString.call(cb) === "[object Function]") {

          _error = cb;
        }
      },

      onFrame: function (cb) {

        if(toString.call(cb) === "[object Function]") {

          fields.onFrameChange = cb;
        }
      },

      recreate: recreate,

      pauseLoad: pauseLoad,

      resumeLoad: resumeLoad,

      resize: resize
    };
  };

  hyperlapse.defaults = {

    width: window.innerWidth,
    height: window.innerHeight,
    fov: 70,
    minDistance: 1,
    maxDistance: 1100,
    radius: 500,
    horizontalSegments: 60,
    verticalSegments: 40,
    distanceBetweenPoints: 5,
    maxPoints: 100,
    speed: 15,

    start: [50.39661, -105.11520000000002],
    end: [50.39656, -105.01267000000001],
    lookat: [50.4033146934618, -105.06006622558596],
    quality: 2,
    position: {

      x: 0,
      y: 0
    },
    offset: {

      x: 0,
      y: 0,
      z: 0
    },
    elevation: true,
    elevationOffset: 0,
    rotationComp: 0,
    explore: false,

    onError: function (message) {

      console.error(message);
    },
    onProgress: function(value) {

      console.log("Loaded:", value, "%");
    },
    onCancel: function() {

      console.info("Loading cancelled, call create to reload");
    },
    onRouteLoad: function () {

      console.info("Half Done!!!");
    },
    onLoad: function () {

      console.info("All Done, Call play to rock your world!!!");
    },
    onFrameChange: function (current, total) {

      console.info("Showing Frame", current, "of", total, "frames");
    }
  };

  window.hyperlapse = hyperlapse;
})(window, document, google.maps);
