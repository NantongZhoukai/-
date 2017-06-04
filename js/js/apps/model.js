;define(function(require) {
    var $ = require('jquery');
    var layer = require("layer");
    var description = require('description');
    var htmlFormat = require('htmlFormat');
    var util = require('util');
    var py=require('chinese');
    var app = function() {};
    app.fn = {
        model_ListPage_init: function(basicUrl) {
            var urls = {
                basicUrl: basicUrl,
                editUrl: '/simpleCreator_toModelAddPage.do?type=edit',
                deleteUrl: '/simpleCreator_removeModel.do?',
                addUrl: '/simpleCreator_toModelAddPage.do?type=add'
            };
            var ids = {
                addBtn: 'addBtn',
                removeBtn: 'removeBtn',
                table: 'main_table',
                checkAllBox: 'checkAll',
                editBtn: {
                    idValue: 'id-value',
                    name: 'name-editBtn'
                }
            }
            var eventObject = {
                addBtnClick: function() {
                    $('#' + ids.addBtn).bind("click",
                    function() {
                        location.href = urls.basicUrl + urls.addUrl;
                    })
                },
                editBtnClick: function() {
                    $('div[name="' + ids.editBtn.name + '"]').bind("click",
                    function() {
                        location.href = urls.basicUrl + urls.editUrl + '&id=' + $(this).attr(ids.editBtn.idValue);
                    })
                },
                removeBtnClick: function() {
                    $('#' + ids.removeBtn).bind("click",
                    function() {
                        var deleteIds = [];
                        $('input[type="checkbox"]:checked', $('#' + ids.table + " tr:gt(0)")).each(function() {
                            deleteIds.push($(this).attr("id"));
                        })
                        if (deleteIds.length < 1) {
                            layer.msg("至少选择一个");
                            return;
                        }
                        $.ajax({
                            url: urls.basicUrl + urls.deleteUrl,
                            type: 'post',
                            data: {
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
            }
            ~function() {
                for (var key in eventObject) eventObject[key]()
            } ()
        },
        model_addPage_init: function(basicUrl,query_type) {
            var urls = {
                basicUrl: basicUrl,
                backUrl: '/simpleCreator_toModelList.do?',
                subUrl: '/simpleCreator_addOrUpdateModel.do?',
                querySavedDataUrl:'/simpleCreator_getModelDetail.do',
            };
            var ids = {
                addBtn: 'addBtn',
                subBtn: 'subBtn',
                backBtn: 'backBtn',
                table_below: 'table_main'
            };
            var optionDescription = "select[name='type']>(option[value='%s']>%s)*4";
            var dataTypes_Arr = ['NUMBER', 'NUMBER', 'DATE', 'DATE', 'VARCHAR2', 'VARCHAR2', 'CLOB', 'CLOB'];
            var trDescription = "tr[ref='new']>(td>input[ maxlength='30' name='name'])+(td>input[name='zw' maxlength='30'])+(td>(%s))+(td)+(td>input[name='xh'])+(td>select>(option[value='0']>否))+(td>select>(option[value='0']>是))+(td>input[value='删除'name='remove' type='button'])"
            var savedDescription="tr[ref='old']>((td>%s)*5)+(td>否)+(td>是)+(td)"
            var specialKeys = ['SELECT', 'DATA', 'SEQ', 'FROM', 'COLMUN', 'DELETE', 'REMOVE', 'DATE', 'ON', 'INTO', 'WHERE', 'IF', 'ELSE', 'FUNCTION', 'DATABASE'];
            var demoTr = null,savedTr=null;
            var reg1 = /^[a-z|A-Z|_][a-z|A-Z|_|0-9]*$/;
            var reg2= /^VARCHAR2\((\d+)\)$/;
            var utilObject = {
                demoTrCreate: function() {
                    if (demoTr) return demoTr;
                    var selectHtml = util.replace_(description(optionDescription), dataTypes_Arr);
                    return demoTr = htmlFormat(util.replace(description(trDescription), selectHtml));
                },
                savedTrCreate:function (){
                	if(savedTr)return savedTr;
                	return  savedTr=description(savedDescription);
                },
                getNextIndex: function() {
                	var xhs=$('input[name="xh"]');
                	var index=xhs.length-2<0?0:xhs.length-2;
                	var last2=$('input[name="xh"]').eq(index);
                    var value = Number(last2.val());
                    return value + 1;
                },
                checkForSub: function() {
                	var repeat_name={},repeat_zw={};
                    var querData = {
                        columns: [],
                        columns_zw: [],
                        columns_type: [],
                        columns_xh: [],
                        columns_isPrimary:[]
                    };
                    var pass = true;
                    $('#'+ids.table_below).find("tr").each(function() {
                        if ($(this).attr("ref") == "new") {
                            var $tds = $(this).find("td");
                            var nameItem, zwItem, typeItem, xhItem;
                            nameItem = $tds.find("input[name='name']");
                            zwItem = $tds.find("input[name='zw']");
                            typeItem = $tds.find("select[name='type']");
                            xhItem = $tds.find("input[name='xh']");
                            var name, zw, type, xh;
                            name = nameItem.val();
                            zw = zwItem.val();
                            type = typeItem.val();
                            xh = xhItem.val();
                            if (type === "VARCHAR2") {
                                var lengthItem = $tds.find("input[name='length']");
                                var length = lengthItem.val();
                                if (length == null || '' == $.trim(length)) {
                                    layer.msg("VARCHAR2类型需要填写长度!");
                                    lengthItem.focus();
                                    return pass = false;
                                }
                                type = "VARCHAR2(" + Number(length)  + ")";
                            }
                            if (!name && !zw) {
                                $tds.find("input[name='remove']").trigger("click");
                            } else {
                                if (!name) {
                                    layer.msg("字段名不能为空!");
                                    nameItem.focus();
                                    return pass = false;
                                } else if (!zw) {
                                	layer.msg("字段中文名不能为空!");
                                    zwItem.focus();
                                    return pass = false;
                                }  else if (!xh) {
                                	layer.msg("字段排序号不能为空!");
                                    xhItem.focus();
                                    return pass = false;
                                }
                                if (!reg1.test(name)) {
                                	layer.msg("字段名必须为英文!");
                                    nameItem.val("").focus();
                                    return pass = false;
                                }
                                if (util.inArray_(name,specialKeys)) {
                                	layer.msg("字段名称不合法");
                                    nameItem.val("").focus();
                                    return pass = false;
                                }
                                if(!repeat_name[name.toUpperCase()]){
                                	repeat_name[name.toUpperCase()]=true;
                                }else{
                                	layer.msg("字段名称重复");
                                    nameItem.val("").focus();
                                    return pass = false;
                                }
                                if(!repeat_zw[zw]){
                                	repeat_zw[zw]=true;
                                }else{
                                	layer.msg("中文名称重复");
                                    zwItem.val("").focus();
                                    return pass = false;
                                }
                                querData.columns.push(name);
                                querData.columns_type.push(type);
                                querData.columns_zw.push(util.encode(zw));
                                querData.columns_xh.push(xh);
                                querData.columns_isPrimary.push(name == "id" ? "1": "0");
                            }
                        }
                    });
                    if(pass){
                    	var aboveNameItem=$('input[name="name"]');
                        if(!aboveNameItem.val()){
                        	layer.msg("模板名称必填!")
                        	aboveNameItem.focus();
                        	return;
                        }
                        return querData;
                    }
                }
            };
            var query = function() {
            	var tableMsg;
            	if(tableMsg=utilObject.checkForSub()){
            		var data={
            			id:$('input[name="id"]').val(),
            			name:$('input[name="name"]').val(),
            			notice:$('textarea[name="notice"]').val(),
            			tableData:util.toJson(tableMsg)
            		}
            		$.ajax({
        				url:urls.basicUrl+urls.subUrl,
        				type:'post',
        				data:data,
        				success:function (data){
        					if(data=="1"){
        						$('#'+ids.backBtn).trigger("click");
        					}else{
        						layer.msg("保存失败,请重试");
        					}
        				},
        				error:function (){
        					layer.msg("ajax调用错误!");
        				}
        			})
            	}
            };
            var savedDataInit=function (){
            	var id =$('input[name="id"]').val();
            	$.ajax({
    				url:urls.basicUrl+urls.querySavedDataUrl,
    				type:'post',
    				data:{id:id},
    				success:function (data){
    					saveDataCallBack(data)
    				},
    				error:function (){
    					layer.msg("ajax调用错误!");
    				}
    			})
    			var saveDataCallBack=function(data){
            		if(!data||!(data=eval("("+data+")"))||data.length==0)
            			return;
            		var savedTr=utilObject.savedTrCreate();
            		var resultHtml="";
            		for(var i=0;i<data.length;i++){
            			var type=data[i][3],length="";
            			if(reg2.test(type)){
            				length=type.match(reg2)[1];
            				type="VARCHAR2"
            			}
            			resultHtml+=util.replace(savedTr,data[i][1],data[i][2],type,length,data[i][4]);
            		}
            		$('#' + ids.table_below).append($(resultHtml));
            	}
            }
            var eventObject = {
                addBtnClick: function() {
                    var trEventBind = function($item) {
                        //删除该行
                        $item.find("input[name='remove']").click(function() {
                            $item.remove();
                        });
                        
                        //排序号 正整数
                        $item.find("input[name='xh']").val(utilObject.getNextIndex()).blur(function() {
                            var value = $(this).val();
                            if (!value) return;
                            if (! (isNaN(value)) && Number(value) > 0 && Number(value) <= 2147483647) {
                                $(this).val(Math.floor(value));
                            } else {
                                $(this).val("");
                            }
                        }).change(function() {
                            $(this).trigger("blur");
                        });
                        //根据中文自动填充英文
                        $item.find('input[name="zw"]').blur(function (){
                        	var value;
                        	if(value=$(this).val()){
                        		var pingyin=py(value);
                        		if(pingyin&&pingyin.length>0)
                        			$(this).parent().prev().find('input').val(pingyin[0]);
                        	}
                        }).change(function (){
                        	$(this).trigger("blur");
                        })
                        // 选中VARCHAR2 后面那个td 加个input 长度 长度介于 1-4000
                        $item.find("select[name='type']").change(function() {
                            var $next_nextTr = $(this).parent().next();
                            if ($(this).val() == "VARCHAR2") {
                                var $input = $('<input name="length" />');
                                $next_nextTr.html($input);
                                $input.blur(function() {
                                    var value = $(this).val();
                                    if (!value) return;
                                    if (! (isNaN(value)) && Number(value) > 0 && Number(value) <= 4000) {
                                        $(this).val(Math.floor(value));
                                    } else {
                                        layer.msg("varchar2的长度最大只能是4000");
                                        $(this).val("");
                                    }
                                }).change(function() {
                                    $(this).trigger("blur");
                                })
                            } else {
                                $next_nextTr.html("");
                            }
                        })
                    };
                    $('#' + ids.addBtn).bind("click",function() {
                        var $insertItem = $(utilObject.demoTrCreate());
                        $('#' + ids.table_below).append($insertItem);
                        trEventBind($insertItem);
                    });
                },
                subBtnClick: function() {
                    $('#' + ids.subBtn).bind("click",function() {
                    	query();
                    })
                },
                backBtnClick: function() {
                    $('#' + ids.backBtn).bind("click",function() {
                        location.href = urls.basicUrl + urls.backUrl;
                    })
                }
            }
            ~function() {
                for (var key in eventObject) 
                	eventObject[key]();
                if(query_type==='edit')
                	savedDataInit();
            } ()
        }
    }
    app.prototype = app.fn
    return app
})