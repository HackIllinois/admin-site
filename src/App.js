import React, { Component } from 'react';

// styles uses grid to have 2 columns, I think personally it looks better and easier to read
//But again, what do I know what we need
import './styles.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <h1 className="adminHeader">Admin Portal</h1>

        <div className="divList grid">
          <div className="divListElement">
            <div>
              This is the Admin Page of Hack Illinois 2019. This page is in progress.
            </div>
            <span className="login">
              <div>
                <input placeholder="User Name" />
              </div>
              <div>
                <input placeholder="Password" />
              </div>
            </span>

          </div>

          <div className="divListElement">
            Feb 22-24, 2019<br/>
            Maybe announcements here or something
          </div>

          <div className="divListElement">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Non arcu risus quis varius quam quisque id diam. Cras fermentum odio eu feugiat pretium. Id consectetur purus ut faucibus pulvinar elementum. Morbi tristique senectus et netus et malesuada fames ac. Tristique risus nec feugiat in fermentum posuere urna. Elementum sagittis vitae et leo duis ut. In fermentum et sollicitudin ac orci phasellus egestas tellus rutrum.
          </div>

        </div>
      </div>
    );
  }
}

export default App;
