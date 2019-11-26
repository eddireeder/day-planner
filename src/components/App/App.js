import React from "react";
import "./App.css";
import List from "../List/List";
import Clock from "../Clock/Clock";

class App extends React.Component {
  constructor(props) {
    super(props);
    // Define initial state
    this.state = {
      activities: []
    };
    // Bind methods to this
    this.setActivities = this.setActivities.bind(this);
  }

  setActivities(activities) {
    let newState = { ...this.state };
    newState.activities = activities;
    this.setState(newState);
  }

  render() {
    return (
      <div className="App">
        <div className="planner">
          <List activities={this.state.activities}></List>
          <Clock
            activities={this.state.activities}
            setActivities={this.setActivities}
          ></Clock>
        </div>
      </div>
    );
  }
}

export default App;
