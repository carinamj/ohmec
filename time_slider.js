let holdThis;

L.Control.TimeLineSlider = L.Control.extend({
  options: {
    position: 'bottomleft',
    timelineMin: 0,
    timelineMax: 2021,
    timelineStart: 1776,
    sliderWidth: "750px",
  },

  initialize: function (options) {
    L.setOptions(this, options);
  },

  onAdd: function() {
    this.sheet = document.createElement('style');
    document.body.appendChild(this.sheet);

    this.sliderContainer = L.DomUtil.create('div', 'slider_container');

    // Prevent click events propagation to map
    L.DomEvent.disableClickPropagation(this.sliderContainer);

    // Prevent right click event propagation to map
    L.DomEvent.on(this.sliderContainer, 'slider_container', function (ev) {
      L.DomEvent.stopPropagation(ev);
    });

    // Prevent scroll events propagation to map when cursor on the div
    L.DomEvent.disableScrollPropagation(this.sliderContainer);

    // Create html elements for range input, min/max labels, and advance button
    this.sliderDiv = L.DomUtil.create('div', 'range', this.sliderContainer);
    this.sliderDiv.innerHTML =
      '<input id="rangeinputslide" type="range" min="' +
      this.options.timelineMin + 
      '" max="' +
      this.options.timelineMax +
      '" step="any" value="' +
      this.options.timelineMin +
      '"></input>';
    this.rangeObject = L.DomUtil.get(this.sliderDiv).children[0];

    this.sliderYears = L.DomUtil.create('ul', 'slider-years', this.sliderContainer);
    this.sliderYears.innerHTML = "<li>" + this.options.timelineMin + "</li><li>" + this.options.timelineMax + "</li>";


    this.advanceDiv = L.DomUtil.create('div', 'advance', this.sliderContainer);
    this.advanceDiv.innerHTML = '<input type="button" id="advButton" value="Advance"></input>';
    this.buttonObject = L.DomUtil.get(this.advanceDiv).children[0];

    holdThis = this;

    this.sheet.textContent = this.setupStartStyles();

    // When time slider gets changed, trigger updateTime function
    L.DomEvent.on(holdThis.rangeObject, "input", function() {
      holdThis.options.updateTime({value: holdThis.rangeObject.value});
    });

    // When advance/pause button gets pressed toggle advance/pause,
    // potentially "move time"

    holdThis.advanceTime = function() {
      let incrTime = (parseFloat(holdThis.options.timelineMax) - parseFloat(holdThis.options.timelineMin))/240;
      let newTime = parseFloat(holdThis.rangeObject.value) + incrTime;
      console.log("incrTime = " + incrTime + " newTime = " + newTime);
      if(newTime >= holdThis.options.timelineMax) {
        newTime = holdThis.options.timelineMax;
        clearInterval(holdThis.intervalFunc);
        holdThis.buttonObject.value = "Advance";
      }
      holdThis.rangeObject.value = newTime;
      holdThis.options.updateTime({value: holdThis.rangeObject.value});
    }

    L.DomEvent.on(holdThis.buttonObject, "click", function() {
      if(holdThis.buttonObject.value == "Advance") {
        holdThis.buttonObject.value = "Stop";
        holdThis.intervalFunc = setInterval(holdThis.advanceTime, 250);
      } else {
        holdThis.buttonObject.value = "Advance";
        clearInterval(holdThis.intervalFunc);
      }
    });

    // Initialize input change at start
    let inputEvent = new Event('input');
    this.rangeObject.dispatchEvent(inputEvent);
    this.rangeObject.value = parseFloat(holdThis.options.timelineStart);
    holdThis.options.updateTime({value: holdThis.rangeObject.value});

    return this.sliderContainer;
  },

  onRemove: function() {
    // remove control html element
    L.DomUtil.remove(this.sliderContainer);
  },
  
  setupStartStyles: function() {
    let rangeWidth = (parseFloat(holdThis.options.sliderWidth) - 15) + "px";
    let labelMargin = (parseFloat(holdThis.options.sliderWidth)/2 - 10) + "px";
    let slider_style = `
      .slider_container { 
        background-color: rgba(4,112,255,0.2);
        padding: 5px 15px 5px 15px;
        border-radius: 5px;
        border-style: solid;
        border-color: #0470ff;
        border-width: 1px;
        box-shadow: 5px 5px 5px #888;
      }
      .range {
        position: relative;
        left: -6px;
        height: 5px;
        width: ${holdThis.options.sliderWidth};
      }
      .advance {
        position: relative;
        left: -40px;
        height: 30px;
        width: ${holdThis.options.sliderWidth};
      }
      .range input {
        width: 100%;
        position: absolute;
      }
      .slider-years {
        margin: 10px -${labelMargin};
        padding: 0;
        list-style: none;
        color: #333;
      }
      .slider-years li {
        width: ${rangeWidth};
        position: relative;
        float: left;
        text-align: center;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
      }
      #advButton {
        position: relative;
        top: -10px;
        left: 50%;
        width: 80px;
        padding: 4px 0px;
        margin: -10px 0px -20px 0px;
        font-family: "Tahoma";
        font-size: 14px;
        color: #e0e0ff;
        text-decoration: none;
        background-color: #0470ff;
        border: none;
        align-items: center;
        border-radius: 6px;
      }
    `;
    return slider_style;
  },
})

L.control.timelineSlider = function(options) {
  return new L.Control.TimeLineSlider(options);
}
