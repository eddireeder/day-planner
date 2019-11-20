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
      width: 0,
      height: 0,
      intervalId: null,
      currentTime: Date.now()
    };
    // Bind methods to this
    this.update = this.update.bind(this);
  }

  componentDidMount() {
    // Copy old state
    let newState = { ...this.state };
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

  generateSegmentPath(r, startAngleDegrees, endAngleDegrees, colorString) {
    const cx = this.state.width / 2.0;
    const cy = this.state.height / 2.0;
    const start = this.polarToCartesian(cx, cy, r, endAngleDegrees);
    const end = this.polarToCartesian(cx, cy, r, startAngleDegrees);
    const largeArcFlag = endAngleDegrees - startAngleDegrees <= 180 ? "0" : "1";
    const d = [
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
    return <path d={d} fill={colorString}></path>;
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

  render() {
    return (
      <div className="Clock" ref={divElement => (this.divElement = divElement)}>
        <svg>
          <circle
            className="donut-background"
            cx="50%"
            cy="50%"
            r={this.state.width / 2.0 - this.backgroundPercOffset}
          />
          {this.generateSegmentPath(this.state.width / 2.0, 32, 90, "#5CEDCA")}
          {this.generateSegmentPath(this.state.width / 2.0, 97, 126, "#FFB1E0")}
          {this.generateSegmentPath(
            this.state.width / 2.0,
            143,
            199,
            "#FF9E9E"
          )}
          {this.generateLine(this.tsToAngle(this.state.currentTime))}
          <circle className="donut-hole" cx="50%" cy="50%" r="20%" />
          {this.generateHourTexts()}
        </svg>
      </div>
    );
  }
}

export default Clock;
