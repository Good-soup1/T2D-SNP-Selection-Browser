// CHARTS.js FILE CONTENTS: Loads the Chart.js library.

import { Chart } from "https://cdn.jsdelivr.net/npm/chart.js";


// Renders the Selection Charts on pop page - Plots selection statistics on a line chart????? Is this being used anywhere?
export function renderSelectionChart(data) {
    const ctx = document.getElementById("selectionPlot").getContext("2d");
    
    new Chart(ctx, {
        type: "line",
        data: {
            labels: data.labels,
            datasets: [{
                label: "Positive Selection",
                data: data.values,
                borderColor: "blue",
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: "Genomic Region" } },
                y: { title: { display: true, text: "Selection Statistic" } }
            }
        }
    });
}