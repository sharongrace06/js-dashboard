
// The main function of dashboard.js is:DOM rendering only (NO state, NO logic) 

import { MONTHS } from "../utils/helpers.js";
import { getAvailableYears, totalMetrics, getEntriesByYear } from "../state/store.js";



function renderTable(year, entries){
    //1.find the correct tbody
    const tableBody = document.querySelector(`#table-${year}`);

    //2.clear existing rows
    tableBody.innerHTML = "";
    
    // 3. loop over entries
    entries.forEach(function (entry) {
        // 4. create <tr>

        const row = document.createElement("tr");

        row.innerHTML = `
        <td>${MONTHS[entry.monthIndex]}</td>
        <td>${entry.nob}</td>
        <td>${entry.hc}</td>
        <td>${entry.lc}</td>
        <td>${entry.cn}</td>
        <td class="no-print">
            <button class="no-print" data-id="${entry.id}">Delete</button>
        </td>
        `;

        // 5. append to tbody
        tableBody.appendChild(row);
        
    });    
}

function renderTotals(year, totals){
    // 1. Find the table for this year
    const tbody = document.querySelector(`#table-${year}`);
    if (!tbody) return;

    // 2️⃣ Get the actual table
    const table = tbody.closest("table")

    // 2. Get or create <tfoot>
    let tfoot = table.querySelector("tfoot");

    if(!tfoot){
        tfoot = document.createElement("tfoot");
        table.appendChild(tfoot);
    }

    // 3. Clear existing totals row

    tfoot.innerHTML = ""; 

    // 4. Create totals row
    const tr = document.createElement("tr");

    // 5. First cell: label
    const labelTd = document.createElement("td")
    labelTd.textContent = "Totals";
    tr.appendChild(labelTd);

    // 6. Metric cells (use totals object)
    const fields = [ "nob", "hc", "lc", "cn" ];

    fields.forEach(field => {
        const td = document.createElement("td");
        td.textContent = totals[field];
        tr.appendChild(td)

    });


    // 3️⃣ Empty Action column (THIS is the fix)
    const actionTd = document.createElement("td");
    actionTd.classList.add("no-print");
    tr.appendChild(actionTd);

    // 7. Append row to tfoot
    tfoot.appendChild(tr);

}

function renderBarChart(year, metrics) {
    const barChartCanvas = document.querySelector(`#bar-chart-${year}`);
  
    if (!barChartCanvas || barChartCanvas.dataset.rendered === "true") {
      return;
    }
  
    const labels = ["NOB", "HC", "LC", "CN"];
    const data = [
      metrics.nob,
      metrics.hc,
      metrics.lc,
      metrics.cn
    ];
  
    const chart = new Chart(barChartCanvas, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: `${year} - Totals`,
          data,
          backgroundColor: "#4f46e5"
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        },
      plugins:{
          tooltip: {
          enabled: false   
        },
        legend: {
          display: true
        }
      }   
    }
    });
  
    barChartCanvas._chart = chart;
    barChartCanvas.dataset.rendered = "true";
  }

function destroyBarChart(year) {
    const canvas = document.querySelector(`#bar-chart-${year}`);
  
    if (canvas && canvas._chart) {
      canvas._chart.destroy();
      canvas._chart = null;
      delete canvas.dataset.rendered;
    }
  }
  


  // adding the line - chart

function renderLineChart(year, entries){

    const lineChartCanvas = document.querySelector(`#line-chart-${year}`);
    if(!lineChartCanvas || lineChartCanvas.dataset.render === "true"){
        return;
    }
    // sort entries by monthIndex
    const sortedEntries = [...entries].sort(
        (a, b) => a.monthIndex - b.monthIndex
      );

    const labels = sortedEntries.map(entry => MONTHS[entry.monthIndex]);

    const datasets = [
        {
          label: "NOB",
          data: sortedEntries.map(e => e.nob),
          borderColor: "#2563eb",
          tension: 0.3
        },
        {
          label: "HC",
          data: sortedEntries.map(e => e.hc),
          borderColor: "#16a34a",
          tension: 0.3
        },
        {
          label: "LC",
          data: sortedEntries.map(e => e.lc),
          borderColor: "#ea580c",
          tension: 0.3
        },
        {
          label: "CN",
          data: sortedEntries.map(e => e.cn),
          borderColor: "#dc2626",
          tension: 0.3
        }
      ];
    
    const chart = new Chart(lineChartCanvas, {
        type: "line",
        data: {
          labels,
          datasets
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true }
          },
        plugins: {
            tooltip: {
              enabled: false   // ✅ DISABLED
            },
            legend: {
              position: "top"
            }
          }
        }
      });
    
      lineChartCanvas._chart = chart;
      lineChartCanvas.dataset.rendered = "true";

  }
  
  // to remove entries from the line chart 

function destroyLineChart(year) {
    const canvas = document.querySelector(`#line-chart-${year}`);
  
    if (canvas && canvas._chart) {
      canvas._chart.destroy();
      canvas._chart = null;
      delete canvas.dataset.rendered;
    }
  }
  

// ----------------------------------------
// Comparison Bar Chart
// ----------------------------------------

function renderComparisonBarChart(){
  const canvas = document.querySelector("#comparison-bar-chart");

  if(!canvas || canvas._chart){
    return; 
  }
  const years = getAvailableYears();
  if(!years.length){
    return;
  }

  const totalsByYear = years.map(year => totalMetrics(year));

  const data = {
    labels: years,
    datasets: [
      {
        label: "NOB",
        data: totalsByYear.map(t => t.nob)
      },
      {
        label: "HC",
        data: totalsByYear.map(t => t.hc)
      },
      {
        label: "LC",
        data: totalsByYear.map(t => t.lc)
      },
      {
        label: "CN",
        data: totalsByYear.map(t => t.cn)
      }
    ]
  };

  canvas._chart = new Chart(canvas, {
    type: "bar",
    data,
    options: {
      responsive: true,
     
      plugins: {
            tooltip: {
              enabled: false
            },
            legend: {
              position: "top"
            }
          }        
    }
  });
}

function destroyComparisonBarChart(){
  const canvas = document.querySelector("#comparison-bar-chart");
  if(canvas && canvas._chart){
    canvas._chart.destroy();
    canvas._chart = null;
  }
}

function renderComparisonLineChart(){
  const canvas = document.querySelector("#comparison-line-chart");
  if(!canvas || canvas._chart){
    return;
  }
  const years = getAvailableYears();
  if(!years.length){
    return;
  }

  const totalsByYear = years.map(year => totalMetrics(year));

  const data = {
    labels: years,
    datasets: [
      {
        label: "NOB",
        data: totalsByYear.map(t => t.nob),
        tension: 0.3
      },
      {
        label: "HC",
        data: totalsByYear.map(t => t.hc),
        tension: 0.3
      },
      {
        label: "LC",
        data: totalsByYear.map(t => t.lc),
        tension: 0.3
      },
      {
        label: "CN",
        data: totalsByYear.map(t => t.cn),
        tension: 0.3
      }
    ]
  };

  canvas._chart = new Chart(canvas, {
    type: "line",
    data,
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" }
      }
    }
  });

}

function destroyComparisonLineChart(){
  const canvas = document.querySelector("#comparison-line-chart");
  if(canvas && canvas._chart){
    canvas._chart.destroy();
    canvas._chart = null;
  }
}


// Adding a table to the comparison section 
function renderComparisonTable(){
  const container = document.querySelector("#comparison-table-container");
  if (!container) return;

  // to get the years 
  const years = getAvailableYears().sort();
  if (!years.length) return;

  // to clear the previous 

  container.innerHTML = "";
  
  //creating the table 

  const table = document.createElement("table");
  table.className = "table table-bordered table-striped text-center align-middle";

  //table header 

  const thead = document.createElement("thead");
  thead.innerHTML=`
  <tr>
    <th>Year</th>
    <th>NOB</th>
    <th>HC</th>
    <th>LC</th>
    <th>CN</th>
  </tr>
  `;

  table.appendChild(thead);

  //table body 

  const tbody = document.createElement("tbody");

  years.forEach(year => {
    const totals = totalMetrics(year);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${year}</strong></td>
      <td>${totals.nob}</td>
      <td>${totals.hc}</td>
      <td>${totals.lc}</td>
      <td>${totals.cn}</td>
    `;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.appendChild(table);

}

//----------------------------------------------------------
// MONTHLY PERFORMANCE COMPOSITION (All years combined)
//------------------------------------------------------------
function renderMonthlyComparisonChart(){
  const canvas = document.querySelector("#comparison-monthly-chart");
  if(!canvas) return;

  // destroy old
  if(canvas._chart){
    canvas._chart.destroy();
    canvas._chart = null;
  }

  /*  CRITICAL FIX — reset canvas drawing buffer */
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    canvas.getContext("2d").clearRect(0,0,canvas.width,canvas.height);

  const years = getAvailableYears();
  if(!years.length) return;

  // --------------------------------------------------
  // Combine all years → month wise totals
  // --------------------------------------------------
  const monthlyTotals = new Array(12).fill(null).map(()=>({
    nob:0, hc:0, lc:0, cn:0
  }));

  years.forEach(year=>{
    const entries = getEntriesByYear(year);
    entries.forEach(e=>{
      monthlyTotals[e.monthIndex].nob += e.nob;
      monthlyTotals[e.monthIndex].hc += e.hc;
      monthlyTotals[e.monthIndex].lc += e.lc;
      monthlyTotals[e.monthIndex].cn += e.cn;
    });
  });

  // --------------------------------------------------
  // Pastel datasets
  // --------------------------------------------------
  const datasets = [
    {
      label:"NOB",
      data: monthlyTotals.map(m=>m.nob),
      backgroundColor:"rgba(96,165,250,0.45)",
      borderColor:"rgba(96,165,250,1)",
      borderWidth:1.5,
      borderRadius:6
    },
    {
      label:"HC",
      data: monthlyTotals.map(m=>m.hc),
      backgroundColor:"rgba(244,114,182,0.45)",
      borderColor:"rgba(244,114,182,1)",
      borderWidth:1.5,
      borderRadius:6
    },
    {
      label:"LC",
      data: monthlyTotals.map(m=>m.lc),
      backgroundColor:"rgba(251,191,36,0.45)",
      borderColor:"rgba(251,191,36,1)",
      borderWidth:1.5,
      borderRadius:6
    },
    {
      label:"CN",
      data: monthlyTotals.map(m=>m.cn),
      backgroundColor:"rgba(52,211,153,0.45)",
      borderColor:"rgba(52,211,153,1)",
      borderWidth:1.5,
      borderRadius:6
    }
  ];

  // --------------------------------------------------
  // Create chart
  // --------------------------------------------------
  canvas._chart = new Chart(canvas,{
    type:"bar",
    data:{
      labels: MONTHS,
      datasets
    },
    options:{
      responsive:true,
      aspectRatio:2.3,
      interaction:{
        mode:"index",
        intersect:false
      },
      scales:{
        y:{
          beginAtZero:true,
          ticks:{ precision:0 }
        }
      },
      plugins:{
        tooltip:{ enabled:true },
        legend:{
          position:"top",
          labels:{
            boxWidth:18,
            padding:18
          }
        },
        title:{
          display:true,
          text:"Monthly Performance Composition (All Years Combined)"
        }
      }
    }
  });
}



// to destroy the chart
function destroyMonthlyComparisonChart(){
  const canvas = document.querySelector("#comparison-monthly-chart");
  if(canvas && canvas._chart){
    canvas._chart.destroy();
    canvas._chart = null;
  }
}




export { 
    renderTable,
    renderTotals,
    renderBarChart, 
    destroyBarChart,
    renderLineChart,
    destroyLineChart,
    renderComparisonBarChart,
    destroyComparisonBarChart,
    renderComparisonLineChart,
    destroyComparisonLineChart,
    renderComparisonTable,
    renderMonthlyComparisonChart,
    destroyMonthlyComparisonChart
 };
