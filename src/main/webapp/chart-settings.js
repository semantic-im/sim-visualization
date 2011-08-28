function chartSettingsInit() {
	$("#fromDate").datepicker({onSelect: function (dateText, inst) {console.debug("asas");}});
	$("#toDate").datepicker({onSelect: function (dateText, inst) {console.debug("asas");}});
}

function chartSettingsDisplay(chart) {
	//var chart = d3.select("#" + this.id);
	/*
	if (this.settings == null) {
		this.settings = chart
			.append("div")
			.attr("id", this.id + "Settings")
			.attr("title", "Settings")
			.text("Settings");
	}
	*/
	//var top = (+pxRegExp.exec(chart.style("top"))[1]) + this.allChartHeight / 2 - 150;
	//var left = (+pxRegExp.exec(chart.style("left"))[1]) + this.allChartWidth / 2 - 100;
	$("#chartSettings").dialog({
			title: chart.id + " settings",
			modal: true, 
			width: 500, 
			//height: 200, 
			//position: [left, top]
			position: 'center',
			buttons: {"OK" : function() {chartSettingsUpdateChart(chart);}, "Cancel" : function() {$(this).dialog("close");}}
		});
	var minDate = new Date(chart.minX);
	var maxDate = new Date(chart.maxX);
	var minFromTime = getMinFromTimeValue(minDate, maxDate);
	var maxFromTime = getMaxFromTimeValue(minDate, maxDate);
	var minToTime = getMinToTimeValue(minDate, maxDate);
	var maxToTime = getMaxToTimeValue(minDate, maxDate);
	//$("#fromDate").datepicker({onSelect: function (dateText, inst) {}});
	$("#fromDate").datepicker("setDate", minDate);
	$("#fromDate").datepicker("option", "dateFormat", "dd.mm.yy");
	$("#fromDate").datepicker("option", "minDate", minDate);
	$("#fromDate").datepicker("option", "maxDate", maxDate);
	$("#fromTimeSlider").slider({range: 'min', value: minFromTime, min: minFromTime, max: maxFromTime,
		slide: function( event, ui ) {
			$( "#fromTime" ).val( transformSliderValue(ui.value) );
		}});
	$("#fromTime").val( transformSliderValue(minFromTime) );
	//$("#toDate").datepicker({onSelect: function (dateText, inst) {console.debug("asas");}});
	$("#toDate").datepicker("setDate", maxDate);
	$("#toDate").datepicker("option", "dateFormat", "dd.mm.yy");
	$("#toDate").datepicker("option", "minDate", minDate);
	$("#toDate").datepicker("option", "maxDate", maxDate);
	$("#toTimeSlider").slider({range: 'max', value: maxToTime, min: minToTime, max: maxToTime,
		slide: function( event, ui ) {
			$( "#toTime" ).val( transformSliderValue(ui.value) );
		}});
	$("#toTime").val( transformSliderValue(maxToTime) );
}

function chartSettingsUpdateChart(chart) {
	var from = $("#fromDate").val() + " " + $("#fromTime").val();
	var to = $("#toDate").val() + " " + $("#toTime").val();
	var timeFormat = d3.time.format("%d.%m.%Y %H:%M");
	

	chart.x0 = +timeFormat.parse(from);
	chart.x1 = +timeFormat.parse(to);
	if (chart.x0 < chart.minX) {
		chart.x0 = chart.minX;
	}
	if (chart.x1 > chart.maxX) {
		chart.x1 = chart.maxX;
	}
	chart.updateFocusData();
	chart.updateFocus();
	chart.updateContext();
	
	chart.xFocus.domain([ chart.x0, chart.x1 ]);
	chart.xContext.domain([ chart.x0, chart.x1 ]);
	chart.active.attr("x", chart.xContext(chart.x0)).attr("width", chart.xContext(chart.x1) - chart.xContext(chart.x0));
	
	$("#chartSettings").dialog("close");
}

function transformSliderValue(value) {
	return Math.floor(value / 60) + ":" + ((value % 60) + "").lpad("0", 2);
}

function getMinFromTimeValue(minDate, maxDate) {
	var minHours = minDate.getHours();
	var minMinutes = minDate.getMinutes();
	var totalMinMinutes = minHours * 60 + minMinutes;
	return totalMinMinutes;
}

function getMaxFromTimeValue(minDate, maxDate) {
	var maxHours = 23;
	var maxMinutes = 59;
	if (minDate.getFullYear() == maxDate.getFullYear() && minDate.getMonth() == maxDate.getMonth() && minDate.getDate() == maxDate.getDate()) {
		maxHours = maxDate.getHours();
		maxMinutes = maxDate.getMinutes();
	}
	var totalMaxMinutes = maxHours * 60 + maxMinutes;
	return totalMaxMinutes;	
}

function getMinToTimeValue(minDate, maxDate) {
	var minHours = 0;
	var minMinutes = 0;
	if (minDate.getFullYear() == maxDate.getFullYear() && minDate.getMonth() == maxDate.getMonth() && minDate.getDate() == maxDate.getDate()) {
		minHours = minDate.getHours();
		minMinutes = minDate.getMinutes();
	}
	var totalMinMinutes = minHours * 60 + minMinutes;
	return totalMinMinutes;	
}

function getMaxToTimeValue(minDate, maxDate) {
	var maxHours = maxDate.getHours();
	var maxMinutes = maxDate.getMinutes();
	var totalMaxMinutes = maxHours * 60 + maxMinutes;
	return totalMaxMinutes;
}