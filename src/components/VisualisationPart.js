import React from 'react';
import { csv } from 'd3-request';
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
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    csv('./data/Population_Worldwide.csv', (error, data) => {
      if (error) {
        this.setState({ loadError: true });
      }
    });
  }

  render() {
    const visual = <div>
                      <h2 style={styles.h2}>Dashboard</h2>
                      <svg width="300px" height="150px">
                        <rect x="20" y="20" width="20px" height="20" rx="5" ry="5" />
                        <rect x="60" y="20" width="20px" height="20" rx="5" ry="5" />
                        <rect x="100" y="20" width="20px" height="20" rx="5" ry="5"/>
                      </svg>
                      <Sunburst/>
                  </div>;
    return visual;
  }
}
