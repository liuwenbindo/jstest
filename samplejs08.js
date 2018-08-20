function generate_table() {
    var body = document.getElementsByTagName("body")[0];
    var table = document.getElementById("corr_table");
    var tbl_body = document.createElement("tbody");
    table.appendChild(tbl_body);
    body.appendChild(table);

    // Add function to read the correlation Matrix
    // Ajax solution.
    var corr_path = "https://cdn.rawgit.com/liuwenbindo/jstest/master/corr_matrix.csv"
    read_data(corr_path, write_corr);
}


var tickerlist = ["SPX Index", "IBM US Equity", "GOOG US Equity", "FB US Equity", "AMZN US Equity", "BABA US Equity", "MSFT US Equity", "NDX Index", "VIX Index"];


function read_data( path_name, callback ) {
  $.ajax({
      type: "GET",
      url: path_name,
      dataType: "text",
      success: function(data) { callback(data); }
   });
}


function write_corr( data_text ){
  var lines = split_csv_by_row(data_text);
  var tickerlist = lines[0].slice(1);
  import_corr(lines, tickerlist);
}


function import_corr( data_list, tickerlist ){
  var tbl_body = document.getElementById("corr_table").getElementsByTagName("tbody")[0];
  for (var i = 0; i < data_list.length-1; i++){
    var row = document.createElement("tr"); //current row
    for (var j = 0; j < data_list[i].length; j++){
      var cell = document.createElement("td");
      cell.innerHTML = data_list[i][j];
      cell.id = data_list[i][0] + ',' + data_list[0][j];
      cell.addEventListener("click", function(){
        read_2_data( this.id, tickerlist );
      });
      row.appendChild(cell);
    }
    tbl_body.appendChild(row);
  }
}


function split_csv_by_row(data_text){
  var all_lines = data_text.split(/\r\n|\n/);
  var rows = [];
  for (var i = 0; i < all_lines.length; i++) {
    rows.push(all_lines[i].split(','));
  }
  return rows;
}


function split_csv_by_col(data_text){
  var all_lines = data_text.split(/\r\n|\n/);
  var cols = [[],[]];
  for (var i = 0; i < all_lines.length; i++) {
    if (i == 0){
      cols[0].push(all_lines[i].split(',')[0]);
      cols[1].push(all_lines[i].split(',')[1]);
    } else {
    cols[0].push(parseInt(all_lines[i].split(',')[0]));
    cols[1].push(all_lines[i].split(',')[1]);
    }
  }
  return cols;
}


function read_2_data( str ){
  var tic1 = str.split(',')[0].split(' ')[0]
  var tic2 = str.split(',')[1].split(' ')[0]

  if (tic1 == tic2) {

    var path0 = "../data/" + tic1 + ".csv";
    $.ajax({ type: "GET",
             url: path0,
             dataType: "text",
             success: function(data) { new_html( [tic1], [data] ); }
          });
  } else if (tic1 != "" && tic2 != "") {

  var path1 = "../data/" + tic1 + ".csv";
  var path2 = "../data/" + tic2 + ".csv";

  var ajax1 = $.ajax({ type: "GET", url: path1, dataType: "text"});
  var ajax2 = $.ajax({ type: "GET", url: path2, dataType: "text"});

  $.when(ajax1, ajax2)
    .done( function(res1, res2){
      // Do something with the 2 csv files
      new_html( [tic1, tic2], [res1[0], res2[0]] );
    })
    .fail( function(){
      console.log('An Error occurred.')
    });
  } else {
    console.log('Please click the data range.')
  }
}


function new_html( ticArr, datastrArr ){

  var list, col_num, header_arr = [];
  if (ticArr.length == 1) {
    list = split_csv_by_row(datastrArr[0]);
    col_num = 2;
    header_arr = ['Date', ticArr[0]];
  } else if (ticArr.length == 2) {
    var list1 = split_csv_by_col(datastrArr[0]);
    var list2 = split_csv_by_col(datastrArr[1]);
    list = outerjoin(list1, list2);
    col_num = 3;
    header_arr = ['Date', ticArr[0], ticArr[1]];
  } else {
    console.log('Abnormal ticker array size.')
  }

  // use 2 arrays and tickers to generate new HTML page with table.
  var newHTMLDocument = document.implementation.createHTMLDocument("Raw Data Display");

  var stylelink = newHTMLDocument.createElement("link");
  stylelink.rel = "stylesheet";
  stylelink.type = "text/css";
  stylelink.href = "https://cdn.rawgit.com/liuwenbindo/jstest/master/style04.css";
  newHTMLDocument.head.appendChild(stylelink);

  var js_ctrl = newHTMLDocument.createElement("script");
  js_ctrl.src = "https://cdn.rawgit.com/liuwenbindo/jstest/master/samplejs08.js"
  newHTMLDocument.head.appendChild(js_ctrl);

  var jq_ctrl = newHTMLDocument.createElement("script");
  jq_ctrl.src = "https://cdn.rawgit.com/liuwenbindo/jstest/master/js/jquery-3.3.1.min.js"
  newHTMLDocument.head.appendChild(jq_ctrl);

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
  // Set table content rows
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
    newHTMLDocument.body.appendChild(h1);
    newHTMLDocument.body.appendChild(tbl);
    tbl.appendChild(tbl_body);
  } catch(e) {
    console.log(e);
  }

  // add the multiple selection box for tickers
  add_select(newHTMLDocument, tickerlist);
  newHTMLDocument.getElementById("select_div").innerHTML += "<br><input type = 'button' value ='Submit' onclick ='click_func(); return false;'>"

  // Display the HTML document in the new window
  var htmlstr = "<html>" + newHTMLDocument.documentElement.innerHTML + "</html>";
  var x = window.open();
  x.document.open();
  x.document.write(htmlstr);
  x.document.close();
}


function outerjoin (arr1, arr2){
  var key1 = arr1[0], key2 = arr2[0], v1 = arr1[1], v2 = arr2[1];
  var my_map = new Map(), my_map2 = new Map();

  var len1 = key1.length, len2 = key2.length, maxlen = Math.max(len1, len2);
  for (var i = 0; i < maxlen; i++){
    if (i < len1) {
      my_map.set(key1[i], v1[i]);
    }
    if (i < len2) {
      my_map2.set(key2[i], v2[i]);
    }
  }

  var key3 = key1.concat(key2.filter(function (item) {
    return key1.indexOf(item) < 0;
  })).filter(Boolean);

  var v3 = [], len3 = key3.length;
  for (var i = 0; i < len3; i++){
    v3.push([key3[i], my_map.get(key3[i]),my_map2.get(key3[i])]);
  }
  return v3;
}


function add_select( doc, tickerlist ) {
  var thisdiv = document.createElement("div");
  thisdiv.id = "select_div";

  var h3 = document.createElement("h3");
  h2.innerHTML = "Please select 2 tickers to check their raw data table."
  thisdiv.appendChild(h3);

  var select1 = document.createElement("select");
  select1.id = "select_list_1";
  var opt1 = document.createElement("option");
  opt1.value = 0;
  opt1.innerHTML = "Select ticker 1"
  select1.appendChild(opt1);

  var select2 = document.createElement("select");
  select2.id = "select_list_2";
  var opt2 = document.createElement("option");
  opt2.value = 0;
  opt2.innerHTML = "Select ticker 2"
  select2.appendChild(opt2);

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
  thisdiv.innerHTML += "<br>";
  thisdiv.appendChild(select2);
  thisdiv.innerHTML += "<br>";
  doc.body.appendChild(thisdiv);
}


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
