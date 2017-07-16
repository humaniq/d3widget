import React, { Component } from 'react';
import * as d3 from 'd3';
//import sizeMe from 'react-sizeme';
import isEqual from 'lodash.isequal';
import './ChartStyle.css';


class Chart extends Component {

  constructor(props) {
    super(props);
    this.draw = this.draw.bind(this);
    this.saveContainer = this.saveContainer.bind(this);
  }

  componentDidMount() {

    this.margin = {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    };

    this.tickFormat = function (date) {
        if(date.getDay() && date.getDate() !== 1) return d3.timeFormat("%d.%m")(date);
        if(date.getDate() !== 1) return d3.timeFormat("%d.%m")(date);
        if(date.getMonth()) return d3.timeFormat("%B")(date);
        return d3.timeFormat("%Y")(date);
    }

    

    this.width = +this.props.width;
    this.height = +this.props.height;
    //this.height = (this.width / this.props.aspectRatio) - this.margin.top - this.margin.bottom;

    this.svg = d3.select(this.container)
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);

    // Define the div for the tooltip
    this.tooltip = d3.select(this.container).append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    this.xScale = d3.scaleTime()
      .range([0, this.width]);

    this.yScale = d3.scaleLinear()
      .range([this.height, 0]);

    this.focus = this.svg.append('g')
      .attr("class", "focus")
      .attr('transform', "translate(" + [this.margin.left, this.margin.top] + ")");

    if (!this.props.isSmall) {
      this.focus.append("rect")
        .attr("width", this.width)  
        .attr("height", this.height) 
        .style("fill", "#F1F6FA");
    }


    let axisGroup = this.svg.append("g")
                              .attr("transform",
                                    "translate(" + [this.margin.left, this.margin.top] + ")");    

    axisGroup.append("g")
      .attr("class", "xAxis")
      .attr("transform", "translate(0," + this.height + ")");

    axisGroup.append("g")
      .attr("class", "yAxis");

    axisGroup.append('g')
      .attr('class', 'grid')
      .style("pointer-events", "none")


    this.focus
      .append('path')
      .attr('class', 'path')

    this.focus
      .append('path')
      .attr('class', 'line')

    this.circlegroup = this.focus.append('g');

    this.draw(this.props);
  }

  shouldComponentUpdate(nextProps) {
    return !isEqual(this.props, nextProps);
  }

  componentWillUpdate(nextProps) {
    this.draw(nextProps);
  }

  draw(props) {

    let data = props.data;

    

    const component = this;

    const t = d3.transition()
                .duration(500);

    const parse = d3.timeParse('%Y-%m-%d');
    //const format = d3.timeFormat('%d.%m.%Y');

    data.forEach(function (d) {
      d.date = parse(d.date);
      d.value = +d.value;
    });

    const rangeXdata = d3.extent(data, d => d.date);

    // const domainX = (props.startDate && props.endDate) ? [
    //   new Date(Math.min.apply(null, [props.startDate, rangeXdata[0]])),
    //   new Date(Math.max.apply(null, [props.endDate, rangeXdata[1]])),
    // ] : rangeXdata;

    const domainX = rangeXdata;


    this.xScale.domain(domainX);

    // var oneDay = 24*60*60*1000; 
    // var firstDate = domainX[0];
    // var secondDate = domainX[1];

    //var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));

    const domainY = [0, d3.max(data.map(d => d.value))];

    this.yScale.domain(domainY);

    // const xAxis = d3.axisBottom(component.xScale)
    //                     .ticks(diffDays < 10 ? diffDays : null)
    //                     .tickFormat(this.tickFormat)

    // this.svg.select(".xAxis")
    //           .call(xAxis)
    //           .selectAll('text')
    //           .style("font-weight",function () {
    //                   return this.textContent.split("")[2] === "." ? "" : "bold";
    //           })
    //           .attr('y', 14)
    //           .attr('x', -5)
    //           .attr('transform', 'rotate(-20)');

    // const formatY = (value) => {
    //   if (value < 1) {
    //     return value.toFixed(2);
    //   } else if (value < 10 && value % 1 === 0) {
    //     return value.toFixed(0);
    //   }
    //   return d3.format('.2s')(value);
    // };

    // const yAxis = d3.axisLeft(this.yScale)
    //   .ticks(props.xTicks)
    //   .tickFormat(formatY)

    // this.svg.select(".yAxis")
    //           .transition(t)
    //           .call(yAxis)



    // this.svg.select(".grid")
    //           .transition(t)
    //           .call(
    //             d3.axisLeft(this.yScale)
    //               .ticks(props.xTicks)
    //               .tickSize(-this.width)
    //               .tickFormat(''),
    //           );


    const line = d3.line()
      .x(d => component.xScale(d.date))
      .y(d => component.yScale(d.value));

    const area = d3.area()
      .x(d => component.xScale(d.date))
      .y0(this.height)
      .y1(d => component.yScale(d.value));


    if (props.useArea) {
      this.focus.select(".path")
        .transition(t)
        .attr('d', area(data));
    }

    this.focus.select(".line")
      .transition(t)
      .attr('d', line(data));

    /* circles */ 
    // let circles = this.circlegroup.selectAll('.dot')
    //   .data(data)

    // circles.exit().remove();
    
    // let circlesEnter = circles.enter().append('circle')
    //   .attr('class', 'dot')
    //   .attr('cx', d => component.xScale(d.date))
    //   .attr('cy', d => component.yScale(d.value))
    //   .attr('r', () => 4);


    // circles.merge(circlesEnter)
    //         .transition(t)
    //         .attr('cx', d => component.xScale(d.date))
    //         .attr('cy', d => component.yScale(d.value));

    // circlesEnter
    //   .on('mouseover', function (d) {
    //     component.tooltip
    //       .html(`${format(d.date)}<br/><b>${component.props.title}: </b>${formatY(d.value)}`)
    //       .style('left', `${d3.select(this).attr('cx')}px`)
    //       .style('top', `${d3.select(this).attr('cy')}px`)
    //       .transition()
    //       .duration(200)
    //       .style('opacity', 0.9);
    //     d3.select(this).attr('r', 6);
    //   })
    //   .on('mouseout', function () {
    //     component.tooltip
    //       .transition()
    //       .duration(500)
    //       .style('opacity', 0);
    //     d3.select(this).attr('r', 4);
    //   });

  }

  saveContainer(container) {
    this.container = container;
  }

  render() {
    return (
      <div ref={this.saveContainer} />
    );
  }

}

Chart.defaultProps = {
  isSmall: false,
  xTicks: 5,
  aspectRatio: 2.36,
  upperBorder: 1,
  useArea: true,
  title: '',
};
// { monitorHeight: true }
//export default sizeMe()(Chart);
export default Chart;
