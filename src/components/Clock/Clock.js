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
      height: 0
    };
  }

  componentDidMount() {
    // Update state with width and height
    let newState = { ...this.state };
    newState.width = this.divElement.clientWidth;
    newState.height = this.divElement.clientHeight;
    this.setState(newState);
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
              x={position.x}
              y={position.y}
              dominant-baseline="middle"
              text-anchor="middle"
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
        strokeWidth="4"
        strokeLinecap="round"
      ></line>
    );
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
          {this.generateLine(27)}
          <circle className="donut-hole" cx="50%" cy="50%" r="20%" />
          {this.generateHourTexts()}
        </svg>
      </div>
    );
  }
}

export default Clock;
