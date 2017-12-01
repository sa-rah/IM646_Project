import React from 'react';
import ReactDOM from 'react-dom';

class HelloMessage extends React.Component {

  render() {
    let myvariable = 'godzilla';

    return (
      <div>
        Hello {myvariable}.
      </div>
    );
  }
}
