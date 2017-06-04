; define(function (require) {
    var $ = require('jquery');

    $.fn.extend({
        "mergeSameTd_config": function () {
            if (console.log) {
                console.log("mergeSameTd:{\n\tneedMergeTd(需要合并的列 可以是\"all\"字符串或者 int数组 ):\"all\"||int...,\n\tstartTrIndex(起始行):int,\n\tendTrIndex(结束行):int\n}");
            }
        }
    });
    $.fn.extend({
        "mergeSameTd": function (options) {
            var defaluts = {
                needMergeTd: "all",
                startTrIndex: 0,
                endTrIndex: -1,
            };
            var configValidate = function (opts, length) {
                if (opts.endTrIndex == -1) opts.endTrIndex = length - 1;
                if (opts.startTrIndex > length || opts.startTrIndex < 0) return false;
                if (opts.endTrIndex < -1 || opts.endTrIndex > length - 1) return false;
                if (opts.endTrIndex < opts.startTrIndex) return false;
                return true;
            }
            var filter_tr = function (itemTrs, startTrIndex, endTrIndex) {
                var resultArray = [];
                var i = 0;
                itemTrs.each(function () {
                    if (i >= startTrIndex && i <= endTrIndex) {
                        resultArray.push($(this));
                    }
                    i++;
                });
                return resultArray;
            };
            var removeItems = [];
            var mergeTr = function (itemtrs, startIndex, endIndex, columnIndex) {
                if (startIndex == endIndex) return;
                itemtrs[startIndex].find("td:eq(" + columnIndex + ")").attr("rowspan", endIndex - startIndex + 1);
                for (var i = startIndex + 1; i <= endIndex; i++) {
                    removeItems.push(itemtrs[i].find("td:eq(" + columnIndex + ")"));
                }
            };
            var choosedColumnHandle = function (selectItemArray, itemTrs) {
                for (var i = 0; i < selectItemArray.length; i++) {
                    var columnIndex = selectItemArray[i];
                    var lastValue;
                    var startIndex;
                    var endIndex;
                    for (var j = 0; j < itemTrs.length; j++) {
                        var currentItem = itemTrs[j];
                        var currentValue = currentItem.find("td:eq(" + columnIndex + ")").html();
                        if (j == 0) {
                            lastValue = currentValue;
                            startIndex = 0;
                            continue;
                        }

                        if (j == (itemTrs.length - 1)) {
                            if (currentValue != lastValue) {
                                endIndex = j - 1;
                                if (startIndex != endIndex) {
                                    mergeTr(itemTrs, startIndex, endIndex, columnIndex);

                                }
                            } else {
                                endIndex = j;
                                if (startIndex != endIndex) {
                                    mergeTr(itemTrs, startIndex, endIndex, columnIndex);
                                }
                            }

                        } else {
                            if (currentValue != lastValue) {
                                endIndex = j - 1;

                                if (startIndex != endIndex) {
                                    mergeTr(itemTrs, startIndex, endIndex, columnIndex);

                                }
                                startIndex = j;

                                lastValue = currentValue;
                            }
                        }

                    }
                }
            }

            var opts = $.extend({},
                defaluts, options);
            var itemTrs = $(this).find("tr");
            if (!itemTrs) return;
            if (!configValidate(opts, itemTrs.length)) {
                if (console.error) console.error("unexpect arguments");
                return;
            }
            itemTrs = filter_tr(itemTrs, opts.startTrIndex, opts.endTrIndex);
            //merge appointed columns
            if (Object.prototype.toString.call(opts.needMergeTd) === '[object Array]') {
                var selectItemArray = opts.needMergeTd;
                if (selectItemArray.length == 0) return;
                choosedColumnHandle(selectItemArray, itemTrs);

            }
            //merge all columns
            else {
                var selectItemArray = [];
                var length = itemTrs[0].find("td").length;
                for (var i = 0; i < length; i++) {
                    selectItemArray.push(i);
                }
                choosedColumnHandle(selectItemArray, itemTrs);
            }
            for (var i = 0; i < removeItems.length; i++) {
                removeItems[i].css("display", "none")
            }
        }
    })
})

