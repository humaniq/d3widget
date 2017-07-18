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



    this.tickFormat = function (date) {
        if(date.getDay() && date.getDate() !== 1) return d3.timeFormat("%d.%m")(date);
        if(date.getDate() !== 1) return d3.timeFormat("%d.%m")(date);
        if(date.getMonth()) return d3.timeFormat("%B")(date);
        return d3.timeFormat("%Y")(date);
    }

    this.margin = {
      top: +this.props.height / 7,
      right: 0,
      bottom: 0,
      left: 0,
    };


    this.width = +this.props.width;
    this.height = +this.props.height - this.margin.top;
    //this.height = (this.width / this.props.aspectRatio) - this.margin.top - this.margin.bottom;



    this.svg = d3.select(this.container)
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);


    if (!this.props.isSmall) {
      this.svg.append("rect")
        .attr("width", this.width)  
        .attr("height", this.height + this.margin.top) 
        .style("fill", "#F1F6FA");
    }


    // Define the div for the tooltip
    // this.tooltip = d3.select(this.container).append('div')
    //   .attr('class', 'tooltip')
    //   .style('opacity', 0);

    if (!this.props.isSmall) {
      this.tooltip = d3.select(this.container).append('div')
        .attr('class', 'm-tooltip__wrapper')
        .style('opacity', 0)
      this.tooltip  
          .append('div')
          .attr('class', 'm-tooltip__root m-tooltip__root_type_top')
    }

    this.xScale = d3.scaleTime()
      .range([0, this.width]);

    this.yScale = d3.scaleLinear()
      .range([this.height, 0]);

    this.focus = this.svg.append('g')
      .attr("class", "focus")
      .attr('transform', "translate(" + [this.margin.left, this.margin.top] + ")");




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

    // var defs = this.svg.append("defs");

    // var filter = defs.append("filter")
    //     .attr("id", "linechart-drop-shadow")
    //     .attr("width", "130%")
    //     .attr("height", "130%");

    // filter.append("feGaussianBlur")
    //     .attr("in", "SourceAlpha")
    //     .attr("stdDeviation", 3);


    // filter.append("feOffset")
    //     .attr("dx", 1)
    //     .attr("dy", 1)
    //     .attr("result", "offsetBlur");

    // var feComponentTransfer = filter.append("feComponentTransfer");
    //     feComponentTransfer.append("feFuncA")
    //         .attr("type","linear") 
    //         .attr("slope",0.2);

    // var feMerge = filter.append("feMerge");
    //     feMerge.append("feMergeNode");
    //     feMerge.append("feMergeNode")
    //            .attr("in", "SourceGraphic");


    // this.div = d3.select(this.container).append("div")   
    //     .attr("class", "linechartTooltip svgTooltip")               
    //     .style("opacity", 0);


    // this.svgTooltip = this.svg.append("g")
    //   .attr("class","linechartTooltip")
    //   .style("pointer-events", "none")
    //   .style("opacity",0)


    // this.svgTooltip.append("path")
    //   .attr("d", "M8 46 L10 48 L32 48 L40 56 L48 48 L54 48 L54 48 L56 46 L56 14 L54 12 L54 12 L54 12 L54 12 L54 12 L10 12 L10 12 L8 14 L8 44 L8 46 Z")
    //   .attr("fill", "white")
    //   .attr("stroke","lightgrey")
    //   .style("filter", "url(#linechart-drop-shadow)")
    //   .attr("transform", "translate(0, -65)")

    // this.svgTooltip.append("text")
    //   .attr("class","tooltipText")
    //   .text("%25")
    //   .style("font-family", "sans-serif")
    //   .style("font-size", 13)
    //   .attr("transform", "translate(18, -28)")


    this.draw(this.props);
  }

  shouldComponentUpdate(nextProps) {
    return !isEqual(this.props, nextProps);
  }

  componentWillUpdate(nextProps) {
    this.draw(nextProps);
  }

  draw(props) {

    const component = this;

    const t = d3.transition()
                .duration(500);

    const parse = d3.timeParse('%Y-%m-%d');
    const format = d3.timeFormat('%d.%m.%Y');

    let data = props.data.map(function (d) {
      return {
        date: parse(d.date),
        value: +d.value
      }
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

    const formatY = (value) => {
      if (value < 1) {
        return value.toFixed(2);
      } else if (value < 10 && value % 1 === 0) {
        return value.toFixed(0);
      }
      return d3.format('.2s')(value);
    };

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
    if (!this.props.isSmall) {
      let circles = this.circlegroup.selectAll('.dot')
        .data(data)

      circles.exit().remove();
      
      let circlesEnter = circles.enter().append('circle')
        .attr('class', 'dot')
        .attr('cx', d => component.xScale(d.date))
        .attr('cy', d => component.yScale(d.value))
        .attr('r', () => 4)
        .style("opacity", 0);


      circles.merge(circlesEnter)
              .transition(t)
              .attr('cx', d => component.xScale(d.date))
              .attr('cy', d => component.yScale(d.value));

      circlesEnter
        .on('mouseover', function (d) {
          component.tooltip.select(".m-tooltip__root")
            .html(`<b>Value: </b>${formatY(d.value)}<br/><b>Date: </b>${format(d.date)}`)
   
         component.tooltip   
          .style('left', `${d3.select(this).attr('cx') - 96}px`)
            .style('top', `${+d3.select(this).attr('cy') - 25}px`)
            .transition()
            .duration(200)
            .style('opacity', 1);

          d3.select(this).attr('r', 4)
            .style('opacity', 1);
        })
        .on('mouseout', function () {
          component.tooltip
            .transition()
            .duration(500)
            .style('opacity', 0);

          d3.select(this).attr('r', 4)
            .style('opacity', 0);

        });

    // circlesEnter.on("mouseover", function (d) {

    //   //console.log(this.cx)
    //   var x = +d3.select(this).attr("cx") - 38;
    //   var y = +d3.select(this).attr("cy") + component.margin.top;

    //   // d3.select(this).attr("r", "7px")
    // 	//               .style("fill", (d,i) => component.color(d.name));

    //   d3.select(component.container).select(".linechartTooltip")
    //       .attr("transform","translate(" + [x, y] + ")")
    //       .transition()     
    //       .style("opacity", 1)

    //   d3.select(component.container).select(".linechartTooltip text")
    //     .text( "%" + Math.round(d.value))    
    //       // .text(d.name)  
    //       // .style("left", (d3.event.pageX) + "px")     
    //       // .style("top", (d3.event.pageY - 28) + "px")
    // })

    // circlesEnter.on("mouseout", function (d) {

    //   d3.select(this).attr("r", "5px")
    // 	              .style("fill", (d,i) => "white");
                    
    //   d3.select(component.container).select(".linechartTooltip") 
    //     .transition() 
    //     .style("opacity", 0)

    // })


    }

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
