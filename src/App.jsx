import React from 'react';
import VisualisationPart from './components/VisualisationPart';

export default class App extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
  }

  render() {
    const visual = <div>
        <h1>Humans and livestock - Visualisation</h1>
        <VisualisationPart />
    </div>;
    return visual;
  }
}
