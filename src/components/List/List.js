import React from "react";
import "./List.css";

class List extends React.Component {
  render() {
    return (
      <div className="List">
        <React.Fragment>
          {this.props.activities.map((value, index) => {
            return (
              <div
                key={index}
                className="description"
                style={{ backgroundColor: value.colorString }}
              >
                {value.description}
              </div>
            );
          })}
        </React.Fragment>
      </div>
    );
  }
}

export default List;
