; define(function (require) {
    var util = require('util')
    var $ = require("jquery");
    var reg1 = /^\*\s*(\d+)(.*)/;
    var reg2 = /[>+]|[(+]/;
    var demoHtml = "<%s %s %s>";
    var reg3 = /^(input|div|span|option|label|img|h1|h2|h3|h4|h5|h6|a|table|select|tbody|td|tr|th|li|ul|ol)\s*(\.[A-Za-z0-9]+)?\s*(\[[^\]]*)?\s*.*/;
    //为了方便解析 *之前总是  ) 但是 存在 td*3 这种情况 
    //加入 *之前除了空格最近的一个符号不是 ) 那么 加入符合标签名称 我需要给他加上个 ()
    var bracketAdd = function (expresion) {
        //*前后的空格去掉
        expresion = expresion.replace(/(\s*)(\*)(\s*)(\d)/g, "$2$4");
        //加上括号
        expresion = expresion.replace(/(input|div|span|option|label|img|h1|h2|h3|h4|h5|h6|a|table|select|tbody|td|tr|th|li|ul|ol)\*/g, "($1)*");
        return expresion;
    }
    var analysisExpress = function (expression) {

        var analysis_deep = function (basicId, string, pId, prevId) {
            if (!(string = $.trim(string))) return;
            var id = util.UUID();
            var index1 = string.indexOf(">");
            var index2 = string.indexOf("(");
            var nearestIndex = util.getMin([index1, index2], -1);
            if (nearestIndex === -1) {
                initArr.push({
                    basicId: basicId,
                    id: id,
                    pId: pId,
                    prevId: prevId,
                    content: string
                });
            } else if (nearestIndex === 0) {
                var pieces = util.cutString(string, index1);
                initArr.push({
                    basicId: basicId,
                    id: id,
                    pId: pId,
                    prevId: prevId,
                    content: pieces[0]
                })
                analysis_deep(basicId, pieces[1], id, 'first');
            } else {
                var pieces = util.cutString(string, index2);
                if (pieces[0]) {
                    initArr.push({
                        basicId: basicId,
                        id: id,
                        pId: pId,
                        prevId: prevId,
                        content: pieces[0]
                    })
                    analysis_bracket(basicId, pieces[1], pId, id);
                } else {
                    analysis_bracket(basicId, pieces[1], pId, prevId);
                }
            }
        };

        var analysis_bracket = function (basicId, string, pId, prevId) {
            if (!(string = $.trim(string))) return;
            var deep = 1;
            var remainString = string;
            var sumIndex = 0;
            var id = util.UUID();
            var repeatTime = -1;
            while (true) {
                var index1 = remainString.indexOf(")");
                var index2 = remainString.indexOf("(");
                var nearestIndex = util.getMin([index1, index2], -1);
                if (nearestIndex === 0) {
                    deep--; sumIndex += index1; repeatTime++;
                    var pieces = util.cutString(remainString, index1);
                    remainString = pieces[1];
                } else if (nearestIndex === 1) {
                    deep++; sumIndex += index2; repeatTime++;
                    var pieces = util.cutString(remainString, index2);
                    remainString = pieces[1];
                }
                //breakCondition 1没有需要解析的字符串 2括号闭合 或者3 既找到不到 (也找不到 )退出
                if (!remainString || deep === 0 || nearestIndex === -1) {
                    break;
                }
            }
            //如果  deep!=0 退出 均为 异常
            if (deep != 0) {
                throw new Error("analysis_bracket Error: 找不到闭合 )");
            }
            var pieces = util.cutString(string, sumIndex + repeatTime);
            var remainString = $.trim(pieces[1]);
            if ("*" == remainString[0]) {
                if (!reg1.test(remainString)) {
                    throw new Error("analysis_bracket Error : *号后面需要连接着 int ");
                }
                var result = remainString.match(reg1);
                var number = result[1];
                var tailString = result[2];
                if (reg2.test(pieces[0])) {
                    var innerMarkId = util.UUID();
                    initArr.push({
                        basicId: basicId,
                        isReplace: true,
                        id: id,
                        pId: pId,
                        prevId: prevId,
                        content: pieces[0],
                        innerId: innerMarkId,
                        repeat: number
                    });
                    analysis_deep(innerMarkId, pieces[0], 'root', 'first');
                } else {
                    initArr.push({
                        basicId: basicId,
                        id: id,
                        pId: pId,
                        prevId: prevId,
                        content: pieces[0],
                        repeat: number
                    });
                }
                analysis_deep(basicId, tailString, pId, id);
            } else {
                if (reg2.test(pieces[0])) {
                    var innerMarkId = util.UUID();
                    initArr.push({
                        basicId: basicId,
                        isReplace: true,
                        id: id,
                        pId: pId,
                        prevId: prevId,
                        innerId: innerMarkId,
                        content: pieces[0]
                    });
                    analysis_deep(innerMarkId, pieces[0], 'root', 'first');
                } else {
                    initArr.push({
                        basicId: basicId,
                        id: id,
                        pId: pId,
                        prevId: prevId,
                        content: pieces[0]
                    });
                }
                analysis_deep(basicId, remainString, pId, id);
            }
        }
        var initArr = [];
        analysis_deep('basic', expression, 'root', 'first');
        return initArr;
    }

    var createLinkObjectTree = function (initArr) {
        var createLinkObjectArr = [];
        var ObjectAll = {};
        for (var i = 0, length = initArr.length; i < length; i++) {
            ObjectAll[initArr[i].id] = initArr[i];
        }
        var treeObject = {};
        for (var key in ObjectAll) {
            if (ObjectAll[key].pId === "root") {
                treeObject[ObjectAll[key].basicId] = (ObjectAll[key]);
            } else {
                var currentItem = ObjectAll[key];
                var parentItem = ObjectAll[currentItem.pId];
                if (!parentItem.child) {
                    parentItem.child = [];
                }
                parentItem.child.push(currentItem);
            }
        }
        return treeObject;
    }
    var createHtmlByTree = function (treeObject) {
        var resultHtml = "";
        var datatreeObject = treeObject;
        var root = treeObject["basic"];
        var createOneLevel = function (currentNode) {
            if (!currentNode) return;
            var isReplace = currentNode.isReplace;
            if (isReplace) {
                var content = createOneLevel(treeObject[currentNode.innerId]);
                return util.createRepeatString(content, currentNode.repeat);
            } else {
                var content = currentNode.content;
                if (!content) return;
                var expressions = $.trim(content).split("+");
                var canAddChild = false;
                var currentHtmlContent = "";
                var currentHtmlContentArr = [];
                if (expressions && expressions.length > 0) {
                    for (var i = 0, length = expressions.length; i < length; i++) {
                        var content_ = expressions[i];
                        if (!$.trim(content_)) continue;
                        var resultObject = singleExpressionAnalysisAndCreate(content_);
                        canAddChild = resultObject.canAddChild;
                        currentHtmlContentArr.push(resultObject.data);
                    }
                }
                var childs = currentNode.child;
                var childContent = "";
                if (currentHtmlContentArr.length == 0) return "";
                if (childs && childs.length > 0 && canAddChild) {
                    for (var i = 0, length = childs.length; i < length; i++) {
                        childContent += createOneLevel(childs[i]);
                    }
                    //给最后一个节点添加 child 内容
                    for (var i = 0, length = currentHtmlContentArr.length; i < length; i++) {
                        if (i < length - 1) {
                            currentHtmlContent += currentHtmlContentArr[i][0] + currentHtmlContentArr[i][1];
                        } else {
                            currentHtmlContent += currentHtmlContentArr[i][0] + childContent + currentHtmlContentArr[i][1]
                        }
                    }
                } else {
                    for (var i = 0, length = currentHtmlContentArr.length; i < length; i++) {
                        currentHtmlContent += currentHtmlContentArr[i][0] + currentHtmlContentArr[i][1];
                    }
                }
                return util.createRepeatString(currentHtmlContent, currentNode.repeat);
            }
        };

        var singleExpressionAnalysisAndCreate = function (expression) {
            if (reg3.test(expression)) {
                var data_Arr = [].slice.call(expression.match(reg3), 1, 4);
                return { canAddChild: true, data: createDetail(data_Arr) }
            } else {
                return { canAddChild: false, data: expression };
            }
        }

        var createDetail = function (data_arr) {
            if (!data_arr || !data_arr[0]) return "";
            var returnString = "";
            var classStr = "";
            if (data_arr[1]) {
                classStr = " class='" + data_arr[1].substring(1) + "' ";
            }
            var insertArray = [data_arr[0], classStr, data_arr[2] ? (data_arr[2] + "").substring(1) : ""];
            return [util.replace_(demoHtml, insertArray), "</" + data_arr[0] + ">"];
        }
        return createOneLevel(root);

    }

    var begin = function (testExpressions) {
        var initOkExpression = bracketAdd(testExpressions[i]);
        //按照 括号 和 >解析
        console.log(initOkExpression)
        var initArr = analysisExpress(initOkExpression)
        console.table(initArr);
        //形成属性结构
        var treeObject = createLinkObjectTree(initArr);
        console.log(treeObject);
        //每个节点 按 + 分割 并解析拼装
        var resultHtml = createHtmlByTree(treeObject);
        console.log(resultHtml)
        return resultHtm;
    };

    return begin;

})