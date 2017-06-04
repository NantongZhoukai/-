;
define(function(require) {
	var $ = require('jquery')
	var echarts = require('echarts')
	var layer = require("layer")
	var util = require('util')
	var description = require('description')
	var htmlFormat = require('htmlFormat')
	require("wDatePicker")
	var app = function() {
	}, basicConfig = {
		basicUrl : "/dataManager",
		queryUrl : '/simpleCreator_getStatisticData1.do',
		statistic1_scqy : "/simpleCreator_getStatisticData_scqy.do",
		statistic1_xzf : "/simpleCreator_getStatisticData_xzf.do",
		statistic2 : '/simpleCreator_getStatisticData_2.do',
		statistic3 : '/simpleCreator_getStatisticData_3.do'
	}
	app.fn = {
		init : function() {
			var eventObject = {
				startTimeFocus : function() {
					$('#startTime').bind("focus", function() {
						WdatePicker({
							maxDate : $('#endTime').val()
						});
					});
				},
				endTimeFocus : function() {
					$('#endTime').bind("focus", function() {
						WdatePicker({
							minDate : $('#startTime').val()
						})
					});
				},
				queryBtnClick : function() {
					$('#queryBtn').bind("click", function() {
						query.queryForData();
					})
				}
			}
			var query = {
				queryForData : function() {
					mainFn.startLoad();
					var data = {
						startTime : $('#startTime').val(),
						endTime : $('#endTime').val()
					};
					$.when($.ajax({
						url : basicConfig.basicUrl + basicConfig.queryUrl,
						data : data,
						type : 'post'
					})).done(function(msg) {
						mainFn.displayLoad();
						mainFn.callBack(msg);
					}).fail(function() {
						layer.msg("ajax调用错误")
						mainFn.displayLoad()
					})
				}
			}
			var mainFn = {
				callBack : function(data) {
					if (!data || !(data = eval("(" + data + ")")) || !data.data) {
						layer.msg("暂无数据！");
						return;
					}
					this.handleData(data.data);
				},
				handleData : function(data) {
					var legend_Arr = [];
					var sum_Arr = [];
					var sum_final_Arr = [];
					var inner_final_Arr = [];
					for ( var key in data) {
						var deep0Item = data[key];
						legend_Arr.push(key);
						var currentSum = 0;
						for (var j = 0; j < deep0Item.length; j++) {
							var deep1Item = deep0Item[j];
							legend_Arr.push(deep1Item[0]);
							currentSum += deep1Item[1];
							inner_final_Arr.push({
								value : deep1Item[1],
								name : deep1Item[0]
							})
						}
						sum_Arr.push([ key, currentSum ]);
					}
					~function() {
						for (var i = 0; i < sum_Arr.length; i++) {
							sum_final_Arr.push({
								value : sum_Arr[i][1],
								name : sum_Arr[i][0]
							})
						}
					}();
					this
							.drawEcharts(legend_Arr, sum_final_Arr,
									inner_final_Arr);
				},
				drawEcharts : function(data1, data2, data3) {
					var myChart = echarts.init(document
							.getElementById('drawArea'))
					var option = {
						tooltip : {
							trigger : 'item',
							formatter : "{a} <br/>{b}: {c} ({d}%)"
						},
						legend : {
							orient : 'vertical',
							x : 'left',
							y : 'center',
							data : data1
						},
						series : [ {
							name : '数据量',
							type : 'pie',
							selectedMode : 'single',
							radius : [ 0, '30%' ],
							center : [ '60%', '65%' ],
							label : {
								normal : {
									position : 'inner'
								}
							},
							labelLine : {
								normal : {
									show : false
								}
							},
							data : data2
						}, {
							name : '数据量',
							type : 'pie',
							radius : [ '35%', '40%' ],
							center : [ '60%', '65%' ],
							data : data3
						} ]
					};
					myChart.setOption(option);
				},
				displayLoad : function() {
					$('.spinner').css("display", "none");
					$('#mainPage').css("display", "block");
				},
				startLoad : function() {
					$('.spinner').css("display", "block");
					$('#mainPage').css("display", "none");
				}
			}

			~function() {
				for ( var key in eventObject)
					eventObject[key]()
				$('#queryBtn').trigger("click")
			}()

		},
		scyqAndXzfInit : function() {
			var query = ~function() {
				var queryCallBack = function(result) {
					var handledResult = {
						legend : {},
						dataSCQY : [],
						dataXZF : []
					};
					var handleForReuslt = ~function(handledResult, result) {
						var nameArr = [];
						if (result.scqy_data && result.scqy_data.length > 0) {
							for (var i = 0, length = result.scqy_data.length; i < length; i++) {
								var xqName = result.scqy_data[i][1];
								if (!xqName)
									continue;
								handledResult.legend[xqName] = true;
								handledResult.dataSCQY.push({
									name : xqName,
									value : result.scqy_data[i][0]
								});
							}
						}
						if (result.xzf_data && result.xzf_data.length > 0) {
							for (var i = 0, length = result.xzf_data.length; i < length; i++) {
								var xqName = result.xzf_data[i][1];
								if (!xqName)
									continue;
								handledResult.legend[xqName] = true;
								handledResult.dataXZF.push({
									name : xqName,
									value : result.xzf_data[i][0]
								});
							}
						}
						for ( var key in handledResult.legend) {
							nameArr.push(key);
						}
						handledResult.legend = nameArr;
					}(handledResult, result);
					var myChart = echarts.init(document
							.getElementById('drawArea'))
					var option = {
						title : {
							text : '生产企业小作坊区域数量统计图',
							subtext : '生产企业(左)|小作坊(右)',
							x : 'center'
						},
						tooltip : {
							trigger : 'item',
							formatter : "{a} <br/>{b} : {c} ({d}%)"
						},
						legend : {
							x : 'center',
							y : 'bottom',
							data : handledResult.legend
						},
						toolbox : {
							show : false,
							feature : {
								mark : {
									show : true
								},
								dataView : {
									show : true,
									readOnly : false
								},
								magicType : {
									show : true,
									type : [ 'pie', 'funnel' ]
								},
								restore : {
									show : true
								},
								saveAsImage : {
									show : true
								}
							}
						},
						calculable : true,
						series : [ {
							name : '生产企业',
							type : 'pie',
							radius : [ 20, 110 ],
							center : [ '25%', '50%' ],
							roseType : 'radius',
							label : {
								normal : {
									show : true
								},
								emphasis : {
									show : true
								}
							},
							lableLine : {
								normal : {
									show : true
								},
								emphasis : {
									show : true
								}
							},
							data : handledResult.dataSCQY
						}, {
							name : '小作坊',
							type : 'pie',
							radius : [ 30, 110 ],
							center : [ '75%', '50%' ],
							roseType : 'area',
							data : handledResult.dataXZF
						} ]
					};
					myChart.setOption(option);
				}
				var queryForData = ~function(callBack) {
					var startLoad = ~function() {
						$('.spinner').css("display", "block");
						$('#mainPage').css("display", "none");
					}();
					$.when(
							$.ajax({
								url : basicConfig.basicUrl
										+ basicConfig.statistic1_scqy
							}),
							$.ajax({
								url : basicConfig.basicUrl
										+ basicConfig.statistic1_xzf
							}))
							.done(
									function(scqy_data, xzf_data) {
										var result = {};
										if ((scqy_data = scqy_data[0])
												&& (scqy_data = eval("("
														+ scqy_data + ")"))
												&& scqy_data.length > 0)
											result.scqy_data = scqy_data;
										if ((xzf_data = xzf_data[0])
												&& (xzf_data = eval("("
														+ xzf_data + ")"))
												&& xzf_data.length > 0)
											result.xzf_data = xzf_data;
										var displayLoad = ~function() {
											$('.spinner')
													.css("display", "none");
											$('#mainPage').css("display",
													"block");
										}();
										callBack(result);
									}).fail(function() {
								layer.msg("ajax调用错误!");
							})
				}(queryCallBack);
			}();
		},
		splbInit : function() {
			var query = ~function() {
				var queryCallBack = function(result) {

					var handledResult = {
						xAxisData : [],
						data : []
					};
					var handleForReuslt = ~function(handledResult, result) {
						if (!result)
							return;
						if (result && result.length > 0) {
							for (var i = 0, length = result.length; i < length; i++) {
								var typeName = result[i][1];
								if (!typeName)
									continue;
								handledResult.xAxisData.push(typeName);
								handledResult.data.push(result[i][0]);
							}
						}
					}(handledResult, result);
					var myChart = echarts.init(document
							.getElementById('drawArea'))
					var option = {
						title : {
							text : '各个类别生产企业数量',
							x : 'center',
							y : 'top'
						},
						color : [ '#3398DB' ],
						tooltip : {
							trigger : 'axis',
							axisPointer : {
								type : 'shadow'
							}
						},
						grid : {
							left : '3%',
							right : '4%',
							bottom : '3%',
							containLabel : true
						},
						xAxis : [ {
							type : 'category',
							data : handledResult.xAxisData,
							axisTick : {
								alignWithLabel : true
							}
						} ],
						yAxis : [ {
							type : 'value'
						} ],
						series : [ {
							name : '数量',
							type : 'bar',
							barWidth : '60%',
							data : handledResult.data
						} ]
					};
					myChart.setOption(option);
				}
				var queryForData = ~function(callBack) {
					var startLoad = ~function() {
						$('.spinner').css("display", "block");
						$('#mainPage').css("display", "none");
					}();
					$.when($.ajax({
						url : basicConfig.basicUrl + basicConfig.statistic2
					})).done(function(result) {
						var displayLoad = ~function() {
							$('.spinner').css("display", "none");
							$('#mainPage').css("display", "block");
						}();
						if (result && (result = eval("(" + result + ")"))) {
							callBack(result);
						} else {
							callBack(null);
						}
					}).fail(function() {
						layer.msg("ajax调用错误!");
					})
				}(queryCallBack);
			}();
		},
		last5Year : function() {
			var query = ~function() {
				var queryCallBack = function(result) {
					var myChart = echarts.init(document
							.getElementById('drawArea'))
					option = {
						tooltip : {
							trigger : 'axis',
							axisPointer : {
								type : 'shadow'
							}
						},
						legend : {
							data : [ '小作坊', '生产企业' ]
						},
						grid : {
							left : '3%',
							right : '4%',
							bottom : '3%',
							containLabel : true
						},
						xAxis : {
							type : 'value'
						},
						yAxis : {
							type : 'category',
							data : result[0]
						},
						series : [ {
							name : '小作坊',
							type : 'bar',
							stack : '注册量',
							label : {
								normal : {
									show : true,
									position : 'insideRight'
								}
							},
							data : result[1]
						}, {
							name : '生产企业',
							type : 'bar',
							stack : '注册量',
							label : {
								normal : {
									show : true,
									position : 'insideRight'
								}
							},
							data : result[2]
						} ]
					};
					myChart.setOption(option);
				}
				var queryForData = ~function(callBack) {
					var startLoad = ~function() {
						$('.spinner').css("display", "block");
						$('#mainPage').css("display", "none");
					}();
					$.when($.ajax({
						url : basicConfig.basicUrl + basicConfig.statistic3
					})).done(function(result) {
						var displayLoad = ~function() {
							$('.spinner').css("display", "none");
							$('#mainPage').css("display", "block");
						}();
						if (result && (result = eval("(" + result + ")"))) {
							callBack(result);
						} else {
							callBack(null);
						}
					}).fail(function() {
						layer.msg("ajax调用错误!");
					})
				}(queryCallBack);
			}();
		}
	}
	app.prototype = app.fn
	return app
})
