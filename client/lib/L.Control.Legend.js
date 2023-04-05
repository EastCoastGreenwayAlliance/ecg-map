/*
Leaflet Legend Control, specifically built for the East Coast Greenway Map.
Project repo may be found at: https://github.com/EastCoastGreenwayAlliance/ecg-map

Author: Chris Henrick @clhenrick <chrishenrick@gmail.com>
*/
(function (factory, window) {
     // see https://github.com/Leaflet/Leaflet/blob/master/PLUGIN-GUIDE.md#module-loaders
     // for details on how to structure a leaflet plugin.

    // define an AMD module that relies on 'leaflet'
    if (typeof define === 'function' && define.amd) {
        define(['leaflet'], factory);

    // define a Common JS module that relies on 'leaflet'
    } else if (typeof exports === 'object') {
        if (typeof window !== 'undefined' && window.L) {
            module.exports = factory(L);
        } else {
            module.exports = factory(require('leaflet'));
        }
    }

    // attach your plugin to the global 'L' variable
    if (typeof window !== 'undefined' && window.L){
        window.L.Control.Locate = factory(L);
    }
} (function (L) {
  var Legend = L.Control.extend({
    options: {
      collapsed: false,
      position: 'topright',
    },

    initialize: function (options) {
      // set default options if nothing is set (merge one step deep)

      for (var i in options) {
        if (typeof this.options[i] === 'object') {
          L.extend(this.options[i], options[i]);
        } else {
          this.options[i] = options[i];
        }
      }
    },

    onAdd: function (map) {
      this._map = map;
      var collapsed = this._collapsed = this.options.collapsed;
      var className = 'leaflet-map-legend';
      var legend = this._container = L.DomUtil.create('div', className, L.DomUtil.get('map'));
      var html = `
        <ul class="map-legend-items">
          <li><span class="legend-item-road"></span> On Road</li>
          <li><span class="legend-item-dirt"></span> Trail</li>
          <li><span class="legend-item-transit"></span> Transit or Ferry</li>
          <li><span class="legend-item-highstress"></span> High_Stress Route</li>
          <li><span class="legend-item-alertpoi"></span> Caution<br/>&nbsp;&nbsp;&nbsp;&nbsp;(zoom &lt; 1 mi)</li>
        </ul>
      `;

      legend.innerHTML = html;

      if (collapsed) {
        this._map.on('click', this.collapse, this);

        if (L.Browser.android) {
          L.DomEvent.on(legend, {
            mouseenter: this.expand,
            mouseleave: this.collapse
          }, this);
        }
      }

      var link = this._link = L.DomUtil.create('a', `${className}-toggle`, legend);
      link.href = '#';
      link.title = 'Legend';

      L.DomEvent
          .on(this._link, 'click', L.DomEvent.stopPropagation)
          .on(this._link, 'click', L.DomEvent.preventDefault)
          .on(this._link, 'click', this._onClick, this)
          .on(this._link, 'dblclick', L.DomEvent.stopPropagation);
      /* previous change to default legend to open reveals it cannot be closed with touch. Per https://github.com/Leaflet/Leaflet/issues/6978 L.touch no longer needed
      if (L.Browser.touch) {
        L.DomEvent.on(link, 'click', L.DomEvent.stop);
        L.DomEvent.on(link, 'click', this.expand, this);
      } else {
        L.DomEvent.on(link, 'focus', this.expand, this);
      }
      */
      // // work around for Firefox Android issue https://github.com/Leaflet/Leaflet/issues/2033
      L.DomEvent.on(legend, 'click', function() {
        setTimeout(L.Util.bind(this._link, this), 0);
      }, this);

      if (!collapsed) {
        this.expand();
      }

      return legend;
    },

    _onClick: function(e) {
      L.DomEvent.stop(e);

      if (this._collapsed) {
        this.expand();
      } else {
        this.collapse();
      }

      this._collapsed = !this._collapsed;
    },

    expand: function() {
      // adds a class to expand the control
      L.DomUtil.addClass(this._container, 'leaflet-map-legend-expanded');
      return this;
    },

    collapse: function() {
      // adds a class to collapse the control
      L.DomUtil.removeClass(this._container, 'leaflet-map-legend-expanded');
      return this;
    }
  });

  L.control.legend = function(options) {
    return new L.Control.Legend(options);
  }

  return Legend;
}, window));
