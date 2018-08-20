function generate_table() {
    var body = document.getElementsByTagName("body")[0];
    var table = document.getElementById("corr_table");
    var tbl_body = document.createElement("tbody");
    table.appendChild(tbl_body);
    body.appendChild(table);

    // Add function to read the correlation Matrix
    // Ajax solution.
    read_data('./sample.csv', write_corr);
}

var tickerlist = [];

function read_data(path_name, callback) {
  $.ajax({
      type: "GET",
      url: path_name,
      dataType: "text",
      success: function(data) { callback(data); }
   });
}


function write_corr( data_text ){
  var lines = split_csv_by_row(data_text);
  tickerlist = lines[0].slice(1);
  import_corr(lines);
}


function import_corr( data_list ){
  var tbl_body = document.getElementById("corr_table").getElementsByTagName("tbody")[0];
  for (var i = 0; i < data_list.length-1; i++){
    var row = document.createElement("tr"); //current row
    for (var j = 0; j < data_list[i].length; j++){
      var cell = document.createElement("td");
      cell.innerHTML = data_list[i][j];
      cell.id = data_list[i][0] + ',' + data_list[0][j];
      cell.addEventListener("click", function(){
        read_2_data(this.id);
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
  for (var i = 1; i < all_lines.length; i++) {
    cols[0].push(parseInt(all_lines[i].split(',')[0]));
    cols[1].push(all_lines[i].split(',')[1]);
  }
  return cols;
}


function read_2_data(str){
  var tic1 = str.split(',')[0].split(' ')[0]
  var tic2 = str.split(',')[1].split(' ')[0]

  if (tic1 == tic2) {

    var path0 = "../data/" + tic1 + ".csv";
    $.ajax({ type: "GET",
             url: path0,
             dataType: "text",
             success: function(data) { new_html_1tic(tic1, data); }
          });
  } else {

  var path1 = "../data/" + tic1 + ".csv";
  var path2 = "../data/" + tic2 + ".csv";

  var ajax1 = $.ajax({ type: "GET", url: path1, dataType: "text"});
  var ajax2 = $.ajax({ type: "GET", url: path2, dataType: "text"});

  $.when(ajax1, ajax2)
    .done( function(res1, res2){
      // Do something with the 2 csv files
      new_html_2tics(tic1, tic2, res1[0], res2[0]);
    })
    .fail( function(){
      console.log('An Error occurred.')
    });
  }
}


function new_html_1tic( tic, datastr ){

  var list0 = split_csv_by_row(datastr);

  var newHTMLDocument = document.implementation.createHTMLDocument("Raw Data Display");

  var stylelink = newHTMLDocument.createElement("link");
  stylelink.rel = "stylesheet";
  stylelink.type = "text/css";
  stylelink.href = "https://cdn.rawgit.com/liuwenbindo/jstest/master/style02.css";
  newHTMLDocument.head.appendChild(stylelink);

  var tbl = newHTMLDocument.createElement("table");
  tbl.id = "price_table";
  var tbl_body = newHTMLDocument.createElement("tbody");
  var tr = newHTMLDocument.createElement("tr");
  var th = []
  for (var i = 0; i < 2; i++) {
     th.push(newHTMLDocument.createElement("th"));
     tr.appendChild(th[i]);
  }
  th[0].innerHTML = 'Date';
  th[1].innerHTML = tic;
  tbl_body.appendChild(tr);

  var leng = list0.length;
  // Set table content rows
  for (var i = 1; i < leng-1; i++){
    var row = document.createElement("tr"); //current row
    for (var j = 0; j < 2; j++){
      var cell = document.createElement("td");
      cell.innerHTML = list0[i][j];
      row.appendChild(cell);
    }
    tbl_body.appendChild(row);
  }

  try {
    newHTMLDocument.body.appendChild(tbl);
    tbl.appendChild(tbl_body);
  } catch(e) {
    console.log(e);
  }

  // add the multiple selection box for tickers
  add_select(newHTMLDocument, tickerlist);

  // Display the HTML document in the new window
  var htmlstr = "<html>" + newHTMLDocument.documentElement.innerHTML + "</html>";
  var x = window.open();
  x.document.open();
  x.document.write(htmlstr);
  x.document.close();
}



function new_html_2tics( tic1, tic2, str1, str2 ) {
  // split 2 csv strings into arrays, every element in the arrays is another list containing data of a column.
  var list1 = split_csv_by_col(str1);
  var list2 = split_csv_by_col(str2);
  var result = outerjoin(list1, list2);

  // use 2 arrays and tickers to generate new HTML page with table.
  var newHTMLDocument = document.implementation.createHTMLDocument("Raw Data Display");

  var stylelink = newHTMLDocument.createElement("link");
  stylelink.rel = "stylesheet";
  stylelink.type = "text/css";
  stylelink.href = "https://cdn.rawgit.com/liuwenbindo/jstest/master/style02.css";
  newHTMLDocument.head.appendChild(stylelink);

  var js_ctrl = newHTMLDocument.createElement("script");
  js_ctrl.src = "https://cdn.rawgit.com/liuwenbindo/jstest/master/samplejs02.js"
  newHTMLDocument.head.appendChild(js_ctrl);

  var tbl = newHTMLDocument.createElement("table");
  tbl.id = "price_table";
  var tbl_body = newHTMLDocument.createElement("tbody");

  // Set table header row
  var tr = newHTMLDocument.createElement("tr");
  var th = []
  for (var i = 0; i < 3; i++) {
     th.push(newHTMLDocument.createElement("th"));
     tr.appendChild(th[i]);
  }
  th[0].innerHTML = 'Date';
  th[1].innerHTML = tic1;
  th[2].innerHTML = tic2;
  tbl_body.appendChild(tr);

  var leng = result.length;
  // Set table content rows
  for (var i = 0; i < leng; i++){
    var row = document.createElement("tr"); //current row
    for (var j = 0; j < 3; j++){
      var cell = document.createElement("td");
      cell.innerHTML = result[i][j];
      row.appendChild(cell);
    }
    tbl_body.appendChild(row);
  }

  // Append the table to HTML document
  try {
    tbl.appendChild(tbl_body);
    newHTMLDocument.body.appendChild(tbl);
  } catch(e) {
    // Error handler.
    console.log(e);
  }

  add_select(newHTMLDocument, tickerlist);
  newHTMLDocument.getElementById("select_div").innerHTML += "<input type = 'button' value ='Submit' onclick ='click_func(); return false;'>"

  // Display the HTML document in the new window
  var htmlstr = "<html>" + newHTMLDocument.documentElement.innerHTML + "</html>";
  var x = window.open()
  x.document.open()
  x.document.write(htmlstr)
  x.document.close()
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
  thisdiv.appendChild(select2);
  doc.body.appendChild(thisdiv);
}


function click_func() {
  var s1 = document.getElementById("select_list_1");
  var s2 = document.getElementById("select_list_2");
  var opt1 = s1.options[s.selectedIndex].text;
  var opt2 = s2.options[s.selectedIndex].text;
  var val1 = s1.options[s.selectedIndex].value;
  var val2 = s2.options[s.selectedIndex].value;

  if (val1 == 0 || val2 == 0) {
    alert('Please select 2 asset tickers.');
  } else {
    var newstr = opt1 + "," + opt2;
    read_2_data(newstr);
  }
}
