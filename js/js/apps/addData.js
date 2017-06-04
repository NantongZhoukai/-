;
define(function(require) {
    var $ = require('jquery');
    var layer = require("layer");
    var util = require('util');
    require("wDatePicker")
    var app = function() {};
    app.fn = {
        addData_ListPage_init: function(basicUrl, tableName,tableName_zw,tableMsg_id) {
            var urls = {
                basicUrl: basicUrl,
                deleteUrl: '/simpleCreator_deleteSomeColumns.do?',
                addUrl: '/simpleCreator_toBusinessTableAddPage.do?',
                backUrl: '/simpleCreator_toBusinessList.do?',
                modelDownload:'/simpleCreator_modelDownload.do?',
                importUrl:'/simpleCreator_dataImport.do?'
            };
            var ids = {
                addBtn: {
                    tableMsgId: 'tableMsg-id',
                    id: 'addBtn'
                },
                backBtn: 'backBtn',
                removeBtn: 'removeBtn',
                table: 'main_table',
                checkAllBox: 'checkAll',
                editBtn: {
                    idValue: 'id-value',
                    name: 'name-editBtn'
                },
                modelDownload:'modelDownload',
                dataImport: "dataImport",
                importForm:'myForm',
                importFrame:'importFrame',
                importFile:'importFile'
            }
            var eventObject = {
                addBtnClick: function() {
                    $('#' + ids.addBtn.id).bind("click",
                    function() {
                        location.href = urls.basicUrl + urls.addUrl + "tableMsgId=" + $(this).attr(ids.addBtn.tableMsgId);
                    })
                },
                modelDownload:function (){
                	 $('#' + ids.modelDownload).bind("click",function() {
                         location.href = urls.basicUrl + urls.modelDownload+"id="+tableMsg_id;
                     })
                },
                backBtnClick: function() {
                    $('#' + ids.backBtn).bind("click",
                    function() {
                    	var key=localStorage.key_;
                        location.href = urls.basicUrl + urls.backUrl+"key="+key;
                    })
                },
                importBtnClick:function (){
                	$('#'+ids.dataImport).bind("click",function (){
                		if(!$('#'+ids.importFile).val()){
                			layer.msg("请选择文件!");
                		}
                		var orginalAction=$('#'+ids.importForm).attr("action");
                		$('#'+ids.importForm).attr("action",urls.basicUrl+urls.importUrl+"tableMsgId="+tableMsg_id+"&tableName="+tableName);
                		$('#'+ids.importForm).attr("target",ids.importFrame);
                		$('#'+ids.importForm).submit();
                		$('#'+ids.importForm).removeAttr("target");
                		$('#'+ids.importForm).attr("action",orginalAction);
                	})
                },
                removeBtnClick: function() {
                    $('#' + ids.removeBtn).bind("click",
                    function() {
                        var deleteIds = [];
                        $('input[type="checkbox"]:checked', $('#' + ids.table + " tr:gt(0)")).each(function() {
                            deleteIds.push($(this).attr("id"));
                        });
                        if (deleteIds.length < 1) {
                            layer.msg("至少选择一个");
                            return;
                        }
                        $.ajax({
                            url: urls.basicUrl + urls.deleteUrl,
                            type: 'post',
                            data: {
                                tableName: tableName,
                                ids: deleteIds.join(",")
                            },
                            success: function(data) {
                                if (data == "1") {
                                    layer.msg("删除成功");
                                }
                                location.reload();
                            }
                        })
                    })
                },
                checkAll: function() {
                    $('#' + ids.checkAllBox).click(function() {
                        if ($(this).prop("checked")) {
                            $('input[type="checkbox"]').prop("checked", "true");
                        } else {
                            $('input[type="checkbox"]').removeProp("checked");
                        }
                    })
                }
            };
            ~function() {
                for (var key in eventObject) eventObject[key]()
            } ()
        },
        addData_addPage_init: function(basicUrl, tableMsgId,query_type,data_id) {
            var urls = {
                basicUrl: basicUrl,
                subUrl1: '/simpleCreator_updateData.do',
                subUrl2: '/simpleCreator_insertData.do',
                getBasicData: '/simpleCreator_getTableMsgDetail.do',
                backUrl:'/simpleCreator_toBusinessTableList.do',
                dicUrl:'/simpleCreator_getDicContentByKey.do'
            };
            var ids = {
               backBtn:'backBtn',
                subBtn: 'subBtn',
                main_form:'mainTable',
                title:'titleMsg'
            }
            var createTable = function(id) {
                var prepareData = ~function(id) {
                	var queryObject={
                            url: urls.basicUrl + urls.getBasicData,
                            data: {
                                tableMsgId: tableMsgId,
                                tableName:localStorage.tableName
                            },
                            type: 'post',
                            success: function(data) {
                            	createTableByData(handleData(data));
                            	//特殊出里 假如 同事存在   szxq(所属县区) 和 szjd(所属街道) 两个字段  name szjd 会根据 szxq的改变改变 szjd的select
                            	XqAndJdLinkCreate();
                            	$('#SZXQ').trigger("change");
                            }
                        };
                	if(id){
                		queryObject.data=$.extend({},queryObject.data,{id:id});
                	}
                    $.ajax(queryObject)
                } (id);
                // 将所有  字典内容,验证存入 cache_div  返回 一个array
                var handleData=function (data){
                	if(!data)return;
                	data=eval("("+data+")");
                	var handleForDic=~function (data){
                		if(!data||data.length==0)return;
                		$('#cache_div').data("dicMap",data);
                	}(data.dicMap);
                	var handleForJs=~function (data){
                		if(!data||data.length==0)return;
                		$('#cache_div').data("jsMap",data);
                	}(data.jsMap);
                	var handleForData=~function (data){
                		if(!data||data.length==0)return;
                		$('#cache_div').data("dataResult",data);
                	}(data.dataResult);
                	var basicDataHandle;
                	if(!data||data.length==0)return;
            		var resultArr=[];
            		data=data.business_keys;
            		for(var i=0;i<data.length;i++){
            			resultArr.push({
            				name:data[i][1],
            				type:data[i][2],
            				zw:data[i][3],
            				isNeed:data[i][4],
            				js:data[i][5],
            				dic:data[i][6]})
            		}
            		return resultArr;
                }
                var XqAndJdLinkCreate=function (){
                	if($('#SZXQ').length>0&&$('#SZJD').length>0){
                		$('#SZXQ').bind("change",function (){
                			var key;
                			if(key=$(this).val()){
                				$.ajax({
                					url:urls.basicUrl+urls.dicUrl,
                					type:'post',
                					data:{key:key},
                					success:function (data){
                						if(data&&(data=eval("("+data+")"))&&data.length>0){
                							var parent=$('#SZJD').parent();
                							var oldValue=$('#SZJD').val();
                							$('#SZJD').remove();
                							var $szjdSelect=$(util.selectCreate(data,oldValue));
                							$szjdSelect.attr("id","SZJD");
                							parent.append($szjdSelect);
                						}else{
                							layer.msg("该街道无数据")
                						}
                					}
                				})
                			}
                		})
                	}
                }
                var createTableByData = function(data) {
                    var needHtml = "<span style=\"color: red;\">*</span>";
                    var demoTd = "<td class=\"col-r\">%s %s：</td><td class=\"col\">%s</td>";
                    var numberInput = "<input style=\"width: 300px;\"  id=\"%s\" value=\"%s\" maxLength=\"20\" ref=\"number\" />";
                    var commonInput = "<input style=\"width: 300px;\"  id=\"%s\" value=\"%s\" maxLength=\"%s\"/>";
                    var timeInput = "<input style=\"width: 300px;\"  id=\"%s\" value=\"%s\"   readonly />";
                    var demoTextAreaTr = "<td class=\"col-r\"> %s %s：</td><td class=\"col\" colspan=\"3\"><textarea  style=\"height:100px; width:600px\" id=\"%s\" >%s</textarea></td>"
                    var notNullValidate=" var notNull=function (str){ if(str==='0')return true;return !!str}; notNull('%s')"
                    var notNull=['不能为空',notNullValidate];
                    var typeNumberValidate=" var isNumber=function (str){ if(!str) return true;  return /^\\d*$/.test(str)}; isNumber('%s') ";
                    var isNumber=['必须是数字',typeNumberValidate];
                    var inner_tr_index = 0;
                    var result_table_html="";
                    var dateBindId=[];
                    var validateBind={};
                    var dicMap=$('#cache_div').data("dicMap");
                    var jsMap=$('#cache_div').data("jsMap");
                    var nameArr=[];
                    var typeArr=[];
                    var keyNameMap={};
                    for (var i = 0; i < data.length; i++) {
                    	keyNameMap[data[i].name]=data[i].zw;
                    	nameArr.push(data[i].name);
                    	typeArr.push(data[i].type);
                        if (inner_tr_index == 0) {
                            result_table_html += "<tr>";
                        }
                        var isDic=false;
                        if(data[i].dic&&(!("-1"==data[i].dic))){
                        	var currentDic=dicMap[data[i].dic];
                        	if(currentDic&&Object.prototype.toString.call(currentDic) === '[object Array]'){
                        		isDic=true;
                        		var selectHtml="<select id='"+data[i].name+"'>";
                        		for(var k=0;k<currentDic.length;k++){
                        			selectHtml+="<option value='"+currentDic[k][1]+"'>"+currentDic[k][0]+"</option>";
                        		}
                        		selectHtml+="</select>"
                                result_table_html += util.replace(demoTd, data[i].isNeed == "1" ? needHtml: "", data[i].zw, selectHtml);
                        	}
                        }
                       
                        //如果不是使用字段的话
                        if(!isDic){
                        	 //自定义验证添加
                            if(data[i].js&&!("-1"==data[i].js)){
                            	var currentJs=jsMap[data[i].js]
                            	if(currentJs){
                            		validateBind[data[i].name]=[currentJs]
                            	}
                            }
                            //非空验证添加
                            if(data[i].isNeed=="1"){
                            	if(!validateBind[data[i].name])
                            		validateBind[data[i].name]=[notNull]
                        		else{
                        			validateBind[data[i].name].push(notNull);
                        		}
                            }
                        	if ("CLOB" == data[i].type.toUpperCase()) {
                                //inner_tr_index上==1 表示 上个 tr 未结束 遇到了一个clob字段
                                if (inner_tr_index == 1) {
                                    //结束掉<tr>
                                    result_table_html += "</tr>";
                                    result_table_html += "<tr>";
                                }
                                result_table_html += util.replace(demoTextAreaTr, data[i].isNeed == "1" ? needHtml: "", data[i].zw, data[i].name, "");
                                //吧 inner_tr_index 置为 1 表示 接下来应该要结束 tr
                                inner_tr_index = 1;
                            } else if ("DATE" == data[i].type.toUpperCase()) {
                                var timeInputStr = util.replace(timeInput, data[i].name,util.getDate());
                                result_table_html += util.replace(demoTd, data[i].isNeed[i] == "1" ? needHtml: "", data[i].zw, timeInputStr);
                                dateBindId.push(data[i].name)
                            } else if ("NUMBER" == data[i].type.toUpperCase()) {
                            	if(!validateBind[data[i].name])
                            		validateBind[data[i].name]=[isNumber]
                        		else{
                        			validateBind[data[i].name].push(isNumber);
                        		}
                                var numberInputStr = util.replace(numberInput, data[i].name, "");
                                result_table_html += util.replace(demoTd, data[i].isNeed == "1" ? needHtml: "", data[i].zw, numberInputStr);
                            } else {
                                if (!/^VARCHAR2(\(\d+)\)$/.test(data[i].type)) {
                                    //unexpected type  
                                    continue;
                                } else {
                                    var commonInputStr = util.replace(commonInput, data[i].name, "", Number(data[i].type.match(/^VARCHAR2\((\d+)\)$/)[1])/2);
                                    result_table_html += util.replace(demoTd, data[i].isNeed == "1" ? needHtml: "", data[i].zw, commonInputStr);
                                }
                            }
                        }
                        
                        inner_tr_index++;
                        if (inner_tr_index == 2) {
                            inner_tr_index = 0;
                            result_table_html += "</tr>";
                        }
                        if(i==data.length-1){
                        	if(result_table_html.charAt(result_table_html.length-1)!=">"){
                        		result_table_html+="</tr>";
                        	}
                        }
                    }
                  
                    $('#cache_div').data("typeArr",typeArr);
                    $('#cache_div').data("nameArr",nameArr);
                    $('#cache_div').data("keyNameMap",keyNameMap);
                    $('#cache_div').data("validateBind",validateBind);
                    $('#'+ids.main_form).append($(result_table_html))
                    
                    var dataInsert=function (){
                    	 var data=$('#cache_div').data("dataResult");
                         if(data){
                         	for (var i=0;i<nameArr.length;i++){
                         		$('#'+nameArr[i]).val(data[0][i]);
                         	}
                         }
                    }();
                   
                    var datePickerBind=~function (dateBindId){
                    	if(!dateBindId||dateBindId.length==0)
                    		return;
                    	for(var i=0;i<dateBindId.length;i++){
                    		$('#'+dateBindId).bind("focus", function () {
                                 WdatePicker({dateFmt:'yyyy-MM-dd'});
                             })
                    	}
                    }(dateBindId);
                    var validates=~function (){
                    	for (var key in validateBind){
                			$('#'+key).bind("change",function (){
                				var id=$(this).attr("id");
                				var keyNameMap=$('#cache_div').data("keyNameMap");
                				var validateBind=  $('#cache_div').data("validateBind");
                				var zw=keyNameMap[id];
                				if(!validateBind)return;
                				var validateArr=validateBind[id];
                				var value=$(this).val();
                				var isWrong=false;
                				for(var i=0;i<validateArr.length;i++){
                					if(isWrong)break;
                					var validateString=util.replace(validateArr[i][1],value);
                    				var errorMsg=validateArr[i][0];
                					~function (validateStr,item,zw,errorMsg){
                						var result=true;
                            			try{
                            				result=eval(validateStr);
                            			}catch(e){
                            				if(console){
                            					console.error("验证规则代码错误");
                            				}
                            			}
                            			if(!result){
                            				item.focus();
                            				isWrong=true;
                            				layer.msg(zw+":字段出现以下错误:"+errorMsg+"!");
                            			}
                					}(validateString,$(this),zw,errorMsg)
                				}
                    			
                    		})
                		}
                    }();
                }
            }
            var subValidate=function (){
            	var validateBind=  $('#cache_div').data("validateBind");
            	var keyNameMap=$('#cache_div').data("keyNameMap");
            	if(!validateBind)return;
            	for(var key in validateBind){
            		var validateArr=validateBind[key];
            		var value=$('#'+key).val();
            		for(var i=0;i<validateArr.length;i++){
    					var validateString=util.replace(validateArr[i][1],value);
        				var errorMsg=validateArr[i][0];
    					var result=true;
            			try{
            				result=eval(validateString);
            			}catch(e){
            				if(console){
            					console.log(validateString)
            					console.error("验证规则代码错误");
            				}
            			}
            			if(!result){
            				$('#'+key).focus();
            				layer.msg(keyNameMap[key]+":字段出现以下错误:"+errorMsg+"!");
            				return false;
            			}
    				}
            	}
            	return true;
            }
            ~function() {
            	 var cacheDivPrepare=~function (){
                     $('body').append("<div style='display:none' id='cache_div'> </div>")
                 }();
                createTable(data_id);
                var initTitle=~function (){
                	var tableName=localStorage.tableName;
            		var tableNameZW=localStorage.tableNameZW;
            		if(query_type=="add"){
            			$('#'+ids.title).html(tableNameZW+"("+tableName+")新增");
            		}else{
            			$('#'+ids.title).html(tableNameZW+"("+tableName+")编辑");
            		}
                }();
                $('#'+ids.backBtn).bind("click",function (){
                	location.href=urls.basicUrl+urls.backUrl+"?id="+tableMsgId;
                })
                $('#'+ids.subBtn).bind("click",function (){
                	if(!subValidate())return;
                	var nameArr=$('#cache_div').data("nameArr");
                	var typeArr=$('#cache_div').data("typeArr");
                	var valueArr=[];
                	for(var i=0;i<nameArr.length;i++){
                		valueArr.push(util.encode($('#'+nameArr[i]).val()));
                	}
                	var queryObject={
                			nameArr:nameArr,
                			valueArr:valueArr,
                			typeArr:typeArr
                	};
                	$.ajax({
            			url:urls.basicUrl + (query_type=="add"?urls.subUrl2:urls.subUrl1),
            			data:{id:data_id,tableName:localStorage.tableName,tableData:util.toJson(queryObject)},
            			type:'post',
            			success:function (data){
            				if(data=="1"){
            					layer.msg("保存成功!");
            					$('#'+ids.backBtn).trigger("click");
            				}
            			}
            		})
                })
            }()
        }
    }
    app.prototype = app.fn
    return app
})