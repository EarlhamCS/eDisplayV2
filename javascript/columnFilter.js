// to use this class as a column filter, do the following:
// 1) include the "controls" package in your google.load() call
// 2) include this JS file in your html
// 3) add a div for the column filter and give it an ID
// 4) call intialize using your arguments

// chart uses the filtered columns; can be an array of charts
// datatable is used for calculations
// filter_id is the HTML ID of where you want the filter to be placed
columnFilter = function(_view, _datatable, filter_id) {
	// variables
	if(_view) {
		this.view = [].concat(_view);
	} else {
		this.view = [];
	}

	// I don't know how this works, giyf, but it does this:
	// gets state of the filter
	// creates an array from the state with indexes that correlate to datatable
	// sets charts to only display the selected columns
	this.setView = function() {
    		var state = this.filter.getState();
    		var row;
    		var columnIndices = [0];
    		
    		// iterate through selected values and translate them into indexes
    		for (var i = 0; i < state.selectedValues.length; i++) {
        		row = this.table.getFilteredRows([{column: 1, value: state.selectedValues[i]}])[0];
        		columnIndices.push(this.table.getValue(row, 0));
    		}
    		
    		// sort the indices into their original order
    		columnIndices.sort(function (a, b) {
        		return (a - b);
    		});

		// iterate through views and set their columns to the selected columns
		for(i = 0; i < this.view.length; i++) {
    			this.view[i].setColumns(columnIndices);
    		}
	};

	// this is a hacky fix	
	// makes the entire button clickable
	// originally there's just an X that's clickable, and I hated that
	// so I added the button's label to the clickable portion
	this.makeContentClickable = function() {
		//var ul = $(document).getElementsByClassName('google-visualization-controls-categoryfilter-selected')[0];
		//var ulButtons = $(ul).getElementsByClassName('charts-link-button');
		//var ulContent = $(ul).getElementsByClassName('charts-control');
		var ul = $('.google-visualization-controls-categoryfilter-selected');
		var ulButtons = $('.charts-link-button').toArray();
		var ulContent = $('.charts-control').toArray();

		// gets rid of any default formatting on the ul
		ul.css('max-width', '');

		for(i = 0; i < ulButtons.length; i++) {
			// x is what the button defaults to
			if(ulButtons[i].innerHTML == 'x') {
				// we get rid of the x by setting it to the content
				ulButtons[i].innerHTML = ulContent[i].innerHTML;
				
				// now that x has the content, clear the content
				ulContent[i].innerHTML = '';
			}
		}
	};

	this.setData = function(_datatable) {
		this.datatable = _datatable;
		this.table = new google.visualization.DataTable();
		this.initState = {selectedValues: []};
		
		// add columns to table
		this.table.addColumn('number', 'colIndex');
		this.table.addColumn('string', 'colLabel');
	
		// get columns from the datatable (skips column 0)
		for (var i = 1; i < this.datatable.getNumberOfColumns(); i++) {
			this.table.addRow([i, this.datatable.getColumnLabel(i)]);
			this.initState.selectedValues.push(this.datatable.getColumnLabel(i));
		}
	};
	
	this.declareFilter = function() {
		if(!this.filter) {
			this.filter = new google.visualization.ControlWrapper(this.columnFilterOptions);
			this.filter.draw();
		
			// on change, fix buttons again
			google.visualization.events.addListener(this.filter, 'statechange', this.makeContentClickable);
		} else {
			this.filter.setDataTable(this.table);
		}

		// inititalize view
		this.setView();

		//console.log("am declaring the filter");		
		
		// fix buttons
		this.makeContentClickable();
	};



	/// CONSTRUCTOR ///

	// initialize data
	this.setData(_datatable);

	// this.table needs to be initialized for use below
	this.columnFilterOptions = {
		controlType: 'CategoryFilter',
		containerId: filter_id,
		dataTable: this.table,
		options: {
			filterColumnLabel: 'colLabel',
			ui: {
            			label: '',
            			labelSeparator: '',
            			caption: 'areas',
            			allowNone: false,
            			allowTyping: false,
            			allowMultiple: true,
            			selectedValuesLayout: 'belowStacked'
        		}
    		},
   	 	state: this.initState
	};
	
	// initialize the filter
	this.declareFilter();
}