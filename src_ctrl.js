// Function for importing correlation matrix table
function generate_table() {
    // table element is created in the HTML file.
    var body = document.getElementsByTagName("body")[0];
    var table = document.getElementById("corr_table");
    var tbl_body = document.createElement("tbody");
    table.appendChild(tbl_body);
    body.appendChild(table);

    // Use Ajax to read csv file from URL.
    // (We can also use relative path, here we use URL for stability.)
    var corr_path = "https://cdn.rawgit.com/liuwenbindo/jstest/master/corr_matrix.csv"
    // read_data() is a function for reading csv file then call write_corr() function when success.
    read_data(corr_path, write_corr);
}

// Global var for all available tickers.
var tickerlist = ["SPX Index", "IBM US Equity", "GOOG US Equity", "FB US Equity", "AMZN US Equity", "BABA US Equity", "MSFT US Equity", "NDX Index", "VIX Index"];


// Function for reading file from path_name, and call callback function when success.
function read_data( path_name, callback ) {
  $.ajax({
      type: "GET",
      url: path_name,
      dataType: "text",
      success: function(data) { callback(data); }
   });
}


// Function for decoding response text into arrays, set the ticker list, and call the function for generating HTML.
function write_corr( data_text ){
  var lines = split_csv_by_row(data_text);
  var tickerlist = lines[0].slice(1);
  import_corr(lines);
}


// Function for modifying the table element to create the correlation matrix table.
function import_corr( data_list ){
  var tbl_body = document.getElementById("corr_table").getElementsByTagName("tbody")[0];
  // as the last element in the list is blank, so we ignore the last element.
  for (var i = 0; i < data_list.length-1; i++){
    var row = document.createElement("tr"); //create current row
    for (var j = 0; j < data_list[i].length; j++){
      var cell = document.createElement("td"); //create current cell
      cell.innerHTML = data_list[i][j];
      cell.id = data_list[i][0] + ',' + data_list[0][j]; // save the row ticker and column ticker as ID of this cell.
      cell.addEventListener("click", function(){
        read_2_data( this.id ); // when click this cell, function read_2_data is triggered to read raw data and display.
      });
      row.appendChild(cell);
    }
    tbl_body.appendChild(row);
  }
}

// Function to decode .csv file: save every ROW of csv as an array, and save all rows into a larger array.
function split_csv_by_row( data_text ){
  var all_lines = data_text.split(/\r\n|\n/);
  var rows = [];
  for (var i = 0; i < all_lines.length; i++) {
    rows.push(all_lines[i].split(','));
  }
  return rows;
}


// Function to decode .csv file: save every COLUMN of csv into an array, and save all columns into a larger array.
function split_csv_by_col( data_text ){
  var all_lines = data_text.split(/\r\n|\n/);
  var cols = [[],[]];
  for (var i = 0; i < all_lines.length; i++) {
    if (i == 0){ // first line is csv header, can't be parsed to int.
      cols[0].push(all_lines[i].split(',')[0]);
      cols[1].push(all_lines[i].split(',')[1]);
    } else { // parse date to int can make mapping from date to price faster.
    cols[0].push(parseInt(all_lines[i].split(',')[0]));
    cols[1].push(all_lines[i].split(',')[1]);
    }
  }
  return cols;
}


// Use the string containing 2 tickers to get corresponding .csv data.
function read_2_data( str ){
  // decode 2 tickers.
  var tic1 = str.split(',')[0].split(' ')[0]
  var tic2 = str.split(',')[1].split(' ')[0]

  // if they are the same, only import 1 csv file.
  if (tic1 == tic2) {

    var path0 = "../data/" + tic1 + ".csv";
    $.ajax({ type: "GET",
             url: path0,
             dataType: "text",
             // store the ticker and response into arrays seperately, to maintain the consistency of the new_html function inputs.
             success: function(data) { new_html( [tic1], [data] ); }
          });
  } else if (tic1 != "" && tic2 != "") { //make sure we have 2 tickers

  var path1 = "../data/" + tic1 + ".csv";
  var path2 = "../data/" + tic2 + ".csv";

  var ajax1 = $.ajax({ type: "GET", url: path1, dataType: "text"});
  var ajax2 = $.ajax({ type: "GET", url: path2, dataType: "text"});

  // conduct 2 ajax simultaneously, when both of them are success, generate new html using new_html function.
  $.when(ajax1, ajax2)
    .done( function(res1, res2){
      // store the ticker and response into arrays seperately, to maintain the consistency of the new_html function inputs.
      new_html( [tic1, tic2], [res1[0], res2[0]] );
    })
    .fail( function(){
      console.log('An error occurred when importing 2 csv files.')
    });
  } else {
    console.log('Please click within the data range.')
  }
}


// Function to generate new HTML page from csv response strings.
// Both inputs are arrays containing 1 or 2 elements with tickers / response texts.
function new_html( ticArr, datastrArr ){
  // var list is the final result containing table content to display.
  var list, col_num, header_arr = [];
  if (ticArr.length == 1) {
    list = split_csv_by_row(datastrArr[0]);
    col_num = 2;
    header_arr = ['Date', ticArr[0]];
  } else if (ticArr.length == 2) {
    var list1 = split_csv_by_col(datastrArr[0]);
    var list2 = split_csv_by_col(datastrArr[1]);
    list = outerjoin(list1, list2); // outerjoin two tables.
    col_num = 3;
    header_arr = ['Date', ticArr[0], ticArr[1]];
  } else {
    console.log('Abnormal ticker array size.')
  }

  // use 2 arrays and tickers to generate new HTML page with table.
  var newHTMLDocument = document.implementation.createHTMLDocument("Raw Data Display");

  // source online-hosted css code to control the newly-generated HTML.
  var stylelink = newHTMLDocument.createElement("link");
  stylelink.rel = "stylesheet";
  stylelink.type = "text/css";
  stylelink.href = "https://cdn.rawgit.com/liuwenbindo/jstest/master/stylesheet.css";
  newHTMLDocument.head.appendChild(stylelink);

  // source online-hosted js code to control the newly-generated HTML.
  var js_ctrl = newHTMLDocument.createElement("script");
  js_ctrl.src = "https://cdn.rawgit.com/liuwenbindo/jstest/master/src_ctrl.js"
  newHTMLDocument.head.appendChild(js_ctrl);

  // source jQuery in the newly-generated page.
  var jq_ctrl = newHTMLDocument.createElement("script");
  jq_ctrl.src = "https://cdn.rawgit.com/liuwenbindo/jstest/master/js/jquery-3.3.1.min.js"
  newHTMLDocument.head.appendChild(jq_ctrl);

  // generate header.
  var tbl = newHTMLDocument.createElement("table");
  tbl.id = "price_table";
  var tbl_body = newHTMLDocument.createElement("tbody");
  var tr = newHTMLDocument.createElement("tr");
  var th = []
  for (var i = 0; i < col_num; i++) {
     th.push(newHTMLDocument.createElement("th"));
     th[i].innerHTML = header_arr[i];
     tr.appendChild(th[i]);
  }
  tbl_body.appendChild(tr);

  var leng = list.length;
  // generate table cells.
  for (var i = 1; i < leng-1; i++){
    var row = document.createElement("tr"); //current row
    for (var j = 0; j < col_num; j++){
      var cell = document.createElement("td");
      cell.innerHTML = list[i][j];
      row.appendChild(cell);
    }
    tbl_body.appendChild(row);
  }

  try {
    var h1 = newHTMLDocument.createElement("h1");
    h1.innerHTML = "Raw Data Display";
    h1.id = "raw_header";
    newHTMLDocument.body.appendChild(h1);
    newHTMLDocument.body.appendChild(tbl);
    tbl.appendChild(tbl_body);
  } catch(e) {
    console.log(e);
  }

  // add the multiple selection box for more tickers.
  add_select(newHTMLDocument, tickerlist);
  // concatenate HTML strings to add onclick function of the submit button.
  newHTMLDocument.getElementById("select_div").innerHTML += "<br><input type = 'button' value ='Submit' onclick ='click_func(); return false;'>"

  // display the HTML document in the new window.
  var htmlstr = "<html>" + newHTMLDocument.documentElement.innerHTML + "</html>";
  var x = window.open();
  x.document.open();
  x.document.write(htmlstr);
  x.document.close();
}


// Function for conducting outer join of 2 tables.
function outerjoin ( arr1, arr2 ){
  var key1 = arr1[0], key2 = arr2[0], v1 = arr1[1], v2 = arr2[1];
  var my_map = new Map(), my_map2 = new Map();

  // store date as key, corresponding price as value into Map structure;
  var len1 = key1.length, len2 = key2.length, maxlen = Math.max(len1, len2);
  for (var i = 0; i < maxlen; i++){
    if (i < len1) {
      my_map.set(key1[i], v1[i]);
    }
    if (i < len2) {
      my_map2.set(key2[i], v2[i]);
    }
  }

  // find the union set of 2 key arrays;
  var key3 = key1.concat(key2.filter(function (item) {
    return key1.indexOf(item) < 0;
  })).filter(Boolean);

  // for every key in the union set, find its corresponding values in the 2 Maps.
  var v3 = [], len3 = key3.length;
  for (var i = 0; i < len3; i++){
    v3.push([key3[i], my_map.get(key3[i]),my_map2.get(key3[i])]);
  }
  return v3;
}


// Function to add drop down list element in the HTML.
function add_select( doc, tickerlist ) {
  var thisdiv = document.createElement("div");
  thisdiv.id = "select_div";

  var h3 = document.createElement("h3");
  h3.innerHTML = "Please select 2 tickers to check their raw data."
  thisdiv.appendChild(h3);

  // first drop down list, set first selection option (displayed when no tickers are selected.)
  var select1 = document.createElement("select");
  select1.id = "select_list_1";
  var opt1 = document.createElement("option");
  opt1.value = 0;
  opt1.innerHTML = "Select ticker 1"
  select1.appendChild(opt1);

  // second drop down list, set first selection option (displayed when no tickers are selected.)
  var select2 = document.createElement("select");
  select2.id = "select_list_2";
  var opt2 = document.createElement("option");
  opt2.value = 0;
  opt2.innerHTML = "Select ticker 2"
  select2.appendChild(opt2);

  // set selection options from global variable tickerlist.
  list_len = tickerlist.length;
  for (var i = 0; i < list_len; i++){
    var thisopt1 = document.createElement("option");
    var thisopt2 = document.createElement("option");
    thisopt1.value = thisopt1.innerHTML = tickerlist[i];
    select1.appendChild(thisopt1);
    thisopt2.value = thisopt2.innerHTML = tickerlist[i];
    select2.appendChild(thisopt2);
  }
  thisdiv.appendChild(select1);
  thisdiv.innerHTML += "<br><br>";
  thisdiv.appendChild(select2);
  thisdiv.innerHTML += "<br>";
  doc.body.appendChild(thisdiv);
}


// on-click function of the submit button.
// call the function for generating new HTML based on the selected items.
function click_func() {
  var s1 = document.getElementById("select_list_1");
  var s2 = document.getElementById("select_list_2");
  var opt1 = s1.options[s1.selectedIndex].text;
  var opt2 = s2.options[s2.selectedIndex].text;
  var val1 = s1.options[s1.selectedIndex].value;
  var val2 = s2.options[s2.selectedIndex].value;

  if (val1 == 0 || val2 == 0) {
    alert('Please select 2 asset tickers.');
  } else {
    var newstr = opt1 + "," + opt2;
    read_2_data(newstr);
  }
}
