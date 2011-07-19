function drawCircle(canvas) {
	var context = canvas.getContext('2d');
	//context.fillStyle  = "rgba(255, 0, 0, 1)";
	context.fillStyle  = "#ff7f0e";
	context.beginPath();
	context.arc(8, 8, 8, 0, Math.PI*2, true); 
	context.closePath();
	context.fill();		
}


var chart1;

function getLabel(metric) {
	if (metric == IO_READ) {
		return 'IO Read';
	} else if (metric == IO_WRITE) {
		return 'IO Write';
	} else if (metric == IDLE_CPU_LOAD) {
		return 'Idle CPU Load';
	} else if (metric == IDLE_CPU_TIME) {
		return 'Idle CPU Time';
	} else if (metric == IRQ_CPU_LOAD) {
		return 'Irq CPU Load';
	} else if (metric == IRQ_CPU_TIME) {
		return 'Irq CPU Time';
	} else if (metric == SWAP_IN) {
		return 'Swap In';
	} else if (metric == SWAP_OUT) {
		return 'Swap Out';
	} else if (metric == SYSTEM_CPU_LOAD) {
		return 'System CPU Load';
	} else if (metric == SYSTEM_CPU_TIME) {
		return 'System CPU Time';
	} else if (metric == SYSTEM_LOAD_AVERAGE) {
		return 'System Load Average';
	} else if (metric == SYSTEM_OPEN_FILE_DESCRIPTOR_COUNT) {
		return 'System open file descriptor count';
	} else if (metric == TOTAL_SYSTEM_FREE_MEMORY) {
		return 'Total System Free Memory';
	} else if (metric == TOTAL_SYSTEM_USED_MEMORY) {
		return 'Total System Used Memory';
	} else if (metric == TOTAL_SYSTEM_USED_SWAP) {
		return 'Total System Used Swap';
	} else if (metric == USER_CPU_LOAD) {
		return 'User CPU Load';
	} else if (metric == USER_CPU_TIME) {
		return 'User CPU Time';
	} else if (metric == WAIT_CPU_LOAD) {
		return 'Wait CPU Load';
	} else if (metric == WAIT_CPU_TIME) {
		return 'Wait CPU Time';
	}
}

$(function() {
	var metricsSelector = d3.select("#metrics-selector");
	metricsSelector.append("table");
	var tr = metricsSelector.append("tr");
	for (var i = 0; i < systemMetrics.length; i++) {
		var td = tr.append("td");
		var systemMetricId = validID(systemMetrics[i]);
		var div = td.append("div")
			.attr("id",  systemMetricId + "Container")
			.attr("class",  "metric-container");
		div.append("canvas")
			.attr("id", systemMetricId + "Icon")
			.attr("width", "16")
			.attr("height", "16")
			.attr("class", "metric-icon");
		div.append("span")
			.attr("class", "metric-label")
			.text(getLabel(systemMetrics[i]));
		
		drawCircle($('#' + systemMetricId + 'Icon')[0]);
		
		$('#' + systemMetricId + 'Container').draggable({
			helper: 'clone', 
			opacity: 0.7});
		if ((i + 1) % 4 == 0) {
			tr = metricsSelector.append("tr");
		}
	}
	
	/*
	drawCircle($('#ioReadIcon')[0]);
	drawCircle($('#ioWriteIcon')[0]);
	drawCircle($('#idleCPULoadIcon')[0]);
	
	$("#ioReadContainer").draggable({
		helper: 'clone', 
		opacity: 0.7});
	$("#ioWriteContainer").draggable({
		helper: 'clone', 
		opacity: 0.7});
	$("#idleCPULoadContainer").draggable({
		helper: 'clone', 
		opacity: 0.7});
	*/
	
	$( "#chart1" ).droppable({
		drop: function( event, ui ) {
			var sourceId = ui.draggable.attr("id");
			var metric = null;
			if (sourceId == validID(IO_READ) + "Container") {
				metric = IO_READ;
			} else if (sourceId == validID(IO_WRITE) + "Container") {
				metric = IO_WRITE;
			} else if (sourceId == validID(IDLE_CPU_LOAD) + "Container") {
				metric = IDLE_CPU_LOAD;
			} else if (sourceId == validID(IDLE_CPU_TIME) + "Container") {
				metric = IDLE_CPU_TIME;
			} else if (sourceId == validID(IRQ_CPU_LOAD) + "Container") {
				metric = IRQ_CPU_LOAD;
			} else if (sourceId == validID(IRQ_CPU_TIME) + "Container") {
				metric = IRQ_CPU_TIME;
			} else if (sourceId == validID(SWAP_IN) + "Container") {
				metric = SWAP_IN;
			} else if (sourceId == validID(SWAP_OUT) + "Container") {
				metric = SWAP_OUT;
			} else if (sourceId == validID(SYSTEM_CPU_LOAD) + "Container") {
				metric = SYSTEM_CPU_LOAD;
			} else if (sourceId == validID(SYSTEM_CPU_TIME) + "Container") {
				metric = SYSTEM_CPU_TIME;
			} else if (sourceId == validID(SYSTEM_LOAD_AVERAGE) + "Container") {
				metric = SYSTEM_LOAD_AVERAGE;
			} else if (sourceId == validID(SYSTEM_OPEN_FILE_DESCRIPTOR_COUNT) + "Container") {
				metric = SYSTEM_OPEN_FILE_DESCRIPTOR_COUNT;
			} else if (sourceId == validID(TOTAL_SYSTEM_FREE_MEMORY) + "Container") {
				metric = TOTAL_SYSTEM_FREE_MEMORY;
			} else if (sourceId == validID(TOTAL_SYSTEM_USED_MEMORY) + "Container") {
				metric = TOTAL_SYSTEM_USED_MEMORY;
			} else if (sourceId == validID(TOTAL_SYSTEM_USED_SWAP) + "Container") {
				metric = TOTAL_SYSTEM_USED_SWAP;
			} else if (sourceId == validID(USER_CPU_LOAD) + "Container") {
				metric = USER_CPU_LOAD;
			} else if (sourceId == validID(USER_CPU_TIME) + "Container") {
				metric = USER_CPU_TIME;
			} else if (sourceId == validID(WAIT_CPU_LOAD) + "Container") {
				metric = WAIT_CPU_LOAD;
			} else if (sourceId == validID(WAIT_CPU_TIME) + "Container") {
				metric = WAIT_CPU_TIME;
			}
			
			chart1.addMetricToChart(metric);
			/*
			$( this )
				.addClass( "ui-state-highlight" )
					.html( ui.draggable.attr('id') );
			*/
		}
	});
	
	chart1 = new Chart();
	chart1.init();
});

