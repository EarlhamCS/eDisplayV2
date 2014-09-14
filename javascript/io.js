var io = {};

io.csvToArray = function(csv, delimiter, limit) {
        var lines = csv.split('\n');

	// remove empty lines	
	for(i = 0; i < lines.length; i++) {
		if(lines[i] == "" || !lines[i].match(/[^\s]/)) {
			lines.splice(i,1);
		}
	}
	
	// split individual lines
        for(var i = 0; i < lines.length; i++) {
        	if(limit)
        		lines[i] = lines[i].split(delimiter, limit);
        	else
                	lines[i] = lines[i].split(delimiter);
        }

        return lines;
};

io.getCsvArray = function(path, delimiter) {
        var csv = $.ajax({
        	'type':'GET',
                'url': path,
                'dataType': 'csv',
                'async': false
        }).responseText;

        return io.csvToArray(csv, delimiter);
};

io.getData = function(path) {
	var response = $.ajax({
		'type':'GET',
		'url': path,
		'async': false
	}).responseText;
	
	return response;
};