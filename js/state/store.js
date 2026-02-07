

// state holds all dashboard data
// rows represent monthly metrics

// Private internals (not exported)
const state = {
    2024: [],
    2025: [],
    2026: []
  }
  
  


//to add an entry to the table / desired section 
function addEntry(year, entryData){

    // 1. ensure the year exists in state

    if(!state[year]){
        state[year] = [];
      }

    const id = Date.now();

    const newEntry = {
        id,
        ...entryData
      };

    // 4. Push the new row into the correct year array
    state[year].push(newEntry);

    return newEntry; 


};

function getEntriesByYear(year){
  //1. normalize the year

  let yearKey = String(year);

  // 2. check if the year exists in state

  if(!state[yearKey]){

    // 3. if it doesn’t exist, return an empty array
    return [];
  }

  //if it exists, return the entries safely

  return [...state[yearKey]]


};

// to remove the emtry from the table of the desired section 
function removeEntry(year, entryId){
  
    // 1. normalize year

    const key = String(year);
  
    // 2. check if year exists

    if(!state[key]){
      return false;
    }
  
    // 3. create a new array without the matching entryId
    
    state[key] = state[key].filter(function (entry){
      return entry.id !== entryId;
    });

    return true;
  
  
};



function getAvailableYears(){

  const years = Object.keys(state);  // to get the keys from state object 
  return years.map(Number).sort((a, b) => b - a);
};



//get the total of the entries 
function totalMetrics(year){

  const keyNormalized = String(year); // normalizing the key to a string

  const dataState = state[keyNormalized] || [];

  const totals = {
    nob: 0,
    hc: 0,
    lc: 0,
    cn: 0
  };

  for (const data of dataState){
    totals.nob += data.nob;
    totals.hc += data.hc;
    totals.lc += data.lc;
    totals.cn += data.cn;

  }

  return totals; 
}

// last section to compare the data of the different year section --> comparing 2024-2025-2026 data and so on 
function getComparisonData(){

  const yearsAvalible = getAvailableYears();

  const comparisonData = [];

  for (const year of yearsAvalible ){
    const totalData = totalMetrics(year);
    comparisonData.push({
      year,
      ...totalData
      });
  
  }
  return comparisonData;

}

//Save state to localStorage
function saveState(){
  // convert state → JSON string
  const serializedState = JSON.stringify(state);
  localStorage.setItem("dashboardState", serializedState);

  // store it under a fixed key
}


//Load state from localStorage
function loadState(){
  // read JSON string from localStorage

  const serializedState = localStorage.getItem("dashboardState");
// if it exists → parse → replace state
  if(!serializedState){
    return;
  }
  const parsedState = JSON.parse(serializedState);
  
  Object.keys(state).forEach(year => {
    state[year] = parsedState[year] || [];
  });

}




// Public API (exported)
export {
  addEntry,
  getEntriesByYear,
  removeEntry,
  getAvailableYears,
  totalMetrics,
  getComparisonData,
  saveState,
  loadState
  

};

