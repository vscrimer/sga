// Generated by CoffeeScript 1.6.2
(function() {
  (function($) {
    return window.adoratio = function(c, baseURL, map) {
      return function(data) {
        var dj, getImgCenter, getImgPosition, getImgTiles, po, startZoom;

        data.levels = parseInt(data.levels);
        data.height = parseInt(data.height);
        data.width = parseInt(data.width);
        dj = {};
        dj.tile2long = function(x, z) {
          return x / Math.pow(2, z) * 360 - 180;
        };
        dj.tile2lat = function(y, z) {
          var n;

          n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
          return 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
        };
        dj.getImgDimensions = function(level) {
          var divisor, height, width;

          divisor = Math.pow(2, data.levels - level);
          height = Math.round(data.height / divisor);
          width = Math.round(data.width / divisor);
          return {
            w: width,
            h: height
          };
        };
        dj.template = function(u, el) {
          return function(tile) {
            var H, W, currentImgSize, insertX, insertY, k, ts, url;

            ts = map.tileSize();
            k = Math.pow(2, data.levels - tile.zoom);
            currentImgSize = dj.getImgDimensions(tile.zoom);
            insertX = tile.column * ts.x * k;
            insertY = tile.row * ts.y * k;
            W = ts.x;
            if (insertX + ts.x * k > data.width) {
              W = ts.x - (((insertX + ts.x * k) - data.width) / k);
              W = Math.max(0, ~~W);
              el.setAttribute("width", W);
            }
            H = ts.y;
            if (insertY + ts.y * k > data.height) {
              H = ts.y - (((insertY + ts.y * k) - data.height) / k);
              H = Math.max(0, ~~H);
              el.setAttribute("height", H);
            }
            url = "" + baseURL + "&svc_id=info:lanl-repo/svc/getRegion&svc_val_fmt=info:ofi/fmt:kev:mtx:jpeg2000&svc.format=image/jpeg&svc.level=" + tile.zoom + "&svc.region=" + insertY + "," + insertX + "," + H + "," + W;
            if (insertX >= 0 && insertY >= 0 && W > 0 && H > 0) {
              return url;
            }
            return null;
          };
        };
        dj.image = function() {
          var image, load, unload;

          load = function(tile) {
            var element, lat, lon, size, tileUrl, url;

            element = tile.element = po.svg("image");
            size = image.map().tileSize();
            element.setAttribute("preserveAspectRatio", "none");
            element.setAttribute("width", size.x);
            element.setAttribute("height", size.y);
            lon = dj.tile2long(tile.column, tile.zoom);
            lat = dj.tile2lat(tile.row, tile.zoom);
            url = dj.template(baseURL, element);
            if (typeof url === "function") {
              element.setAttribute("opacity", 0);
              tileUrl = url(tile);
              if (tileUrl !== null) {
                return tile.request = po.queue.image(element, tileUrl, function(img) {
                  delete tile.request;
                  tile.ready = true;
                  tile.img = img;
                  element.removeAttribute("opacity");
                  return image.dispatch({
                    type: "load",
                    tile: tile
                  });
                });
              } else {
                tile.ready = true;
                return image.dispatch({
                  type: "load",
                  tile: tile
                });
              }
            } else {
              tile.ready = true;
              if (url !== null) {
                element.setAttributeNS(po.ns.xlink, "href", url);
              }
              return image.dispatch({
                type: "load",
                tile: tile
              });
            }
          };
          unload = function(tile) {
            if (tile.request) {
              return tile.request.abort(true);
            }
          };
          image = po.layer(load, unload);
          return image;
        };
        dj.drag = function() {
          var container, drag, dragging, mousedown, mousemove, mouseup;

          drag = {};
          map = null;
          container = null;
          dragging = null;
          mousedown = function(e) {
            if (e.shiftKey) {
              return 0;
            }
            dragging = {
              x: e.clientX,
              y: e.clientY
            };
            map.focusableParent().focus();
            e.preventDefault();
            return document.body.style.setProperty("cursor", "move", null);
          };
          mousemove = function(e) {
            if (!dragging) {
              return 0;
            }
            dj.cc = map.center();
            map.panBy({
              x: e.clientX - dragging.x,
              y: e.clientY - dragging.y
            });
            dragging.x = e.clientX;
            dragging.y = e.clientY;
            return map.dispatch({
              type: "drag"
            });
          };
          mouseup = function(e) {
            if (!dragging) {
              return 0;
            }
            mousemove(e);
            dragging = null;
            return document.body.style.removeProperty("cursor");
          };
          drag.map = function(x) {
            if (!arguments.length) {
              return map;
            }
            if (map) {
              container.removeEventListener("mousedown", mousedown, false);
              container = null;
            }
            if ((map = x)) {
              container = map.container();
              container.addEventListener("mousedown", mousedown, false);
            }
            return drag;
          };
          window.addEventListener("mousemove", mousemove, false);
          window.addEventListener("mouseup", mouseup, false);
          return drag;
        };
        getImgTiles = function(levels, zoom) {
          var currentImgSize, h, k, ts, w;

          ts = map.tileSize();
          k = Math.pow(2, levels - zoom);
          currentImgSize = dj.getImgDimensions(zoom);
          w = ts.x * k;
          h = ts.y * k;
          return {
            columns: currentImgSize.w * k / w,
            rows: currentImgSize.h * k / h
          };
        };
        getImgCenter = function(levels, zoom) {
          var t;

          t = getImgTiles(levels, zoom);
          return {
            lon: dj.tile2long(t.columns / 2, zoom),
            lat: dj.tile2lat(t.rows / 2, zoom)
          };
        };
        getImgPosition = function(levels, zoom) {
          var bottomLat, leftLon, rightLon, t, topLat;

          t = getImgTiles(levels, zoom);
          topLat = dj.tile2lat(0, zoom);
          bottomLat = dj.tile2lat(t.rows, zoom);
          leftLon = dj.tile2long(0, zoom);
          rightLon = dj.tile2long(t.columns, zoom);
          return {
            topLeft: map.locationPoint({
              lat: topLat,
              lon: leftLon
            }),
            bottomRight: map.locationPoint({
              lat: bottomLat,
              lon: rightLon
            })
          };
        };
        po = org.polymaps;
        map.add(po.dblclick()).add(dj.drag()).add(po.wheel());
        startZoom = data.levels + Math.log(c.clientWidth) / Math.log(2) - Math.log(data.width) / Math.log(2);
        map.zoomRange([startZoom, data.levels]).zoom(startZoom);
        dj.cc = map.center();
        map.center(getImgCenter(data.levels, startZoom));
        map.position = getImgPosition(data.levels, map.zoom());
        map.on('zoom', function() {
          var p;

          p = getImgPosition(data.levels, map.zoom());
          return map.position = p;
        });
        map.on('drag', function() {
          var currentImgSize, p;

          p = getImgPosition(data.levels, map.zoom());
          currentImgSize = dj.getImgDimensions(map.zoom());
          map.position = p;
          if (p.topLeft.x + currentImgSize.w > 20 && p.bottomRight.y > 20 && p.bottomRight.x - currentImgSize.w < c.clientWidth - 20 && p.topLeft.y < c.clientHeight - 20) {
            return 0;
          } else {
            return map.center(dj.cc);
          }
        });
        map.add(dj.image());
        return map;
      };
    };
  })(jQuery);

}).call(this);
