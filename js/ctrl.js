function generate_table() {
  if (document.getElementById("corr table") == null) {
    var body = document.getElementsByTagName("body")[0];
    var table = document.createElement("table");
    var tbl_body = document.createElement("tbody");

    table.appendChild(tbl_body);
    table.setAttribute("id", "corr table");
    body.appendChild(table);

    // Add function to read the correlation Matrix

    // Ajax solution
    $(document).ready(function() {
        $.ajax({
            type: "GET",
            url: "./sample.csv",
            dataType: "text",
            success: function(data) { alert(data); }
         });
    });

    // Read csv as string

    // Split the csv string to get csv content

    import_corr(ticker_list);
  }
  else {
    console.log("Already created.")
  }
}

ticker_list = ['AAPL US Equity', 'AMZN US Equity','VIX Index'];

function import_corr(ticker_list){
  var tbl_body = document.getElementById("corr table").getElementsByTagName("tbody")[0];
  for (var i = 0; i < ticker_list.length + 1; i++){
    var row = document.createElement("tr"); //this row
    for (var j = 0; j < ticker_list.length + 1; j++){
      var cell = document.createElement("td");
      if (i == 0 & j == 0) { cell.innerHTML = ""; }
      else if (i == 0) { cell.innerHTML = ticker_list[j-1]; }
      else if (j == 0) { cell.innerHTML = ticker_list[i-1]; }
      else { cell.innerHTML = 0.1 }
      row.appendChild(cell);
    }
    tbl_body.appendChild(row);
  }
}

function split_data(data_text){
  var all_lines = data_text.split(/\r\n|\n/);
  var lines = []
  for (var i = 0; i < all_lines.length; i++) {
    lines.push(all_lines[i]);
  }
}
