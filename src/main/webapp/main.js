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

var PLATFORM_AVG_CPU_USAGE = 'http://www.larkc.eu/ontologies/IMOntology.rdf#PlatformAvgCPUUsage',
	PLATFORM_CPU_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#PlatformCPUTime',
	PLATFORM_CPU_USAGE = 'http://www.larkc.eu/ontologies/IMOntology.rdf#PlatformCPUUsage',
	PLATFORM_MEMORY_USAGE = 'http://www.larkc.eu/ontologies/IMOntology.rdf#PlatformUsedMemory',
	PLATFORM_GCC_COUNT = 'http://www.larkc.eu/ontologies/IMOntology.rdf#PlatformGccCount',
	PLATFORM_GCC_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#PlatformGccTime',
	PLATFORM_UPTIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#PlatformUptime';

var PLUGIN_INSTANCE_CREATION = 'http://www.larkc.eu/ontologies/IMOntology.rdf#PluginInstanceCreationPerTimeInterval',
	PLUGIN_METHOD_INVOCATION = 'http://www.larkc.eu/ontologies/IMOntology.rdf#PluginMethodInvocationPerTimeInterval',
	QUERIES_PER_TIME_INTERVAL = 'http://www.larkc.eu/ontologies/IMOntology.rdf#QueriesPerTimeInterval',
	QUERIES_WITH_EXECUTION_TIME_IN_RANGE = 'http://www.larkc.eu/ontologies/IMOntology.rdf#QueriesWithExecutionTimeInRangePerTimeInterval',
	QUERY_FAILURE_RATE = 'http://www.larkc.eu/ontologies/IMOntology.rdf#QueryFailureRatePerTimeInterval',
	QUERY_SUCCESS_RATE = 'http://www.larkc.eu/ontologies/IMOntology.rdf#QuerySuccessRatePerTimeInterval',
	WORKFLOW_AVG_DURATION = 'http://www.larkc.eu/ontologies/IMOntology.rdf#WorkflowAvgDurationPerTimeInterval',
	WORKFLOW_AVG_NODES = 'http://www.larkc.eu/ontologies/IMOntology.rdf#WorkflowAvgNodesPerTimeInterval',
	WORKFLOW_AVG_THREADS = 'http://www.larkc.eu/ontologies/IMOntology.rdf#WorkflowAvgThreadsPerTimeInterval',
	WORKFLOWS = 'http://www.larkc.eu/ontologies/IMOntology.rdf#WorkflowsPerTimeInterval';

var PLUGIN_BEGIN_EXECUTION_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#PluginBeginExecutionTime',
	PLUGIN_END_EXECUTION_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#PluginEndExecutionTime',
	PLUGIN_ERROR_STATUS = 'http://www.larkc.eu/ontologies/IMOntology.rdf#PluginErrorStatus',
	PLUGIN_PROCESS_TOTAL_CPU_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#PluginProcessTotalCPUTime',
	PLUGIN_THREAD_BLOCK_COUNT = 'http://www.larkc.eu/ontologies/IMOntology.rdf#PluginThreadBlockCount',
	PLUGIN_THREAD_BLOCK_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#PluginThreadBlockTime',
	PLUGIN_THREAD_COUNT = 'http://www.larkc.eu/ontologies/IMOntology.rdf#PluginThreadCount',
	PLUGIN_THREAD_GCC_COUNT = 'http://www.larkc.eu/ontologies/IMOntology.rdf#PluginThreadGccCount',
	PLUGIN_THREAD_GCC_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#PluginThreadGccTime',
	PLUGIN_THREAD_SYSTEM_CPU_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#PluginThreadSystemCPUTime',
	PLUGIN_THREAD_TOTAL_CPU_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#PluginThreadTotalCPUTime',
	PLUGIN_THREAD_USER_CPU_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#PluginThreadUserCPUTime',
	PLUGIN_THREAD_WAIT_COUNT = 'http://www.larkc.eu/ontologies/IMOntology.rdf#PluginThreadWaitCount',
	PLUGIN_THREAD_WAIT_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#PluginThreadWaitTime',
	PLUGIN_TOTAL_RESPONSE_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#PluginTotalResponseTime',
	QUERY_BEGIN_EXECUTION_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#QueryBeginExecutiontime',
	QUERY_CONTENT = 'http://www.larkc.eu/ontologies/IMOntology.rdf#QueryContent',
	QUERY_DATASET_SOURCES_NB = 'http://www.larkc.eu/ontologies/IMOntology.rdf#QueryDatasetSourcesNb',
	QUERY_END_EXECUTION_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#QueryEndExecutionTime',
	QUERY_ERROR_STATUS = 'http://www.larkc.eu/ontologies/IMOntology.rdf#QueryErrorStatus',
	QUERY_NAMESPACE_NB = 'http://www.larkc.eu/ontologies/IMOntology.rdf#QueryNamespaceNb',
	QUERY_OPERATORS_NB = 'http://www.larkc.eu/ontologies/IMOntology.rdf#QueryOperatorsNb',
	QUERY_PROCESS_TOTAL_CPU_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#QueryProcessTotalCPUTime',
	QUERY_RESULT_LIMIT_NB = 'http://www.larkc.eu/ontologies/IMOntology.rdf#QueryResultLimitNb',
	QUERY_RESULT_OFFSET_NB = 'http://www.larkc.eu/ontologies/IMOntology.rdf#QueryResultOffsetNb',
	QUERY_RESULT_ORDERING_NB = 'http://www.larkc.eu/ontologies/IMOntology.rdf#QueryResultOrderingNb',
	QUERY_RESULT_SIZE_IN_CHARACTERS = 'http://www.larkc.eu/ontologies/IMOntology.rdf#QueryResultSizeInCharacters',
	QUERY_SIZE_IN_CHARACTERS = 'http://www.larkc.eu/ontologies/IMOntology.rdf#QuerySizeInCharacters',
	QUERY_THREAD_BLOCK_COUNT = 'http://www.larkc.eu/ontologies/IMOntology.rdf#QueryThreadBlockCount',
	QUERY_THREAD_BLOCK_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#QueryThreadBlockTime',
	QUERY_THREAD_COUNT = 'http://www.larkc.eu/ontologies/IMOntology.rdf#QueryThreadCount',
	QUERY_THREAD_GCC_COUNT = 'http://www.larkc.eu/ontologies/IMOntology.rdf#QueryThreadGccCount',
	QUERY_THREAD_GCC_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#QueryThreadGccTime',
	QUERY_THREAD_SYSTEM_CPU_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#QueryThreadSystemCPUTime',
	QUERY_THREAD_TOTAL_CPU_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#QueryThreadTotalCPUTime',
	QUERY_THREAD_USER_CPU_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#QueryThreadUserCPUTime',
	QUERY_THREAD_WAIT_COUNT = 'http://www.larkc.eu/ontologies/IMOntology.rdf#QueryThreadWaitCount',
	QUERY_THREAD_WAIT_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#QueryThreadWaitTime',
	QUERY_TOTAL_RESPONSE_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#QueryTotalResponseTime',
	QUERY_VARIABLES_NB = 'http://www.larkc.eu/ontologies/IMOntology.rdf#QueryVariablesNb',
	WORKFLOW_NUMBER_OF_PLUGINS = 'http://www.larkc.eu/ontologies/IMOntology.rdf#WorkflowNumberOfPlugins',
	WORKFLOW_PROCESS_TOTAL_CPU_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#WorkflowProcessTotalCPUTime',
	WORKFLOW_THREAD_BLOCK_COUNT = 'http://www.larkc.eu/ontologies/IMOntology.rdf#WorkflowThreadBlockCount',
	WORKFLOW_THREAD_BLOCK_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#WorkflowThreadBlockTime',
	WORKFLOW_THREAD_COUNT = 'http://www.larkc.eu/ontologies/IMOntology.rdf#WorkflowThreadCount',
	WORKFLOW_THREAD_GCC_COUNT = 'http://www.larkc.eu/ontologies/IMOntology.rdf#WorkflowThreadGccCount',
	WORKFLOW_THREAD_GCC_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#WorkflowThreadGccTime',
	WORKFLOW_THREAD_SYSTEM_CPU_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#WorkflowThreadSystemCPUTime',
	WORKFLOW_THREAD_TOTAL_CPU_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#WorkflowThreadTotalCPUTime',
	WORKFLOW_THREAD_WAIT_COUNT = 'http://www.larkc.eu/ontologies/IMOntology.rdf#WorkflowThreadWaitCount',
	WORKFLOW_THREAD_WAIT_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#WorkflowThreadWaitTime',
	WORKFLOW_TOTAL_RESPONSE_TIME = 'http://www.larkc.eu/ontologies/IMOntology.rdf#WorkflowTotalResponseTime';
	
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
systemMetricLabels = ['IO Read',
                      'IO Write',
                      'Idle CPU Load',
                      'Idle CPU Time',
                      'Irq CPU Load',
                      'Irq CPU Time',
                      'Swap In',
                      'Swap Out',
                      'System CPU Load',
                      'System CPU Time',
                      'System Load Average',
                      'System open file descriptor count',
                      'Total System Free Memory',
                      'Total System Used Memory',
                      'Total System Used Swap',
                      'User CPU Load',
                      'User CPU Time',
                      'Wait CPU Load',
                      'Wait CPU Time'];

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
	methodMetricLabels = ['Process Total CPU time',
	                      'Thread Block Count',
	                      'Thread Block Time',
	                      'Thread Count',
	                      'Thread Gcc Count',
	                      'Thread Gcc Time',
	                      'Thread System CPU Time',
	                      'Thread Total CPU Time',
	                      'Thread User CPU Time',
	                      'Thread Wait Count',
	                      'Thread Wait Time',
	                      'Wallclock Time'];

var platformMetrics = [ PLATFORM_AVG_CPU_USAGE,
                        PLATFORM_CPU_TIME,
                        PLATFORM_CPU_USAGE,
                        PLATFORM_GCC_COUNT,
                        PLATFORM_GCC_TIME,
                        PLATFORM_UPTIME,
                        PLATFORM_MEMORY_USAGE],
    platformMetricLabels = ['Platform Avg. CPU Usage',
                            'Platform CPU Time',
                            'Platform CPU Usage',
                            'Platform Gcc Count',
                            'Platform Gcc Time', 
                            'Platform Uptime', 
                            'Platform Mem. Usage'];

var compoundMetrics = [ PLUGIN_INSTANCE_CREATION,
                        PLUGIN_METHOD_INVOCATION,
                        QUERIES_PER_TIME_INTERVAL,
                    	QUERIES_WITH_EXECUTION_TIME_IN_RANGE,
                    	QUERY_FAILURE_RATE,
                    	QUERY_SUCCESS_RATE,
                    	WORKFLOW_AVG_DURATION,
                    	WORKFLOW_AVG_NODES,
                    	WORKFLOW_AVG_THREADS,
                    	WORKFLOWS],
    compoundMetricLabels = ['Plugin Instance Creation',
                            'Plugin Method Invocation',
                            'Queries per Time Interval',
                        	'Queries with Exec. Time in Range',
                        	'Query Failure Rate',
                        	'Query Success Rate',
                        	'Workflow Avg Duration',
                        	'Workflow Avg Nodes',
                        	'Workflow Avg Threads',
                        	'Workflows'];

var atomicMetrics = [PLUGIN_BEGIN_EXECUTION_TIME,
                     PLUGIN_END_EXECUTION_TIME,
                     PLUGIN_ERROR_STATUS,
                     PLUGIN_PROCESS_TOTAL_CPU_TIME,
                     PLUGIN_THREAD_BLOCK_COUNT,
                     PLUGIN_THREAD_BLOCK_TIME,
                     PLUGIN_THREAD_COUNT,
                     PLUGIN_THREAD_GCC_COUNT,
                     PLUGIN_THREAD_GCC_TIME,
                     PLUGIN_THREAD_SYSTEM_CPU_TIME,
                     PLUGIN_THREAD_TOTAL_CPU_TIME,
                     PLUGIN_THREAD_USER_CPU_TIME,
                     PLUGIN_THREAD_WAIT_COUNT,
                     PLUGIN_THREAD_WAIT_TIME,
                     PLUGIN_TOTAL_RESPONSE_TIME,

                 	QUERY_BEGIN_EXECUTION_TIME,
                	QUERY_CONTENT,
                	QUERY_DATASET_SOURCES_NB,
                	QUERY_END_EXECUTION_TIME,
                	QUERY_ERROR_STATUS,
                	QUERY_NAMESPACE_NB,
                	QUERY_OPERATORS_NB,
                	QUERY_PROCESS_TOTAL_CPU_TIME,
                	QUERY_RESULT_LIMIT_NB,
                	QUERY_RESULT_OFFSET_NB,
                	QUERY_RESULT_ORDERING_NB,
                	QUERY_RESULT_SIZE_IN_CHARACTERS,
                	QUERY_SIZE_IN_CHARACTERS,
                	QUERY_THREAD_BLOCK_COUNT,
                	QUERY_THREAD_BLOCK_TIME,
                	QUERY_THREAD_COUNT,
                	QUERY_THREAD_GCC_COUNT,
                	QUERY_THREAD_GCC_TIME,
                	QUERY_THREAD_SYSTEM_CPU_TIME,
                	QUERY_THREAD_TOTAL_CPU_TIME,
                	QUERY_THREAD_USER_CPU_TIME,
                	QUERY_THREAD_WAIT_COUNT,
                	QUERY_THREAD_WAIT_TIME,
                	QUERY_TOTAL_RESPONSE_TIME,
                	QUERY_VARIABLES_NB,
                	
                	WORKFLOW_NUMBER_OF_PLUGINS,
                	WORKFLOW_PROCESS_TOTAL_CPU_TIME,
                	WORKFLOW_THREAD_BLOCK_COUNT,
                	WORKFLOW_THREAD_BLOCK_TIME,
                	WORKFLOW_THREAD_COUNT,
                	WORKFLOW_THREAD_GCC_COUNT,
                	WORKFLOW_THREAD_GCC_TIME,
                	WORKFLOW_THREAD_SYSTEM_CPU_TIME,
                	WORKFLOW_THREAD_TOTAL_CPU_TIME,
                	WORKFLOW_THREAD_WAIT_COUNT,
                	WORKFLOW_THREAD_WAIT_TIME,
                	WORKFLOW_TOTAL_RESPONSE_TIME];

    atomicMetricLabels = ['Plugin Begin Exec. Time',
                          'Plugin End Exec. Time',
                          'Plugin Error Status',
                          'Plugin Process Total CPU Time',
                          'Plugin Thread Block Count',
                          'Plugin Thread Block Time',
                          'Plugin Thread Count',
                          'Plugin Thread Gcc Count',
                          'Plugin Thread Gcc Time',
                          'Plugin Thread System CPU Time',
                          'Plugin Thread Total CPU Time',
                          'Plugin Thread User CPU Time',
                          'Plugin Thread Wait Count',
                          'Plugin Thread Wait Time',
                          'Plugin Total Response Time',
                          
                          'Query Begin Exec. Time',
                          'Query Content',
                          'Query Dataset Sources Nb',
                          'Query End Exec. Time',
                          'Query Error Status',
                          'Query Namespace Nb',
                          'Query Operators Nb',
                          'Query Process Total CPU Time',
                          'Query Result Limit Nb',
                          'Query Result Offset Nb',
                          'Query Result Ordering Nb',
                          'Query Result Size In Characters',
                          'Query Size In Characters',
                          'Query Thread Block Count',
                          'Query Thread Block Time',
                          'Query Thread Count',
                          'Query Thread Gcc Count',
                          'Query Thread Gcc Time',
                          'Query Thread System CPU Time',
                          'Query Thread Total CPU Time',
                          'Query Thread User CPU Time',
                          'Query Thread Wait Count',
                          'Query Thread Wait Time',
                          'Query Total Response Time',
                          'Query Variables Nb',
                          
                          'Workflow Number of Plugins',
                          'Workflow Process Total CPU Time',
                          'Workflow Thread Block Count',
                          'Workflow Thread Block Time',
                          'Workflow Thread Count',
                          'Workflow Thread Gcc Count',
                          'Workflow Thread GccTime',
                          'Workflow Thread System CPU Time',
                          'Workflow Thread Total CPU Time',
                          'Workflow Thread Wait Count',
                          'Workflow Thread Wait Time',
                          'Workflow Total Response Time'];

var pxRegExp = new RegExp("([0-9]*)px", "i");

var clientWidth = window.innerWidth - 2,//document.all.ontoview.clientWidth,
	clientHeight = window.innerHeight - 1,//document.all.ontoview.clientHeight;
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

String.prototype.lpad = function(padString, length) {
	var str = this;
    while (str.length < length)
        str = padString + str;
    return str;
};

function validID(id) {
	return id.replace("#", "_").replace(new RegExp("\\.", "g"), "").replace(new RegExp("/", "g"), "").replace(new RegExp(":", "g"), "").replace(new RegExp("\\$", "g"), "_");
}

function drawCircle(canvas, radius, color) {
	var context = canvas.getContext('2d');
	//context.fillStyle  = "rgba(255, 0, 0, 1)";
	context.fillStyle  = color;
	context.beginPath();
	context.arc(radius, radius, radius, 0, Math.PI*2, true); 
	context.closePath();
	context.fill();		
}

function drawTriangleUp(canvas) {
	var context = canvas.getContext('2d');
	context.clearRect ( 0 , 0 , 16 , 16 );
	//context.fillStyle  = "rgba(255, 0, 0, 1)";
	context.fillStyle  = "#666666";
	context.beginPath();
	context.moveTo(12, 12);
	context.lineTo(4, 12);
	context.lineTo(8, 4);
	context.lineTo(12, 12);
	context.closePath();
	context.fill();		
}

function drawTriangle(canvas) {
	
	var context = canvas.getContext('2d');
	context.clearRect ( 0 , 0 , 16 , 16 );
	//context.fillStyle  = "rgba(255, 0, 0, 1)";
	context.fillStyle  = "#666666";
	context.beginPath();
	context.moveTo(4, 4);
	context.lineTo(12, 4);
	context.lineTo(8, 12);
	context.lineTo(4, 4);
	context.closePath();
	context.fill();		
}
