import React from "react";
import "./List.css";

class List extends React.Component {
  render() {
    // Fill list with either activity descriptions or helper messages
    let listContent;
    if (this.props.activities.length > 0) {
      if (
        this.props.activities.length === 1 &&
        this.props.activities[0].timeTo == null
      ) {
        listContent = <div className="helper">Click to select an end time</div>;
      } else {
        listContent = (
          <React.Fragment>
            {this.props.activities.map((value, index) => {
              if (value.description != null) {
                return (
                  <div
                    key={index}
                    className="description"
                    style={{ backgroundColor: value.colorString }}
                    contentEditable="true"
                  >
                    {value.description}
                  </div>
                );
              }
              return null;
            })}
          </React.Fragment>
        );
      }
    } else {
      listContent = <div className="helper">Click to select a start time</div>;
    }
    return <div className="List">{listContent}</div>;
  }
}

export default List;
