// Provides a relatively simple class for declaring a category filter.
// I created it for files, but it should be more flexible than that.

function listFilter(_container, array) {
	this.container = _container;

	this.setData = function(array) {
		this.items = array;
		this.table = new google.visualization.DataTable();
		
		this.table.addColumn('string', "Files");	
		this.table.addRows(this.items.length);
		for(i = 0; i < this.items.length; i++) {
			this.table.setCell(i, 0, this.items[i]);
		}

		if(!this.filter) {		
			this.filter = new google.visualization.ControlWrapper({
				controlType: 'CategoryFilter',
				containerId: this.container,
				dataTable: this.table,
				options: {
					filterColumnLabel: 'Files',
					ui: {
						label: '',
						labelSeparator: '',
						caption: 'files',
						allowNone: false,
						allowTyping: false,
						allowMultiple: false,
						selectedValuesLayout: 'belowStacked'
					}
				}
			});
		} else {
			this.filter.setDataTable(this.table);
		}
	};
	
	// initialize data
	this.setData(array);
	
	// initialize draw
	this.filter.draw();
	
	// gets the currently selected object
	// it does this by matching up the selectedValue string to
	// the corresponding string in the files list
	this.getSelected = function() {
		var state = this.filter.getState();
		var selected = state.selectedValues[0];
		
		return selected;
	};

	this.setSelected = function(value) {
		this.filter.setState({
			'selectedValues':[value]
		});
	};
	
}