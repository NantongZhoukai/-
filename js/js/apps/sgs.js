; define(function (require) {
    var $ = require('jquery')
    var echarts = require('echarts')
    var layer = require("layer")
    var util=require('util')
    var replaceFn=new util().replace
    require("wDatePicker")
    var app = function () { },
        monthNameArray = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
        basicConfig = {
            basicUrl: "/nts_credit",
            init_1_dataUrl: '/gszl_sgsStatisticData.do'
        },
        demoTd = "<td class=\"tdcol\">%s</td>",
        monthNameArrayForShow = ["一\n月", "二\n月", "三\n月", "四\n月", "五\n月", "六\n月", "七\n月", "八\n月", "九\n月", "十\n月", "十一\n月", "十二\n月"]
    app.fn = {
        init_1: function () {
            var eventObject = {
                yearInputClick: function () {
                    $('input[name="year"]').bind("click", function () {
                        WdatePicker({ dateFmt: 'yyyy' })
                    })
                },
                queryBtnClick: function () {
                    var item = $('#queryBtn').bind("click", function () {
                        query.queryForData()
                    })
                }
            }
            var query = {
                queryForData: function () {
                    var queryUrl = basicConfig.basicUrl + basicConfig.init_1_dataUrl
                    var data = { year: $('input[name="year"]').val() }
                    var type = $('input[name="type"]').val()
                    $.when($.ajax({ url: queryUrl, data: data, type: 'post' }))
                        .done(function (msg) {
                            if ("1" === type) {
                                mainFn.type1CallBack(msg)
                            } else {
                                mainFn.type2CallBack(msg)
                            }
                        }).fail(function () {
                            layer.msg("ajax调用错误")
                            mainFn.displayLoad()	
                        })
                }
            }
            var mainFn = {
                type1CallBack: function (data) {
                	this.displayLoad()
                    this.initTitle(1)
                    this.analysisForType1(data)
                },
                type2CallBack: function (data) {
                	this.displayLoad()
                    this.initTitle(2)
                    this.analysisForType2(data)
                },
                initTitle: function (type) {
                    if (1 === type) {
                        $('#title').html("每月双公示数据统计图")
                    } else {
                        $('#title').html("每月双工示数据统计图(汇总)")
                    }
                },
                analysisForType1: function (data) {
                    if (!data)
                        layer.msg("暂无该年度数据!")
                    var data = eval("(" + data + ")")
                    var cfArray = data.cf, xkArray = data.xk
                    var cfResult = [], xkResult = []
                    ~function (resultArray, ItemArray) {
                        for (var i = 0; i < 12; i++) {
                            var currentResultObject = { monthName: monthNameArray[i], value: 0 }
                            if (ItemArray && ItemArray.length > 0) {
                                for (var j = 0; j < ItemArray.length; j++) {
                                    var itemArrayMonth = Number(ItemArray[j][1])
                                    if (itemArrayMonth === i) {
                                        currentResultObject.value = ItemArray[j][2]
                                        break
                                    }
                                }
                            }
                            resultArray.push(currentResultObject)
                        }
                        return arguments.callee
                    } (cfResult, cfArray)(xkResult, xkArray)
                    this.drawEchartsType1(cfResult, xkResult)
                    this.createTableType1(cfResult, xkResult)
                },
                analysisForType2: function (data) {
                    if (!data)
                        layer.msg("暂无该年度数据!")
                    var data = eval("(" + data + ")")
                    var cfArray = data.cf, xkArray = data.xk
                    var sumResult = []
                    for (var i = 0; i < 12; i++) {
                        var currentResultObject = { monthName: monthNameArray[i] }
                        if (cfArray && cfArray.length > 0) {
                            var value = 0
                            for (var j = 0; j < cfArray.length; j++) {
                                var itemArrayMonth = Number(cfArray[j][1])
                                if (itemArrayMonth === i) {
                                    value += cfArray[j][2]
                                    break
                                }
                            }
                            for (var j = 0; j < xkArray.length; j++) {
                                var itemArrayMonth = Number(xkArray[j][1])
                                if (itemArrayMonth === i) {
                                    value += xkArray[j][2]
                                    break
                                }
                            }
                            currentResultObject.value = value
                        }
                        sumResult.push(currentResultObject)
                    }
                    this.drawEchartsType2(sumResult)
                    this.createTableType2(sumResult)
                },
                drawEchartsType1: function (dataCF, dataXK) {
                    var myChart = echarts.init(document.getElementById('main'))
                    var valueArrayCF = [], valueArrayXK = []
                    ~function (itemArray, resultArray) {
                        for (var i = 0; i < 12; i++) {
                            var value = 0
                            var data = itemArray[i]
                            if (data)
                                value = data.value
                            resultArray.push(value)
                        }
                        return arguments.callee
                    } (dataCF, valueArrayCF)(dataXK, valueArrayXK)
                    var option = {
                        title: {
                            text: '每月双公示数据统计图'
                        },
                        tooltip: {
                            trigger: 'axis',
                            axisPointer: {
                                type: 'shadow'
                            }
                        },
                        legend: {
                            data: ["行政处罚", "行政许可"],
                            x: 'right'
                        },
                        xAxis: {
                            data: monthNameArrayForShow
                        },
                        yAxis: [
                            {
                                type: 'value'
                            }
                        ],
                        series: [
                            {
                                name: '行政处罚',
                                type: 'bar',
                                data: valueArrayXK
                            },
                            {
                                name: '行政许可',
                                type: 'bar',
                                data: valueArrayCF
                            }
    					              	]
                    };
                    myChart.setOption(option)

                },
                createTableType1: function (dataCF, dataXK) {
                    var resultHtml = {};
                    ~function (dataArray, name) {
                        var itemHtml = replaceFn(demoTd, name)
                        for (var i = 0; i < dataArray.length; i++) {
                            itemHtml += replaceFn(demoTd, dataArray[i].value)
                        }
                        itemHtml = "<tr>" + itemHtml + "</tr>"
                        if (!resultHtml.str)
                            resultHtml.str = "";
                        resultHtml.str += itemHtml
                        return arguments.callee
                    } (dataCF, "行政处罚")(dataXK, "行政许可")
                    var result = $(resultHtml.str)
                    $('#itemTBody').empty().append(result)
                }
                , drawEchartsType2: function (sumResult) {
                    var myChart = echarts.init(document.getElementById('main'))
                    var valueArraySum = []
                    for (var i = 0; i < 12; i++) {
                        var value = 0
                        var data = sumResult[i]
                        if (data)
                            value = data.value
                        valueArraySum.push(value)
                    }

                    var option = {
                        title: {
                            text: '每月双公示数据统计图'
                        },
                        tooltip: {
                            trigger: 'axis',
                            axisPointer: {
                                type: 'shadow'
                            }
                        },
                        legend: {
                            data: ["行政处罚与行政许可归集"],
                            x: 'right'
                        },
                        xAxis: {
                            data: monthNameArrayForShow
                        },
                        yAxis: [
                            {
                                type: 'value'
                            }
                        ],
                        series: [
                            {
                                name: '行政处罚与行政许可归集',
                                type: 'bar',
                                data: valueArraySum
                            }
    					              	]
                    };
                    myChart.setOption(option)
                }, createTableType2: function (sumResult) {
                    var itemHtml = ""
                    var itemHtml = replaceFn(demoTd, "行政处罚与行政许可归集")
                    for (var i = 0; i < sumResult.length; i++) {
                        itemHtml += replaceFn(demoTd, sumResult[i].value)
                    }
                    itemHtml = "<tr>" + itemHtml + "</tr>"
                    $('#itemTBody').empty().append($(itemHtml))

                },
                displayLoad:function (){
                	$('.spinner').css("display","none")
                	$('#contentvm').css("display","block")
                }
            }
            //注册事件  触发第一次请求
            ~function () {
                for (var key in eventObject) 
                    eventObject[key]()
                $('#queryBtn').trigger("click")
            } ()

        }
    }
    app.prototype=app.fn
    return app
})
