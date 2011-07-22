var IO_READ = 'http://www.larkc.eu/ontologies/IMOntology.rdf#IORead',
	IO_WRITE = 'http://www.larkc.eu/ontologies/IMOntology.rdf#IOWrite',
	IDLE_CPU_LOAD = 'http://www.larkc.eu/ontologies/IMOntology.rdf#IdleCPULoad',
	IDLE_CPU_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#IdleCPUTime',
	IRQ_CPU_LOAD = 'http://www.larkc.eu/ontologies/IMOntology.rdf#IrqCPULoad',
	IRQ_CPU_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#IrqCPUTime',
	SWAP_IN = 'http://www.larkc.eu/ontologies/IMOntology.rdf#SwapIn',
	SWAP_OUT = 'http://www.larkc.eu/ontologies/IMOntology.rdf#SwapOut',
	SYSTEM_CPU_LOAD = 'http://www.larkc.eu/ontologies/IMOntology.rdf#SystemCPULoad',
	SYSTEM_CPU_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#SystemCPUTime',
	SYSTEM_LOAD_AVERAGE = 'http://www.larkc.eu/ontologies/IMOntology.rdf#SystemLoadAverage',
	SYSTEM_OPEN_FILE_DESCRIPTOR_COUNT = 'http://www.larkc.eu/ontologies/IMOntology.rdf#SystemOpenFileDescriptorCount',
	TOTAL_SYSTEM_FREE_MEMORY = 'http://www.larkc.eu/ontologies/IMOntology.rdf#TotalSystemFreeMemory',
	TOTAL_SYSTEM_USED_MEMORY = 'http://www.larkc.eu/ontologies/IMOntology.rdf#TotalSystemUsedMemory',
	TOTAL_SYSTEM_USED_SWAP = 'http://www.larkc.eu/ontologies/IMOntology.rdf#TotalSystemUsedSwap',
	USER_CPU_LOAD = 'http://www.larkc.eu/ontologies/IMOntology.rdf#UserCPULoad',
	USER_CPU_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#UserCPUTime',
	WAIT_CPU_LOAD = 'http://www.larkc.eu/ontologies/IMOntology.rdf#WaitCPULoad',
	WAIT_CPU_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#WaitCPUTime';

var PROCESS_TOTAL_CPU_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#ProcessTotalCPUTime',
	THREAD_BLOCK_COUNT = 'http://www.larkc.eu/ontologies/IMOntology.rdf#ThreadBlockCount',
	THREAD_BLOCK_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#ThreadBlockTime',
	THREAD_COUNT = 'http://www.larkc.eu/ontologies/IMOntology.rdf#ThreadCount',
	THREAD_GCC_COUNT = 'http://www.larkc.eu/ontologies/IMOntology.rdf#ThreadGccCount',
	THREAD_GCC_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#ThreadGccTime',
	THREAD_SYSTEM_CPU_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#ThreadSystemCPUTime',
	THREAD_TOTAL_CPU_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#ThreadTotalCPUTime',
	THREAD_USER_CPU_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#ThreadUserCPUTime',
	THREAD_WAIT_COUNT = 'http://www.larkc.eu/ontologies/IMOntology.rdf#ThreadWaitCount',
	THREAD_WAIT_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#ThreadWaitTime',
	WALL_CLOCK_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#WallClockTime';

var systemMetrics = [IO_READ, 
                     IO_WRITE,
                     IDLE_CPU_LOAD,
                     IDLE_CPU_TIME,
                     IRQ_CPU_LOAD,
                     IRQ_CPU_TIME,
                     SWAP_IN,
                     SWAP_OUT,
                     SYSTEM_CPU_LOAD,
                     SYSTEM_CPU_TIME,
                     SYSTEM_LOAD_AVERAGE,
                     SYSTEM_OPEN_FILE_DESCRIPTOR_COUNT,
                     TOTAL_SYSTEM_FREE_MEMORY,
                     TOTAL_SYSTEM_USED_MEMORY,
                     TOTAL_SYSTEM_USED_SWAP,
                     USER_CPU_LOAD,
                     USER_CPU_TIME,
                     WAIT_CPU_LOAD,
                     WAIT_CPU_TIME
                    ];

var methodMetrics = [ PROCESS_TOTAL_CPU_TIME,
                  	THREAD_BLOCK_COUNT,
                	THREAD_BLOCK_TIME,
                	THREAD_COUNT,
                	THREAD_GCC_COUNT,
                	THREAD_GCC_TIME,
                	THREAD_SYSTEM_CPU_TIME,
                	THREAD_TOTAL_CPU_TIME,
                	THREAD_USER_CPU_TIME,
                	THREAD_WAIT_COUNT,
                	THREAD_WAIT_TIME,
                	WALL_CLOCK_TIME];

var clientWidth = window.innerWidth - 20,//document.all.ontoview.clientWidth,
	clientHeight = window.innerHeight - 20,//document.all.ontoview.clientHeight;
	clientTop = 10,
	clientLeft = 10;
	//fill = d3.scale.category10();

if (clientWidth < 800) {
	clientWidth = 800;
}
if (clientHeight < 600) {
	clientHeight = 600;
}
//console.debug(w);
//console.debug(h);

function validID(id) {
	return id.replace("#", "_").replace(new RegExp("\\.", "g"), "").replace(new RegExp("/", "g"), "").replace(new RegExp(":", "g"), "").replace(new RegExp("\\$", "g"), "_");
}
