// sources:
//	for co2:
//		coal/naturalgas/oil: eia.gov/tools/faqs/faq.cfm?id=74&t=11
//	for consumption per kw:
//		gasoline: eia.gov/tools/faqs/faq.cfm?id=307&t=11

var energy = {};
energy.kwh = {};
energy.co2 = {};

/////////////
//// kwh ////
/////////////
energy.kwh.toLightbulbHours = function(kwh) {
	var bulb_wattage = 60;
	var bulb_kwh = bulb_wattage / 1000;
	
	return kwh / bulb_kwh;
};

energy.kwh.toGallonsOfGasoline = function(kwh) {
	var co2 = kwh * energy.co2.perKWH;
	
	return co2 / energy.co2.perGallonOfGasoline;
};

energy.kwh.toTreesPlanted = function(kwh) {
	var co2 = kwh * energy.co2.perKWH;
	
	return co2 / energy.co2.perTreePlanted;
};

energy.kwh.toWindTurbine = function(kwh) {
	var co2 = kwh * energy.co2.perKWH;
	
	return co2 / energy.co2.perWindTurbine;
};

/////////////
//// co2 ////
/////////////
energy.co2.perKWH = 1.3791;
energy.co2.perGallonOfGasoline = 17.774;
energy.co2.perBarrelOfOil = 840;
energy.co2.perTreePlanted = 78;
energy.co2.perPoundOfCoal = 1.862;
energy.co2.perTonOfWaste = 5580; // recyling the waste instead of landfilling it
energy.co2.perWindTurbine = 7266000;