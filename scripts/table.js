
/**
 * collect the headers from a json object
 * @param jsonData JSON the data that you want to parse
 * @returns Array<String> the headers of the JSON object that is then flattend
 */
const collectHead = (jsonData) => {
    return [...new Set(jsonData.map(data =>  Object.keys(data) ).flat())]
 }
 
 
 /**
  * create a table header from x amount of choses where x is the amount of headers 
  * @param list List<String> x amount of objects
  * @returns a DOM element list
  */
 const createDOMhead = (...list) => {
     // define a table head place 
     const THEAD = document.createElement("thead");
     
      // create a table row to hold a row
     const TR = document.createElement("tr");
 
 
     for(var name of list){
         // add table head elements
         let th = document.createElement("th")
         
       //th.setAttribute("scope","col");
         th.innerText = name;
         
         TR.append( th );
     }
 
     
     THEAD.append( TR );
     
     return THEAD;
 }
 
 /**
  * create a table row from x amount of choses where x is the amount of items 
  * @param list List<String> x amount of objects
  * @returns a DOM element list
  * @note unlike the createDOMhead this function will only returns a TR not the TBody. 
  * @note you should not have mutlme TBody elements in a table
  */
 const crateDOMrow = (...list) => {
     // add table rows 
     const TR = document.createElement("tr");
     
     for(var item of list){
         // add table head elements
         let th = document.createElement("th")
         
         if( !item.toString().includes("https://") ){
         th.innerText = item;
        } else {
            let img = document.createElement("img")
            img.src = item;
            img.width = "40";
            img.height = "40";

            th.appendChild(img)
        }
         
         TR.append( th );
     }
     
     return TR;
 }
 
 /**
  * crate the rest of the table DOM element. this functon uses crateDOMrow and createDOMhead to crate a table for you
  *@param data your json data to be added to the table
  *@returns a DOM table for you to add to body
  */
 const createDOMtable = (data) => {
     // create the table element with its classes
     const TABLE = document.createElement("table");
     
     TABLE.setAttribute("class", "table table-striped")
     
      //add table body element
      const TBODY = document.createElement("tbody");
     
     // add a head
     TABLE.append( createDOMhead( ...collectHead(data) ) )
    
     
     // add table rows to main body
     for(let row of data){
         let d = crateDOMrow(...Object.values( row ) )
         TBODY.append(d)
     }
     
     TABLE.append( TBODY );
     
     return TABLE
 }
 

 const createSubDom = (data, tables) => {
      // create the table element with its classes
      const TABLE = document.createElement("table");
     
      TABLE.setAttribute("class", "table table-responsive table-striped")
      
       //add table body element
       const TBODY = document.createElement("tbody");
      
      // add a head
      TABLE.append( createDOMhead( ...collectHead(data) ) )
     
      let i = 0
      // add table rows to main body
      for(let row of data){
          let d = crateDOMrow(...Object.values( row ) )
          TBODY.append(d)
          TBODY.appendChild(tables[i]) 
          i++;
      }
      
      TABLE.append( TBODY );
      
      return TABLE
 }



 
  
 /*
       const data = JSON.parse( ("<%= users %>").replaceAll("&#34;", "\"") )
 

 document.body.append(
     createDOMtable(data)
     )
 */