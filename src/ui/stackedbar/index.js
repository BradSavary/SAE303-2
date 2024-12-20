import {Lycees} from "../../data/data-lycees.js";


import anychart from 'anychart';

let stackedbar = {
  render: async function(){
    anychart.onDocumentReady(async function () {
      // set chart theme
      anychart.theme('lightGlamour');
      
      let limit = document.querySelector("#stackedbarlimit").value;

      function updateChart(graphData) {
        var dataSet = anychart.data.set(graphData);
        let seriesData = [];
        for (let i = 1; i <= graphCategories.length; i++) {
          seriesData.push(dataSet.mapAs({ x: 0, value: i }));
        }
        
        chart.removeAllSeries();
        
        for (let i = 0; i < seriesData.length; i++) {
          series = chart.bar(seriesData[i]);
          setupSeries(series, graphCategories[i]);
        }
        
        chart.draw();
      }

      document.querySelector("#stackedbarlimit").addEventListener("change", async function(event){
        limit = event.target.value;
        const graphData = await Lycees.fetchGraph(limit);
        updateChart(graphData);
      });

      // fetch data for the graph
      const graphData = await Lycees.fetchGraph(limit);
      const graphCategories = await Lycees.fetchGraphCategory();
      
      var dataSet = anychart.data.set(graphData);
      let seriesData = [];
      for (let i = 1; i <= graphCategories.length; i++) {
        seriesData.push(dataSet.mapAs({ x: 0, value: i }));
      }
      
      // create bar chart
      var chart = anychart.bar();
      
      // turn on chart animation
      chart.animation(true);
      
      chart.padding([10, 40, 5, 20]);
      
      // set chart title text settings
      chart.title('Nombre et type de candidature par lycée');
      
      // set scale minimum
      chart.yScale().minimum(1);
      
      // force chart to stack values by Y scale.
      chart.yScale().stackMode('value');
      chart.yAxis().labels().format('{%Value}{groupsSeparator: }');
      
      // set titles for axes
      chart.xAxis().title('Départements');
      chart.yAxis().title('Candidatures');
      
      // helper function to setup label settings for all series
      var setupSeries = function (series, name) {
        series.name(name);
        series.stroke('3 #fff 1');
        series.hovered().stroke('3 #fff 1');
        series.width('100%'); // Increase the bar thickness
      };
      
      // temp variable to store series instance
      var series;
      
      for (let i = 0; i < seriesData.length; i++) {
        series = chart.bar(seriesData[i]);
        setupSeries(series, graphCategories[i]);
      }
      
      // turn on legend
      chart.legend().enabled(true).fontSize(13).padding([0, 0, 5, 0]);
      
      chart.interactivity().hoverMode('by-x');
      chart.tooltip().valuePrefix('').displayMode('union');
      
      // set container id for the chart
      chart.container('stackedbar');
      
      // initiate chart drawing
      chart.draw();
    });
  }
};

export {stackedbar};