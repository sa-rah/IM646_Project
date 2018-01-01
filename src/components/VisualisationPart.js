import React from 'react';
import D3 from 'd3';
import Sunburst from './Sunburst';

const styles = {
  head: {
    width: '100%',
    backgroundColor: '#27c79a',
    padding: '16px',
    height: '70px',
  },
  h2: {
    float: 'left',
    lineHeight: 1,
    margin: 10,
    textTransform: 'lowercase',
    letterSpacing: '0.1em',
  },
  span: {
    color: '#333e50',
    fontWeight: 'bold',
  },
};

export default class VisualisationPart extends React.Component {
  componentWillMount() {

  }

  render() {
    const visual = <div>
                      <h2 style={styles.h2}>Dashboard</h2>
                      <Sunburst/>
                  </div>;
    return visual;
  }
}
