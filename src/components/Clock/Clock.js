import React from "react";
import "./Clock.css";
import actions from "./actions";
import nouns from "./nouns";

class Clock extends React.Component {
  constructor(props) {
    super(props);
    // Define constants
    this.backgroundPercOffset = 10;
    this.textPercOffset = 15;
    this.currentTimeLinePercOffset = 0;
    this.updateIntervalSeconds = 1;
    this.lineStrokeWidth = 6;
    this.colorStrings = [
      "#efb5e8",
      "#82c6ff",
      "#ffd67c",
      "#ff9265",
      "#b8acf3",
      "#4eecc6"
    ];
    // Define initial state
    this.state = {
      boundingClientRect: null,
      width: null,
      height: null,
      intervalId: null,
      currentTime: Date.now(),
      cursorAngle: null,
      nextColor: this.colorStrings[
        Math.floor(Math.random() * this.colorStrings.length)
      ],
      usedActions: [],
      usedNouns: []
    };
    // Bind methods to this
    this.update = this.update.bind(this);
    this.onMouseOver = this.onMouseOver.bind(this);
  }

  componentDidMount() {
    // Copy old state
    let newState = { ...this.state };
    // Store the x and y offset
    newState.boundingClientRect = this.divElement.getBoundingClientRect();
    // Store div width and height
    newState.width = this.divElement.clientWidth;
    newState.height = this.divElement.clientHeight;
    // Set interval for updating SVG due to time and store id
    const intervalId = setInterval(
      this.update,
      this.updateIntervalSeconds * 1000
    );
    newState.intervalId = intervalId;
    // Set next color
    newState.nextColor = this.colorStrings[
      Math.floor(Math.random() * this.colorStrings.length)
    ];
    // Update state
    this.setState(newState);
  }

  componentWillUnmount() {
    // Clear interval
    clearInterval(this.state.intervalId);
  }

  getUnusedColor() {
    // Copy color array
    let colorStrings = [...this.colorStrings];
    // Remove any colors that are already being used
    for (let activity of this.props.activities) {
      const i = colorStrings.indexOf(activity.colorString);
      if (i !== -1) colorStrings.splice(i, 1);
    }
    // Select random color from remaining colors
    return colorStrings.length > 0
      ? colorStrings[Math.floor(Math.random() * colorStrings.length)]
      : null;
  }

  generateDescription() {
    // Copy state to alter
    let newState = { ...this.state };
    // Get a random unused action (if possible)
    let action;
    if (this.state.usedActions.length === actions.length) {
      action = actions[Math.floor(Math.random() * actions.length)];
    } else {
      while (true) {
        action = actions[Math.floor(Math.random() * actions.length)];
        if (!this.state.usedActions.includes(action)) break;
      }
      newState.usedActions.push(action);
    }
    // Get a random unused noun (if possible)
    let noun;
    if (this.state.usedNouns.length === nouns.length) {
      noun = nouns[Math.floor(Math.random() * nouns.length)];
    } else {
      while (true) {
        noun = nouns[Math.floor(Math.random() * nouns.length)];
        if (!this.state.usedNouns.includes(noun)) break;
      }
      newState.usedNouns.push(noun);
    }
    // Update state
    this.setState(newState);
    // Return description
    return action + " " + noun;
  }

  polarToCartesian(cx, cy, r, angleDegrees) {
    const angleRadians = ((angleDegrees - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(angleRadians),
      y: cy + r * Math.sin(angleRadians)
    };
  }

  cartesianToPolar(cx, cy, x, y) {
    // Calculate angle in radians
    const angleRadians = Math.atan((y - cy) / (x - cx));
    // Convert to degrees
    let angleDegrees = angleRadians * (180.0 / Math.PI);
    // Apply quadrant rule
    if (x - cx >= 0) angleDegrees += 90;
    else angleDegrees += 270;
    return angleDegrees;
  }

  generateSegmentSVGPathD(r, startAngleDegrees, endAngleDegrees) {
    const cx = this.state.width / 2.0;
    const cy = this.state.height / 2.0;
    const start = this.polarToCartesian(cx, cy, r, endAngleDegrees);
    const end = this.polarToCartesian(cx, cy, r, startAngleDegrees);
    const difference = endAngleDegrees - startAngleDegrees;
    const largeArcFlag =
      (difference > 0 && difference < 180) || difference < -180 ? "0" : "1";
    return [
      "M",
      start.x,
      start.y,
      "A",
      r,
      r,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
      "L",
      cx,
      cy,
      "Z"
    ].join(" ");
  }

  generateHourSVGTexts() {
    // Compute centre coordinate
    const cx = this.state.width / 2.0;
    const cy = this.state.height / 2.0;
    // Create array of hours to generate
    const hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    // Return text elements in a react fragment
    return (
      <React.Fragment>
        {hours.map((item, index) => {
          // Calculate position of text
          const position = this.polarToCartesian(
            cx,
            cy,
            (this.state.width / 2.0) * ((100.0 - this.textPercOffset) / 100.0),
            item * 30
          );
          return (
            <text
              key={index}
              x={position.x}
              y={position.y}
              dominantBaseline="middle"
              textAnchor="middle"
              fill="white"
              fontFamily="AvenirHeavy"
            >
              {item}
            </text>
          );
        })}
      </React.Fragment>
    );
  }

  generateSVGLine(angleDegrees, colorString) {
    // Compute centre coordinate
    const cx = this.state.width / 2.0;
    const cy = this.state.height / 2.0;
    // Compute the length of the line
    const length =
      (this.state.width / 2.0) *
        ((100.0 + this.currentTimeLinePercOffset) / 100.0) -
      this.lineStrokeWidth / 2.0;
    // Calculate the end of the line using the length as radius
    const end = this.polarToCartesian(cx, cy, length, angleDegrees);
    // Return the line
    return (
      <line
        x1={cx}
        y1={cy}
        x2={end.x}
        y2={end.y}
        stroke={colorString}
        strokeWidth={this.lineStrokeWidth}
        strokeLinecap="round"
      ></line>
    );
  }

  update() {
    // Copy state
    let newState = { ...this.state };
    // Update current time
    newState.currentTime = Date.now();
    // Update state
    this.setState(newState);
  }

  tsToAngle(ts) {
    // Compute the milliseconds since start of day
    let timeMs = ts % (1000 * 60 * 60 * 24);
    // If greater than 12 hours, subtract 12 hours (convert to 12 hour time)
    timeMs =
      timeMs > 1000 * 60 * 60 * 12 ? timeMs - 1000 * 60 * 60 * 12 : timeMs;
    // Convert to 360 degrees and return
    return (timeMs / (1000 * 60 * 60 * 12)) * 360;
  }

  angleToFutureTs(angleDegrees) {
    // Get current ts
    const currentTs = Date.now();
    // Convert to angle
    const currentTsAngle = this.tsToAngle(currentTs);
    // Calculate the forward angle difference
    let forwardAngleDiff = 0;
    if (angleDegrees > currentTsAngle) {
      forwardAngleDiff = angleDegrees - currentTsAngle;
    } else if (angleDegrees < currentTsAngle) {
      forwardAngleDiff = 360 - currentTsAngle + angleDegrees;
    }
    // Convert angle difference to time difference
    const forwardMsDiff = (forwardAngleDiff / 360.0) * 1000 * 60 * 60 * 12;
    // Return the current ts + time difference
    return currentTs + forwardMsDiff;
  }

  generateActivitySVGs() {
    // Return path elements in a react fragment
    return (
      <React.Fragment>
        {this.props.activities.map((item, index) => {
          const angleDegreesTo =
            item.timeTo != null
              ? this.tsToAngle(item.timeTo)
              : this.state.cursorAngle;
          let d = this.generateSegmentSVGPathD(
            this.state.width / 2.0,
            this.tsToAngle(item.timeFrom),
            angleDegreesTo
          );
          // Return path and line elements
          return (
            <React.Fragment key={index}>
              {this.generateSVGLine(
                this.tsToAngle(item.timeFrom),
                item.colorString
              )}
              <path d={d} fill={item.colorString}></path>
              {this.generateSVGLine(angleDegreesTo, item.colorString)}
            </React.Fragment>
          );
        })}
      </React.Fragment>
    );
  }

  onMouseOver(e) {
    // Apply component offset to centre coordinates
    const cx = this.state.boundingClientRect.left + this.state.width / 2.0;
    const cy = this.state.boundingClientRect.top + this.state.height / 2.0;
    // Calculate the angle mouse is currently over
    const angleDegrees = this.cartesianToPolar(cx, cy, e.clientX, e.clientY);
    // Check whether angle is free space
    let inFreeSpace = true;
    for (let activity of this.props.activities) {
      // Don't count activity if it doesn't have a time to selected yet
      if (activity.timeTo == null) continue;
      // Convert the times to angles
      const start = this.tsToAngle(activity.timeFrom);
      const end = this.tsToAngle(activity.timeTo);
      if (end < start) {
        if (
          (angleDegrees >= start && angleDegrees <= 360) ||
          angleDegrees <= end
        ) {
          inFreeSpace = false;
          break;
        }
      } else if (angleDegrees >= start && angleDegrees <= end) {
        inFreeSpace = false;
        break;
      }
    }
    // Update cursor angle and whether in free space in state
    let newState = { ...this.state };
    newState.cursorAngle = angleDegrees;
    newState.inFreeSpace = inFreeSpace;
    this.setState(newState);
  }

  onMouseClick(e) {
    // Check whether currently choosing a stop time for an activity
    let selectingTimeTo = false;
    for (let i = 0; i < this.props.activities.length; i++) {
      if (this.props.activities[i].timeTo == null) {
        let newActivities = [...this.props.activities];
        // Set the time to as the cursor angle's time
        newActivities[i].timeTo = this.angleToFutureTs(this.state.cursorAngle);
        // Update parents activities array
        this.props.setActivities(newActivities);
        // Update next color
        let newState = { ...this.state };
        newState.nextColor = this.getUnusedColor();
        this.setState(newState);
        // Update variable and exit loop
        selectingTimeTo = true;
        break;
      }
    }
    // Check whether angle is free space (and not selecting time to)
    if (this.state.inFreeSpace && !selectingTimeTo) {
      // Add new activity to parent array
      let newActivites = [...this.props.activities];
      newActivites.push({
        timeFrom: this.angleToFutureTs(this.state.cursorAngle),
        timeTo: null,
        description: this.generateDescription(),
        colorString: this.state.nextColor
      });
      this.props.setActivities(newActivites);
    }
  }

  render() {
    return (
      <div className="Clock" ref={divElement => (this.divElement = divElement)}>
        {this.state.width != null && this.state.height != null && (
          <svg
            onMouseMove={e => this.onMouseOver(e)}
            onClick={e => this.onMouseClick(e)}
          >
            <circle
              className="donut-background"
              cx="50%"
              cy="50%"
              r={this.state.width / 2.0 - this.backgroundPercOffset}
            />
            {this.generateActivitySVGs()}
            {this.state.cursorAngle != null &&
              this.state.inFreeSpace &&
              this.generateSVGLine(
                this.state.cursorAngle,
                this.state.nextColor
              )}
            {this.generateSVGLine(
              this.tsToAngle(this.state.currentTime),
              "#D2D2D2"
            )}
            <circle className="donut-hole" cx="50%" cy="50%" r="20%" />
            {this.generateHourSVGTexts()}
          </svg>
        )}
      </div>
    );
  }
}

export default Clock;
