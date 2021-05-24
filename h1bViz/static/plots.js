import {openPlots} from './auxiliary.js';

function resetPlots() {
    if(document.getElementById("plot1") !== null)   {// if the first plot exists, then by default exists the second too
        document.getElementById("plot1").remove();
        document.getElementById("plot2").remove();
    }
    var canvas1 = document.createElement("canvas");
    canvas1.setAttribute("id", "plot1");
    var canvas2 = document.createElement("canvas");
    canvas2.setAttribute("id", "plot2");
    document.getElementById("filters").appendChild(canvas1);
    document.getElementById("filters").appendChild(canvas2);
}

function showPlots(petitionsByYearObject, caseStatusObject) {
    resetPlots();
    plotPetitionsByYear(petitionsByYearObject, "plot1");
    plotCaseStatus(caseStatusObject, "plot2")
}

function plotPetitionsByYear(dataObject, canvasId){
    let labels = new Array();
    let data = new Array();

    for (const [key, value] of Object.entries(dataObject)) {
        labels.push(key);
        data.push(value);
    }
    var ctx = document.getElementById(canvasId).getContext("2d");

    var petitionsByYearChart = new Chart(ctx, {
        type: 'line',
        data: {
        labels: labels,
        datasets: [{
            data: data,
            label: "N petitions",
            borderColor: "#3e95cd",
            fill: true
          }]
      },
      options: {
            title: {
                display: true,
                text: 'Number of petitions by year'
            }
        }
    });
}

function plotCaseStatus(dataObject, canvasId) {
    let labels = new Array();
    let data = new Array();

    for (const [key, value] of Object.entries(dataObject)) {
        labels.push(key);
        data.push(value);
    }

    var caseStatusChart = new Chart(document.getElementById(canvasId).getContext("2d"), {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            label: "Number of petitions",
            backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850"],
            data: data
          }]
        },
        options: {
          title: {
            display: true,
            text: 'Number of petitions by case status'
          }
        }
    });
}

export {showPlots, resetPlots};

//TODO: depending on parameters (number of case statuses) show plots:
//TODO:     - up to 5 companies with most number of petitions(bar chart)
//TODO:     - prevailing wage with median(bar chart with line for median)