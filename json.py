# json formatting
open_paren = '{ '
close_paren = ' }'

open_brace = '[ '
close_brace = ' ]'
dq = '\"' #doublequote
comma = ', '
colon = ':'
newline = "\n"


def getName(name):
	return dq + name + dq + colon


def getField(field, value, isEnd=None):
	if isEnd is None:
		isEnd = False
		
	string = getName(field) + dq + value + dq
	
	if not isEnd:
		string += comma
	
	return string


def getList(name, list):
	o = ""
	
	if name is not None:
		o = getName(name)
	
	o += open_brace
	o += dq + "\", \"".join(list) + dq
	o += close_brace

	return o


# uses parallel lists
def getObjectParallel(field_names, field_values):
	o = open_paren
	
	for field_name, field_value in field_names, field_values:
		o += getField(field_name, field_value)
	
	o = o[:-2] # removes last delimiter, ", "
	
	o += close_paren
	
	return o


# 2d list where each element is of form [name,value]
def getObject(fields):
	o = open_paren
	
	for field in fields:
		o += getField(field[0], field[1])

	o = o[:-len(comma)] # removes last delimiter, ", "
	
	o += close_paren
	
	return o