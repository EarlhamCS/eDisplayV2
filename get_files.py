#!/usr/bin/python
# documentation needs refined and code refactored

# could be improved in the following ways:
# * making each filename an object
# * composed of the directory prefix, the file name, and the formatted name
# * the formatted name is:
#		strip attachments suffixes (.csv)
#		convert _ and - characters into spaces
#		force capitalization
# * other file attributes could be added if relevant, but this is a good start

import os, re

dir = "data/"

# returns file's full directory path from current os.path
def listdir_fullpath(d):
	return [os.path.join(d, f) for f in os.listdir(d)]

# returns true if a directory exists in an array
def hasDirectory(files):
	for f in files:
		if os.path.isdir(f):
			return True
			
	return False

# recursively iterate through directories
def getAllFiles(files):
	while hasDirectory(files):
		for f in files:
			if os.path.isdir(f):
				files += listdir_fullpath(f)
				files.remove(f)

# gets lines from file
# splits by delim
# removes header and first column if desired
def getLines(file, delim, removeHeader, removeFirstColumn):	
	f = open(file, 'r')
	lines = f.readlines()
	
	if removeHeader:
		lines.remove(lines[0])
	
	for i in range(len(lines)):
		lines[i] = lines[i].replace("\n", "")
		lines[i] = lines[i].split(delim)

		if removeFirstColumn:
			lines[i].remove(lines[i][0])

	return lines

# gets largest value in 2d list
def getMax(lines):
	f_max = 0
	
	# get first non-null value
	for line in lines:
		for token in line:
			if token != '':
				f_max = float(token)
	
	# iterate through all values for maximum value
	for line in lines:
		for token in line:
			if token != '':
				token = float(token)

				if token > f_max:
					f_max = token
	
	return f_max


# returns full word for aggregate
# doesn't support multiples
def getAggregate(file):
	if "avg" in file:
		return "average"
	elif "min" in file:
		return "minimum"
	elif "max" in file:
		return "maximum"
	elif "sum" in file:
		return "sum"
	elif "variance" in file:
		return "variance"
	elif "stddev" in file:
		return "standard deviation"
	else:
		return ""

# return matches GoogleCharts naming format
# doesn't support multiples
def getChartType(file):
	tokens = file.split()
	
	if "scatter" in file:
		return "ScatterChart"
	elif "combo" in file:
		return "ComboChart"
	elif "column" in file:
		return "ColumnChart"
	elif "area" in file:
		return "AreaChart"
	elif "line" in file:
		return "LineChart"
	else:
		return "LineChart"


# get appropriate range in days for interval
#TODO: rewrite using arrays because duh
def getRange(isDate, formatted):
	result = "all"

	if not isDate:
		if "dom" in formatted:
			result = "31"
		elif "dow" in formatted:
			result = "7"
		elif "doy" in formatted:
			result = "366"
		elif "hod" in formatted:
			result = "24"
		elif "moy" in formatted:
			result = "12"
		elif "woy" in formatted:
			result = "53"
		else:
			result = "all"
	else:
		if "hour" in formatted:
			result = "2"
		elif "day" in formatted:
			result = "14"
		elif "week" in formatted:
			result = "366"
		elif "month" in formatted:
			result = "722"
		elif "year" in formatted:
			result = "all"
		else:
			result = "all"
		
	return result
	


# formats a file string into something readable by the laymen
#TODO: change all space / empty string replaces to be executed from arrays
## other values can be stored in a parallel array
#TODO: wy not just substring the time interval?
def format(file):
	# replace linux spaces with actual spaces
	file = file.replace("-", " ")
	file = file.replace("_", " ")
	
	# replace attachments
	file = file.replace(".csv", "")
	
	# replace directory character
	file = file.replace('/', " ")
	
	# replace field names
	file = file.replace("preal", "")

	# tags that're useful on the backend but not for users
	# charttype
	file = file.replace("scatter", "")
	file = file.replace("combo", "")
	file = file.replace("area", "")
	file = file.replace("line", "")
	file = file.replace("all", "")
	file = file.replace("data", "")
	# datatype
	file = file.replace("truncate", "")
	file = file.replace("extract", "")
	file = file.replace("dates", "")
	file = file.replace("default", "")	
	# aggregate type
	file = file.replace("avg", "")
	file = file.replace("variance", "")
	file = file.replace("stddev", "")
	file = file.replace("min", "")
	file = file.replace("max", "")
	file = file.replace("sum", "")

	# removes unnecessary whitespace
	file = file.split()
	file = ' '.join(file)

	# replace acronyms
	file = file.replace("dow", "day of week")
	file = file.replace("doy", "day of year")
	file = file.replace("hod", "hour of day")
	file = file.replace("woy", "week of year")
	file = file.replace("dom", "day of month")
	file = file.replace("moy", "month of year")
	file = file.replace("qoy", "quarter of year")

	return file


def isDate(file):
	return "numeric" not in file


def isDefault(file):
	return "default" in file


def getFiles(dir, regex_format):
	# get all files in dir
	files = listdir_fullpath(dir)
	getAllFiles(files)

	# filter files via regex
	regex = re.compile(regex_format)
	matches = [string for string in files if re.match(regex, str(string), re.IGNORECASE)]
	files = matches

	return files


def getAggregates(files):
	# declarations
	unformatted_files = files
	files = []
	aggregates = []

	for f in unformatted_files:
		# get unique files
		f_string = format(f)
		if f_string not in files:
			files.append(str(f_string))
			aggregates.append([])

		# and create an array of their aggregates
		f_agg = getAggregate(f)
		f_index = files.index(f_string)
		if f_agg not in aggregates[f_index]:
			aggregates[f_index].append(f_agg)

	return [files, aggregates]


regex_format = '(.*)\.csv(.*)'
file_selections = "files.csv"
file_data = "file_data.csv"

files = getFiles(dir, regex_format)

agg = getAggregates(files)
distinct_files = agg[0]
aggregates = agg[1]

o = ""
for f in distinct_files:
	o += f + ', '
	o += ', '.join(aggregates[distinct_files.index(f)])
	o += '\n'
o = o[:-len('\n')]

f = open(file_selections, 'w')
f.write(o)
	
# one file per line
# o = '\n'.join(files)

# this is some voodoo magic
# declares a 3d array
# sorts files by filetype and aggregate
# sorted_files[0] = first filetype
# sorted_files[0][0] = first filetype first aggregate
# sorted_files[0][0][0] = ... aggregate type
# sorted_files[0][0][1] = ... fields for the file
sorted_files = [\
		[[] for j in range(len(aggregates[i]))] \
		for i in range(len(aggregates))\
	]

headers = [\
		"string", "formatted", "max",\
		"aggregate", "chartType", "isDefault",\
		"isDate", "interval"\
	]

for f in files:
	f_format = format(f)
	f_index = distinct_files.index(f_format)
	f_agg = getAggregate(f)
	f_isDate = isDate(f)
	f_range = getRange(f_isDate, f_format)
	f_chartType = getChartType(f)
	
	max = getMax(getLines(f, ", ", True, True))
	
	fields =[\
			f, f_format, str(max),\
			f_agg, f_chartType, str(isDefault(f)),\
			str(f_isDate), str(f_range)\
		]

	sorted_files[f_index][aggregates[f_index].index(f_agg)] = fields

o = ", ".join(headers) + "\n"
for filetype in sorted_files:
	for aggregate in filetype:
		o += ", ".join(aggregate) + "\n"

f = open(file_data, 'w')
f.write(o)