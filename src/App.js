import React, { Component } from 'react';
import moment from 'moment';
import Chart from './Chart';


class App extends Component {
  constructor() {
    super();
    this.state = {
      chartData: this.generateChartData(),
      chartDataSmall: this.generateChartData()
    }


  }


  generateChartData() {

    return function (start, end) {
        let cur = start;
        let result = [];
        while(cur <= end) {
          result.push({
            date: cur.format('YYYY-MM-DD'),
            value: Math.random() * 1000
          });
          cur.add(1,'days')
        }
        return result;
      }(moment('2016-05-10', 'YYYY-MM-DD'), moment('2016-07-17', 'YYYY-MM-DD'));

  }



  handleTransition = () => {
    this.setState({

      chartData: this.generateChartData(),
      chartDataSmall: this.generateChartData()

    });
  }

  render() {

    return (

      <div>
        <button onClick={this.handleTransition}>test transition</button>

        <div>
          <Chart
            title="Data"
            width="680"
            height="280"
            data={this.state.chartData}
          />
        </div>

        <div>
          <Chart
            title="DataSmall"
            width="100"
            height="50"
            useArea={false}
            isSmall={true}
            data={this.state.chartDataSmall}
          />
        </div>        

      </div>      
    );


  }
}

export default App;
