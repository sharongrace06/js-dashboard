//----------------------------------------
//    IMPORTS 
//----------------------------------------

import { addEntry } from "./state/store.js";
import { getEntriesByYear } from "./state/store.js";
import { renderTable } from "./ui/dashboard.js";
import { removeEntry } from "./state/store.js";
import { totalMetrics} from "./state/store.js";
import { renderTotals, renderBarChart, destroyBarChart } from "./ui/dashboard.js";
import { getAvailableYears } from "./state/store.js";
import { loadState, saveState } from "./state/store.js";
import { MONTHS } from "./utils/helpers.js";
import { renderLineChart, destroyLineChart } from "./ui/dashboard.js";
import { renderComparisonBarChart, destroyComparisonBarChart } from "./ui/dashboard.js";
import {renderComparisonLineChart, destroyComparisonLineChart } from "./ui/dashboard.js";
import { renderComparisonTable } from "./ui/dashboard.js";
import { renderMonthlyComparisonChart, destroyMonthlyComparisonChart } from "./ui/dashboard.js";




//-----------------------------------------------
// ===== ALWAYS SHOW VALUES ON CHARTS =====
//----------------------------------------------

Chart.register({
  id: "alwaysShowValues",
  afterDatasetsDraw(chart) {

    //  Only skip the heavy monthly comparison chart
    if (chart.canvas.id === "comparison-monthly-chart") return;

    const { ctx } = chart;
    ctx.save();

    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);

      meta.data.forEach((element, index) => {

        if (!element || element.hidden) return;

        const value = dataset.data[index];
        if (value === null || value === undefined) return;

        const position = element.tooltipPosition();
        if (!position || isNaN(position.x) || isNaN(position.y)) return;

        ctx.fillStyle = "#111";
        ctx.font = "bold 12px Inter, sans-serif";
        ctx.textAlign = "center";

        if (chart.config.type === "bar") {
          ctx.fillText(value, position.x, position.y - 8);
        }

        if (chart.config.type === "line") {
          ctx.fillText(value, position.x, position.y - 10);
        }
      });
    });

    ctx.restore();
  }
});



//-----------------------------------------------------------------
// Render the UI once from the current state when the app starts.
//-----------------------------------------------------------------

function initialRender(){
    // 1. Get all available years from the store
    const years = getAvailableYears();
    // 2. Loop over each year
    years.forEach(year => {
        // 3. Get entries for this year
        const entries = getEntriesByYear(year);
        // 4. Render table rows
        renderTable(year, entries);
        // 6. Render totals
        renderTotals(year, totalMetrics(year));
    });

}

// Month Input Dropdown selection
function populateMonthDropdown(){
    const monthSelect = document.querySelector("#input-month");
    MONTHS.forEach((month, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = month;
        monthSelect.appendChild(option);
    });
}

// select the form

const form = document.querySelector("#data-form");

form.addEventListener("submit", function(event){
    event.preventDefault();
    // to read inputs
    const monthIndex = Number(document.querySelector("#input-month").value);
    const nob = Number(document.querySelector("#input-nob").value);
    const hc = Number(document.querySelector("#input-hc").value);
    const lc = Number(document.querySelector("#input-lc").value);
    const cn = Number(document.querySelector("#input-cn").value);

    const year = document.querySelector("#year-selector").value;  // string key

    //Validation

    //1. Month Validation 

    if (Number.isNaN(monthIndex)) {
        return;
      }
    if (document.querySelector("#input-month").value === ""){
        return;
      }
      
      

    // 2. NOB, HC, LC, CN Validation 

    if(nob < 0 || hc < 0 || lc < 0 || cn < 0){
        return;
    }

    // 3. to check for dublicates 

    const existingEntries = getEntriesByYear(year);

    for (let entry of existingEntries){
        if (entry.monthIndex === monthIndex) {
            return;
          }
          
    }

    // to buile the object

    const entryData = {
        monthIndex, 
        nob,
        hc,
        lc,
        cn
    };

    addEntry(year, entryData);
    saveState();
    renderTable(year, getEntriesByYear(year));
    renderTotals(year, totalMetrics(year));  //to get the totals 

    destroyBarChart(year);
    destroyLineChart(year);

    // comparison section --> auto update

    destroyComparisonBarChart();
    destroyComparisonLineChart();

    renderComparisonBarChart();
    renderComparisonLineChart();

    renderComparisonTable();

    destroyMonthlyComparisonChart();
    renderMonthlyComparisonChart();


    applyNoPrintTags();
    



    //Form Reset
    document.querySelector("#input-month").value = "";
    document.querySelector("#input-nob").value = "";
    document.querySelector("#input-hc").value = "";
    document.querySelector("#input-lc").value = "";
    document.querySelector("#input-cn").value = "";
    

    
});

// delete button 

document.addEventListener("click", function(event){
    if(!event.target.matches("button[data-id]")){
        return ;  
    }
    //get the entry id from the button
    const entryId = Number(
        event.target.dataset.id
        );

    const row = event.target.closest("tr");
    const tbody = row.closest("tbody");
    const year = tbody.id.replace("table-", "");

    // 4️⃣ update state
    removeEntry(year, entryId);
    saveState();

    // 5️⃣ re-render UI
    renderTable(year, getEntriesByYear(year));

    // to render the totals for the tables
    renderTotals(year, totalMetrics(year));

    // chart to update with the table 
    destroyBarChart(year);

    // line-chart update with the table 
    destroyLineChart(year);

    // comparison section --> to update with the tables and auto update 

    destroyComparisonBarChart();
    destroyComparisonLineChart();

    renderComparisonBarChart();
    renderComparisonLineChart();

    renderComparisonTable();

    destroyMonthlyComparisonChart();
    renderMonthlyComparisonChart();


    applyNoPrintTags();
  

});


document.addEventListener("click", function (event){

    if(!event.target.matches(".view-insights")){
        return;
    }
    const year = event.target.dataset.year;

    const insightsEl = document.querySelector(`#insights-${year}`);

    // toggle visibility
    if(insightsEl.style.display === "block"){
        insightsEl.style.display = "none";
    } else {
        insightsEl.style.display = "block";

        // render chart 
        const metrics = totalMetrics(year);
        renderBarChart(year, metrics);

        // render line chart 
        const entries = getEntriesByYear(year);
        renderLineChart(year, entries);

          
    }  

    
});

// Adding Image Section 

document.addEventListener("click", function(event){
    if(!event.target.matches(".add-image")){
        return;
    }
    const year = event.target.dataset.year;
    const fileInput = document.querySelector(`#image-input-${year}`);

    //open the file picker 
    fileInput.click();
});

//Handle file selection + preview
document.addEventListener("change", function (event) {
    if (!event.target.matches("input[type='file'][id^='image-input-']")) return;
  
    const input = event.target;
    const year = input.id.replace("image-input-", "");
    const file = input.files[0];
  
    if (!file) return;
  
    const img = document.querySelector(`#image-${year}`);
  
    // Create a temporary URL for preview
    const imageUrl = URL.createObjectURL(file);
  
    img.src = imageUrl;
    img.hidden = false;
  
    // Enable remove button
    const removeBtn = document.querySelector(
      `.remove-image[data-year="${year}"]`
    );
    removeBtn.disabled = false;
  });

//Remove Image
document.addEventListener("click", function (event) {
    if (!event.target.matches(".remove-image")) return;
  
    const year = event.target.dataset.year;
    const img = document.querySelector(`#image-${year}`);
    const input = document.querySelector(`#image-input-${year}`);
  
    // Clear UI
    img.src = "";
    img.hidden = true;
  
    // Clear file input
    input.value = "";
  
    // Disable remove button again
    event.target.disabled = true;
  });




//inisghts sections download 
// ================== FINAL PDF EXPORT (NO FREEZE VERSION) ==================

document.addEventListener("click", async function (event) {
  if (!event.target.matches(".download-btn")) return;

  const year = event.target.dataset.year;
  const section = document.querySelector(`.year-section[data-year="${year}"]`);
  if (!section) return;

  // clone clean copy
  const clone = section.cloneNode(true);
  clone.style.position = "fixed";
  clone.style.left = "-9999px";
  clone.style.top = "0";
  clone.style.width = "1100px";
  clone.style.background = "white";

  document.body.appendChild(clone);

  // remove buttons + action column
  clone.querySelectorAll("button").forEach(b => b.remove());
  clone.querySelectorAll("th:last-child, td:last-child").forEach(el => el.remove());

  // show insights
  clone.querySelectorAll(".insights").forEach(el => el.style.display = "block");



  // ---------- RENDER CHARTS AS IMAGES ----------
  const metrics = totalMetrics(year);
  const entries = getEntriesByYear(year);

  async function chartToImage(canvas, config) {
    const tempCanvas = document.createElement("canvas");
    canvas.replaceWith(tempCanvas);

    const chart = new Chart(tempCanvas, config);
    await new Promise(r => setTimeout(r, 200));

    const img = document.createElement("img");
    img.src = chart.toBase64Image();
    img.style.width = "100%";

    tempCanvas.replaceWith(img);
    chart.destroy();
  }

  // bar chart
  const bar = clone.querySelector(`#bar-chart-${year}`);
  if (bar) {
    await chartToImage(bar, {
      type: "bar",
      data: {
        labels: ["NOB", "HC", "LC", "CN"],
        datasets: [{
          label: `${year} Totals`,
          data: [metrics.nob, metrics.hc, metrics.lc, metrics.cn]
        }]
      },
      options: { animation:false, responsive:false }
    });
  }

  // line chart
  const line = clone.querySelector(`#line-chart-${year}`);
  if (line) {
    await chartToImage(line, {
      type: "line",
      data: {
        labels: entries.map(e => MONTHS[e.monthIndex]),
        datasets: [
          { label:"NOB", data:entries.map(e=>e.nob) },
          { label:"HC", data:entries.map(e=>e.hc) },
          { label:"LC", data:entries.map(e=>e.lc) },
          { label:"CN", data:entries.map(e=>e.cn) }
        ]
      },
      options:{ animation:false, responsive:false }
    });
  }

  // ---------- CREATE PDF ----------
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p","mm","a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const pages = clone.querySelectorAll(".pdf-page");
  let first = true;

  for (const page of pages) {

    const canvas = await html2canvas(page,{
      scale:2,
      backgroundColor:"#ffffff",
      useCORS:true
    });

    const imgWidth = pageWidth;
    const imgHeight = canvas.height * imgWidth / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    const imgData = canvas.toDataURL("image/png");

    while (heightLeft > 0) {
      if (!first) pdf.addPage();
      pdf.addImage(imgData,"PNG",0,position,imgWidth,imgHeight);
      heightLeft -= pageHeight;
      position -= pageHeight;
      first = false;
    }
  }

  pdf.save(`Analytics_Report_${year}.pdf`);
  clone.remove();
});


//helper function 
async function waitForChartsToRender(section){

  const canvases = section.querySelectorAll("canvas");

  const waiters = [];

  canvases.forEach(canvas => {
    if(canvas._chart){

      waiters.push(new Promise(resolve => {
        canvas._chart.options.animation = {
          duration: 0,
          onComplete: resolve
        };

        canvas._chart.update();
      }));

    } else {
      // non chart canvas → resolve instantly
      waiters.push(Promise.resolve());
    }
  });

  await Promise.all(waiters);

  // allow browser paint
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
}





//------------------------------------------
// download - Comparison Section
//------------------------------------------
document.getElementById("download-comparison")
.addEventListener("click", async function(){

  const section = document.querySelector(".comparison-section");

  // clone clean copy
  const clone = section.cloneNode(true);
  clone.style.position = "fixed";
  clone.style.left = "-9999px";
  clone.style.top = "0";
  clone.style.width = "1100px";
  clone.style.background = "white";

  document.body.appendChild(clone);

  // remove buttons
  clone.querySelectorAll("button").forEach(b => b.remove());

  // ----- convert charts to images -----
  const cloneCanvases = clone.querySelectorAll("canvas");

  for (const cloneCanvas of cloneCanvases) {

    const originalCanvas = document.getElementById(cloneCanvas.id);
    if (!originalCanvas) continue;

    const chart = Chart.getChart(originalCanvas);
    if (!chart) continue;

    const img = document.createElement("img");
    img.src = chart.toBase64Image();
    img.style.width = "100%";
    img.style.display = "block";

    cloneCanvas.replaceWith(img);
  }

  // ----- create pdf -----
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p","mm","a4");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const pages = clone.querySelectorAll(".pdf-page");

  let first = true;

  for(const page of pages){

    const canvas = await html2canvas(page,{
      scale:2,
      backgroundColor:"#ffffff",
      useCORS:true
    });

    const imgData = canvas.toDataURL("image/png");

    let imgWidth = pageWidth;
    let imgHeight = canvas.height * imgWidth / canvas.width;

    // ---- FIRST PAGE: FIT WHOLE DASHBOARD ----
    if(first){

      const ratio = Math.min(
        pageWidth / imgWidth,
        pageHeight / imgHeight
      );

      imgWidth *= ratio;
      imgHeight *= ratio;

      pdf.addImage(
        imgData,
        "PNG",
        (pageWidth - imgWidth)/2,
        (pageHeight - imgHeight)/2,
        imgWidth,
        imgHeight
      );

      first = false;
      continue;
    }

    // ---- OTHER PAGES: NORMAL FULL CHART ----
    pdf.addPage();
    pdf.addImage(imgData,"PNG",0,0,pageWidth,imgHeight);
  }

  pdf.save("Comparison_Report.pdf");
  clone.remove();
});





// ----------------------------------------
// Mark UI-only elements (hidden in PDF)
// ----------------------------------------
function applyNoPrintTags() {

  // 1️⃣ Action column headers
  document.querySelectorAll("th").forEach(th => {
    if (th.textContent.trim() === "Action") {
      th.classList.add("no-print");
    }
  });

  // 2️⃣ Control buttons
  document.querySelectorAll(
    ".view-insights, .add-image, .remove-image, .download-btn, #download-comparison"
  ).forEach(el => el.classList.add("no-print"));

}



loadState();
populateMonthDropdown();
initialRender();
renderComparisonBarChart();
renderComparisonLineChart();
renderComparisonTable();
applyNoPrintTags();
renderMonthlyComparisonChart();

