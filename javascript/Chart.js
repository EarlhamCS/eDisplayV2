// TODO add delimiter to file
// required libraries:
// 	helper.js
//	io.js


Chart = function(file, id, options, colors, filterID) {
	this.file;

	this.chart;
	this.id;
	this.options;
	
	this.table;
	this.view;

	this.column_colors;
	this.column_filter;

	this.selected;
	this.colors;
	this.used_colors;
	this.useGlobalMaximum;

	this.initialize = function(file, id, options, colors, filterID) {
		this.id = id;
		this.options = options;
		this.colors = colors;
		this.filterID = filterID;
		
		this.setFile(file)
	}

	this.setFile = function(file) {
		this.file = file;

		if(!this.file.data) {
			this.file.data = this.getData(this.file);
		}
		
		this.setData(this.file.data);

		this.loadData(this.options);
	}
	
	// gets data and casts it to a csv array
	this.getData = function(file) {
		var text = io.getData(file.string);
		var data = io.csvToArray(text, ", "); //TODO file.delimiter);

		// type data
		data = helper.castData(data, this.file.isDate);
		
		return data;
	}

	// gets data, casts it corrently, creates a datatable,
	// formats the datatable and creates a dataview
	this.setData = function(data) {
		// make datatable
		this.table = new google.visualization.arrayToDataTable(this.file.data);
		helper.formatNumbers(this.table, {pattern:"#,##0.00 kw/h"}, 1);
		this.view = new google.visualization.DataView(this.table);
	
		// TODO: does the column filter play well with column label changes?
		if(this.column_filter) {
			this.column_filter.view[0] = this.view;
		}
	}
	
	// loads data from the file and performs initialization
	this.loadData = function(options) {
		this.options = options;
	
		// create charts
	        this.chart = new google.visualization.ChartWrapper(this.options);
		google.visualization.events.addListener(this.chart, 'error', helper.errorHandler);
		
		helper.setChartMaximum(this.useGlobalMaximum, this.chart, 0, file.max);
	        
	        // if default chartType exists, change to it
	        if(this.file.chartType)
			this.chart.setChartType(this.file.chartType);
	
		// set chart filter
		if(typeof filterID != "undefined" && filterID != "") {
			if(!this.column_filter) {
				// initialize filter
				this.column_filter = new columnFilter(this.view, this.table, filterID);
			} else {
				this.column_filter.setData(this.table);
				this.column_filter.declareFilter();
			}
		}

		// set colors
		this.columnChange();
	}
	
	// refresh column filter with changes
	this.columnChange = function() {
		if(this.column_filter) {
			this.column_filter.setView();
		
			// get selected columns
			this.selected = this.column_filter.filter.getState().selectedValues
			log.message(log.prefix("selected columns", this.selected), log.methods.info);

			// correct the color of series
			this.setColors(this.selected, this.colors);
		}
		
	}

	this.setColors = function(selected, colors) {
		var col_labels = [];
	
		// iterate through columns
		// if selected, push onto stack in original order
		for(i = 1; i < this.table.getNumberOfColumns(); i++) {
			if($.inArray(this.table.getColumnLabel(i), selected) != -1) {
				col_labels.push(this.table.getColumnLabel(i));
			}
		}
		
		// get an array of colors parallel to the column labels
		this.used_colors = helper.getUsedColors(col_labels, colors);
		this.chart.setOption("colors", this.used_colors);
	}
	
	this.toggleGlobalMaximum = function() {
		this.useGlobalMaximum = !this.useGlobalMaximum;
		helper.setChartMaximum(this.chart, this.useGlobalMaximum);
	}

	// data can be a table or a view
	this.draw = function(data) {
		this.chart.draw(data);
	}
	
	/// MAIN ///
	this.initialize(file, id, options, colors, filterID);
}