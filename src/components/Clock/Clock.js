import React from "react";
import "./Clock.css";

class Clock extends React.Component {
  constructor(props) {
    super(props);
    // Define constants
    this.backgroundPercOffset = 10;
    this.textPercOffset = 15;
    this.currentTimeLinePercOffset = 0;
    this.updateIntervalSeconds = 1;
    // Define initial state
    this.state = {
      boundingClientRect: null,
      width: null,
      height: null,
      intervalId: null,
      currentTime: Date.now(),
      activities: [
        {
          timeFrom: 1574280000000,
          timeTo: 1574297400000,
          description: null,
          colorString: "#FF9E9E"
        }
      ],
      cursorAngle: null
    };
    // Bind methods to this
    this.update = this.update.bind(this);
    this.onMouseOverFreeSpace = this.onMouseOverFreeSpace.bind(this);
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
    // Update state
    this.setState(newState);
  }

  componentWillUnmount() {
    // Clear interval
    clearInterval(this.state.intervalId);
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
    if (x - cx > 0) angleDegrees += 90;
    else angleDegrees += 270;
    return angleDegrees;
  }

  generateSegmentPathD(r, startAngleDegrees, endAngleDegrees) {
    const cx = this.state.width / 2.0;
    const cy = this.state.height / 2.0;
    const start = this.polarToCartesian(cx, cy, r, endAngleDegrees);
    const end = this.polarToCartesian(cx, cy, r, startAngleDegrees);
    const largeArcFlag = endAngleDegrees - startAngleDegrees <= 180 ? "0" : "1";
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

  generateHourTexts() {
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

  generateLine(angleDegrees) {
    // Compute centre coordinate
    const cx = this.state.width / 2.0;
    const cy = this.state.height / 2.0;
    // Compute the length of the line
    const length =
      (this.state.width / 2.0) *
      ((100.0 + this.currentTimeLinePercOffset) / 100.0);
    // Calculate the end of the line using the length as radius
    const end = this.polarToCartesian(cx, cy, length, angleDegrees);
    // Return the line
    return (
      <line
        x1={cx}
        y1={cy}
        x2={end.x}
        y2={end.y}
        stroke="#D2D2D2"
        strokeWidth="6"
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

  generateActivitySegmentPaths() {
    // Return path elements in a react fragment
    return (
      <React.Fragment>
        {this.state.activities.map((item, index) => {
          let d = this.generateSegmentPathD(
            this.state.width / 2.0,
            this.tsToAngle(item.timeFrom),
            this.tsToAngle(item.timeTo)
          );
          // Return path element
          return <path d={d} fill={item.colorString} key={index}></path>;
        })}
      </React.Fragment>
    );
  }

  onMouseOverFreeSpace(e) {
    // Apply component offset to centre coordinates
    const cx = this.state.boundingClientRect.left + this.state.width / 2.0;
    const cy = this.state.boundingClientRect.top + this.state.height / 2.0;
    // Calculate the angle mouse is currently over
    const angleDegrees = this.cartesianToPolar(cx, cy, e.clientX, e.clientY);
    // Update cursor angle in state
    let newState = { ...this.state };
    newState.cursorAngle = angleDegrees;
    this.setState(newState);
  }

  render() {
    return (
      <div className="Clock" ref={divElement => (this.divElement = divElement)}>
        {this.state.width != null && this.state.height != null && (
          <svg>
            <circle
              className="donut-background"
              cx="50%"
              cy="50%"
              r={this.state.width / 2.0 - this.backgroundPercOffset}
              onMouseMove={e => this.onMouseOverFreeSpace(e)}
            />
            {this.generateActivitySegmentPaths()}
            {this.state.cursorAngle != null &&
              this.generateLine(this.state.cursorAngle)}
            {this.generateLine(this.tsToAngle(this.state.currentTime))}
            <circle className="donut-hole" cx="50%" cy="50%" r="20%" />
            {this.generateHourTexts()}
          </svg>
        )}
      </div>
    );
  }
}

export default Clock;
