;define(function(require) {
    var $ = require('jquery');
    var layer = require("layer");
    var description = require('description');
    var util = require('util');
    var py=require('chinese');
    var app = function() {};
    app.fn = {
        bussniess_ListPage_init: function(basicUrl) {
            var urls = {
                basicUrl: basicUrl,
                editUrl: '/simpleCreator_toBusinessAddPage.do?type=edit',
                deleteUrl: '/simpleCreator_removeBusiness.do?',
                detailUrl:'/simpleCreator_toBusinessTableList.do?',
                addUrl: '/simpleCreator_toBusinessAddPage.do?type=add'
            };
            var ids = {
                addBtn: 'addBtn',
                removeBtn: 'removeBtn',
                table: 'main_table',
                checkAllBox: 'checkAll',
                editBtn: {
                    idValue: 'id-value',
                    name: 'name-editBtn'
                },
                detailBtn:{
                	idValue: 'id-value',
                	name: 'name-editDataBtn'
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
                editDataClick:function (){
	            	  $('div[name="' + ids.detailBtn.name + '"]').bind("click",
	                  function() {
	                      location.href = urls.basicUrl + urls.detailUrl + '&id=' + $(this).attr(ids.detailBtn.idValue);
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
        bussiness_addPage_init: function(basicUrl,query_type) {
            var urls = {
                basicUrl: basicUrl,
                backUrl: '/simpleCreator_toBusinessList.do?',
                subUrl: '/simpleCreator_addBussiness.do?',
                addColumnUrl:'/simpleCreator_addColumns.do',
                queryModelDataUrl:'/simpleCreator_getModelDetail.do',
                querySavedDataUrl:'/simpleCreator_getBusinessDetail.do',
                getJsUrl:'/simpleCreator_getValidateJS.do',
                getDicUrl:'/simpleCreator_getDic.do',
                getModelUrl:'/simpleCreator_getColumnsByModelId.do',
                checkTableIsExsitUrl:'/simpleCreator_checkTableIsExsit.do',
                dataChange:'/simpleCreator_updateCommon.do'
            };
            var ids = {
                addBtn: 'addBtn',
                subBtn: 'subBtn',
                backBtn: 'backBtn',
                table_below: 'table_main',
                table_above:'headTable'
            };
            var optionDescription = "select[name='type']>(option[value='%s']>%s)*4";
            var dataTypes_Arr = ['NUMBER', 'NUMBER', 'DATE', 'DATE', 'VARCHAR2', 'VARCHAR2', 'CLOB', 'CLOB'];
            var trDescription = "tr[ref='new']>(td>input[ maxlength='30' name='name'])+(td>input[name='zw' maxlength='30'])" +
            		"(td>%s)+(td>%s)+(td>input[name='xh'])+(td>select[name=\"isShow\"]>(option[value='0']>否)+(option[value='1']>是))+" +
            		"(td>select[name='isNeed']>(option[value='0']>否)+(option[value='1']>是))+(td>(input[name='js' style='display:none'])+" +
            		"(input[name='dic' style='display:none'])+(input[value='更多' name='more' type='button'])+(input[value='删除'name='remove' type='button']))"
            var modelDescription="tr[ref='old']>((td>%s)*5)+(td>否)+(td>是)+(td)"
            var specialKeys = ['SELECT', 'DATA', 'SEQ', 'FROM', 'COLMUN', 'DELETE', 'REMOVE', 'DATE', 'ON', 'INTO', 'WHERE', 'IF', 'ELSE', 'FUNCTION', 'DATABASE'];
            var trSavedDescription="tr[ref='saved' data-id='%s' ]>(td>%s)+(td>input[name='zw' maxlength='30' value='%s']) + " +
            		"+(td>%s)+(td>%s)+(td><input name='xh' value='%s'>)+(td>select[name=\"isShow\"]>(option[value='0' %s ]>否)+(option[value='1' %s ]>是))+(td>select[name='isNeed']>(option[value='0' %s ]>否)+(option[value='1' %s ]>是))"+
            		"+(td>(input[name='js' style='display:none' value='%s'])+(input[name='dic' style='display:none' value='%s'])+(input[value='更多' name='more' type='button']))"
                    var savedDescription="tr[ref='old']>((td>%s)*5)+(td>否)+(td>是)+(td)"
            var demoTr = null,
            modelTr=null,
            moreTable=null,
            savedTr=null;
            var moreTableDescription="table[class=\"tb-form\" id='chooseMore']>(tr>(td[ width='40%']>字典)+(td>%s))+(tr>(td[width='40%']>验证规则)+(td>%s))";
            var reg1 = /^[a-z|A-Z|_][a-z|A-Z|_|0-9]*$/;
            var reg2= /^VARCHAR2\((\d+)\)$/;
            var utilObject = {
                demoTrCreate: function() {
                    if (demoTr) return demoTr;
                    var selectHtml = util.replace_(description(optionDescription), dataTypes_Arr);
                    return demoTr = util.replace(description(trDescription), selectHtml);
                },
                modelTrCreate:function (){
                	if(modelTr)return modelTr;
                	return  modelTr=description(modelDescription);
                },
                savedTrCreate:function (){
                	if(savedTr)return savedTr;
                	return savedTr=description(trSavedDescription);
                },
                moreTableCreate:function (){
                	if(moreTable)return moreTable;
                	return moreTable=description(moreTableDescription);
                },	
                getNextIndex: function() {
                	var xhs=$('input[name="xh"]');
                	var index=xhs.length-2<0?0:xhs.length-2;
                	var last2=$('input[name="xh"]').eq(index);
                    var value = Number(last2.val());
                    if(!last2)value=0;
                    return value + 1;
                },
                checkTableIsExsit:function (tableName){
                	var value=0;
                	$.ajax({
                		url:urls.basicUrl+urls.checkTableIsExsitUrl,
                		data:{tableName:tableName},
                		async:false,
                		success:function (data){
                			value=data;
                		}
                	})
                	return value;
                },
                prepareForRepeatValidate:function (name,zw){
    				var nameObject=$('#cache_div').data("repeatValidate_name");
    				var zwObject=$('#cache_div').data("repeatValidate_zw");
    				if(!nameObject){
    					nameObject={};
    				}
    				nameObject[name.toUpperCase()]=true;
    				if(!zwObject){
    					zwObject={};
    				}
    				zwObject[zw.toUpperCase()]=true;
    				$('#cache_div').data("repeatValidate_name",nameObject,"infinity");
    				$('#cache_div').data("repeatValidate_zw",zwObject,"infinity");
    			},
                checkForSub: function() {
                	var repeat_name=$('#cache_div').data("repeatValidate_name"),repeat_zw=$('#cache_div').data("repeatValidate_zw");
                	if(!repeat_name){
                			repeat_name={};
                	}
                	else{
                		repeat_name=$.extend({},repeat_name);
                	}
                	if(!repeat_zw){
                		repeat_zw={};
                	}else{
                		repeat_zw=$.extend({},repeat_zw);
                	}
                	var querData = {
                        columns: [],
                        columns_zw: [],
                        columns_type: [],
                        columns_xh: [],
                        columns_isShow:[],
                        columns_isNeed:[],
                        columns_dic:[],
                        columns_js:[]
                    };
                    var pass = true;
                    $('#'+ids.table_below).find("tr").each(function() {
                        if ($(this).attr("ref") == "new") {
                            var $tds = $(this).find("td");
                            var nameItem, zwItem, typeItem, xhItem,isShowItem,isNeedItem,dicItem,jsItem
                            nameItem = $tds.find("input[name='name']");
                            zwItem = $tds.find("input[name='zw']");
                            typeItem = $tds.find("select[name='type']");
                            xhItem = $tds.find("input[name='xh']");
                            isNeedItem=$tds.find("select[name='isNeed']");
                            isShowItem=$tds.find('select[name="isShow"]');
                            dicItem=$tds.find('input[name="dic"]');
                            jsItem=$tds.find('input[name="js"]');
                            var name, zw, type, xh,isShow,isNeed,dic,js;
                            name = nameItem.val();
                            zw = zwItem.val();
                            type = typeItem.val();
                            xh = xhItem.val();
                            isShow=isShowItem.val();
                            isNeed=isNeedItem.val();
                            dic=dicItem.val();
                            js=jsItem.val();
                            if (type === "VARCHAR2") {
                                var lengthItem = $tds.find("input[name='length']");
                                var length = lengthItem.val();
                                if (length == null || '' == $.trim(length)) {
                                    layer.msg("VARCHAR2类型需要填写长度!");
                                    lengthItem.focus();
                                    return pass = false;
                                }
                                type = "VARCHAR2(" + Number(length) + ")";
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
                                querData.columns_isShow.push(isShow);
                                querData.columns_isNeed.push(isNeed);
                                querData.columns_dic.push(dic);
                                querData.columns_js.push(js);
                            }
                        }
                    });
                    if(pass){
                    	var subObject={};
                    	var table_above=$('#'+ids.table_above);
                    	var aboveNameItem=$('input[name="name"]',table_above);
                    	var aboveNameZWItem=$('input[name="name_zw"]',table_above);
                    	var aboveNameModelItem=$('#model_id',table_above);
                    	var typeDetailItem=$('#type_detail',table_above);
                    	var detailItem=$('textarea[name="notice"]',table_above);
                        if(!(subObject.name=aboveNameItem.val())){
                        	layer.msg("事项表名必填!")
                        	aboveNameItem.focus();
                        	return;
                        }else{
                        	if(!reg1.test(subObject.name)){
                        		layer.msg("事项表名不合法!")
                        		aboveNameItem.val("").focus();
                        		return;
                        	}
                        }
                        if(!(subObject.name_zw=aboveNameZWItem.val())){
                        	layer.msg("事项中文名称必填!")
                        	aboveNameZWItem.focus();
                        	return;
                        }
                        if("-1"==(subObject.model_id=aboveNameModelItem.val())){
                        	layer.msg("请选择对应模板!")
                        	return;
                        }
                        subObject.type_detail=typeDetailItem.val();
                        subObject.notice=detailItem.val();
                        subObject.tableData=querData;
                        var isShowItems=$('select[name="isShow"]');
                        var isShowData=[];
                        isShowItems.each(function (){
                        	isShowData.push($(this).val());
                        });
                        if(!util.inArray("1",isShowData)){
                        	layer.msg("至少选择一个为显示字段");
                        	return;
                        }
                        if(query_type=='add'){
                        	if(!querData.columns||querData.columns.length==0){
                            	layer.msg("至少添加一行数据");
                            	return;
                            }
                        	if("1"==utilObject.checkTableIsExsit(subObject.name)){
                              	layer.msg("表名已经存在,请重新填写");
                              	aboveNameItem.val("").focus();
                              	return;
                            }
                        }else{
                        	subObject.id=$('input[name="id"]').val();                        	
                        }
                        subObject.tableData=querData;
                        return subObject;
                    }
                }
            };
            var query = function() {
            	var tableMsg;
            	if(tableMsg=utilObject.checkForSub()){
            		tableMsg.tableData=util.toJson(tableMsg.tableData);
            		$.ajax({
        				url:urls.basicUrl+(query_type=="add"?urls.subUrl:urls.addColumnUrl),
        				type:'post',
        				data:tableMsg,
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
        			});
            	}
            };
            var savedDataInit=function (){
            	var id =$('input[name="id"]').val();
            	var modelInit=~function (id){
            		var modelDataCallBack=function(data){
                		if(!data||!(data=eval("("+data+")"))||data.length==0)
                			return;
                		var modelTr=utilObject.modelTrCreate();
                		var resultHtml="";
                		for(var i=0;i<data.length;i++){
                			var type=data[i][3],length="";
                			if(reg2.test(type)){
                				length=type.match(reg2)[1];
                				type="VARCHAR2"
                			}
                			resultHtml+=util.replace(modelTr,data[i][1],data[i][2],type,length,data[i][4]);
                			//重复字段比较准备
                			utilObject.prepareForRepeatValidate(data[i][1],data[i][2]);
                		}
                		$('#' + ids.table_below).append($(resultHtml));
                	}
            		$.ajax({
        				url:urls.basicUrl+urls.querySavedDataUrl,
        				type:'post',
        				data:{id:$('#model_id').val()},
        				async:false,
        				success:function (data){
        					modelDataCallBack(data)
        				},
        				error:function (){
        					layer.msg("ajax调用错误!");
        				}
        			})
            	}(id);
            	var bussniessDataInit=~function (id){
            		// 绑定 更多的点击事件        修改事件统一绑定
            		var getMoreEventBind=function(item){
        			  item.find('input[name=\'more\']').click(function (){
                      	var parent=$(this).parent();
                      	showMore(parent.find("input[name='dic']").val(),parent.find("input[name='js']").val(),parent.closest("tr"));
                      });
            		}
            		//所有的修改的事件
            		var changeEventBind=function (){
            			var itemTrs=$('tr[ref="saved"]');
            			var queryUpdate=function (data){
            				$.ajax({
            					url:urls.basicUrl+urls.dataChange,
            					data:data,
            					type:'post'
            				})
            			}
            			var nameChange=~function (item){
            				if(!item)return;
        					item.bind("change",function (){
        						queryUpdate({
            						id:$(this).closest("tr").attr("data-id"),
            						type:'COLUMN_ZW',
            						value:$(this).val()
            					});
        					})
            			}($('input[name="zw"]',itemTrs));
            			var xhChange=~function (item){
            				if(!item)return;
        					item.bind("change",function (){
        						queryUpdate({
            						id:$(this).closest("tr").attr("data-id"),
            						type:'XH',
            						value:$(this).val()
            					});
        					})
            			}($('input[name="xh"]',itemTrs));
            			var isShowChange=~function(item){
            				if(!item)return;
        					item.bind("change",function (){
        						queryUpdate({
            						id:$(this).closest("tr").attr("data-id"),
            						type:'ISSHOW',
            						value:$(this).val()
            					});
        					})
            			}($('select[name="isShow"]',itemTrs));
            			var isNeedChange=~function (item){
            				if(!item)return;
        					item.bind("change",function (){
        						queryUpdate({
            						id:$(this).closest("tr").attr("data-id"),
            						type:'ISNEED',
            						value:$(this).val()
            					});
        					})
            			}($('select[name="isNeed"]',itemTrs));
            			var dicChange=~function (item){
            				if(!item)return;
            				item.bind("change",function (){
        						queryUpdate({
            						id:$(this).closest("tr").attr("data-id"),
            						type:'DIC',
            						value:$(this).val()
            					});
        					})
            			}($('input[name="dic"]',itemTrs));
            			var jsChange=~function (item){
            				if(!item)return;
            				item.bind("change",function (){
        						queryUpdate({
            						id:$(this).closest("tr").attr("data-id"),
            						type:'JS',
            						value:$(this).val()
            					});
        					})
            			}($('input[name="js"]',itemTrs));
            		}
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
                			var insertArr=[];
                			var item=data[i];
                			insertArr.push(data[i][0]) //id
                			insertArr.push(data[i][1]) //name
                			insertArr.push(data[i][2]) //中文
                			insertArr.push(type) //类型
                			insertArr.push(length) //长度
                			insertArr.push(data[i][4]);//序号
                			//是否列表展示;是否必填
                			void function (value){
                				if("1"==value){
                					insertArr.push("");
                					insertArr.push("selected");
                				}else{
                					insertArr.push("selected");
                					insertArr.push("");
                				}
                				return arguments.callee;
                			}(data[i][5])(data[i][6])
                			insertArr.push(data[i][8]);	//js
                			insertArr.push(data[i][7]);//字典
                			var resultHtml=util.replace_(savedTr,insertArr);
                			var item=$(resultHtml);
                			$('#' + ids.table_below).append(item);
                			getMoreEventBind(item);
                			//重复字段比较准备
                			utilObject.prepareForRepeatValidate(data[i][1],data[i][2]);
                		}
                		changeEventBind();
                	}
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
            	}(id);
            }
            var showMore=function (dicId,jsId,itemTr){
            	$.when(
					$.ajax({url:urls.basicUrl+urls.getJsUrl }),
					$.ajax({url:urls.basicUrl+urls.getDicUrl})
				).done(function (jss,dics){
					var result={js:"",dic:""};
					if((jss=jss[0])&&(jss=eval("("+jss+")"))&&jss.length>0)
						result.js=util.selectCreate(jss,jsId);
					if((dics=dics[0])&&(dics=eval("("+dics+")"))&&dics.length>0)
						result.dic=util.selectCreate(dics,dicId);
					jsAndDicCallback(result);
				}).fail(function (){
					layer.msg("ajax调用错误!");
				})
				var eventBind=function (){
            		var selects=$('#chooseMore').find("select");
            		var dicSelect=selects.eq(0),jsSelect=selects.eq(1);
            		dicSelect.change(function (){
            			jsSelect.val("-1");
            		})
            		jsSelect.change(function (){
            			dicSelect.val("-1");
            		})
            	}
            	var eventConfirm=function (tr){
            		var selects=$('#chooseMore').find("select");
            		var dicSelect=selects.eq(0),jsSelect=selects.eq(1);
            		tr.find('input[name="js"]').val(jsSelect.val()).trigger("change");
            		tr.find('input[name="dic"]').val(dicSelect.val()).trigger("change");
            	}
            	var jsAndDicCallback=function (result){
            		var result=util.replace(utilObject.moreTableCreate(),result.dic,result.js);
            		layer.open({
      				  type: 1,
      				  title:'更多(无法同时使用字典和验证规则)',
      				  skin: 'layui-layer-rim', 
      				  area: ['420px', '180px'],
      				  content:result,
      				  btn: ['保存','关闭'],
      				  yes:function(index, layero){
      					  eventConfirm(itemTr)
      					  layer.close(index); 
      				  },btn2:function(index){ layer.close(index); }
      				});
            		eventBind(result);
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
                        $item.find('input[name=\'more\']').click(function (){
                        	var parent=$(this).parent();
                        	showMore(parent.find("input[name='dic']").val(),parent.find("input[name='js']").val(),parent.closest("tr"));
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
                    	var model_id=$('#model_id').val();
                    	if(model_id=="-1"){
                    		layer.msg("请先选择相应模板");
                    		return;
                    	}
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
                },
                modelChoose:function (){
                	var modelCallback=function (data){
                		if(!data||!(data=eval("("+data+")"))||data.length==0){
                			layer.msg("模板数据错误");
                			return;
                		}
                		var savedTr=utilObject.modelTrCreate();
                		var resultHtml="";
                		for(var i=0;i<data.length;i++){
                			var type=data[i][3],length="";
                			if(reg2.test(type)){
                				length=type.match(reg2)[1];
                				type="VARCHAR2"
                			}
                			resultHtml+=util.replace(savedTr,data[i][1],data[i][2],type,length,data[i][4]);
                			utilObject.prepareForRepeatValidate(data[i][1],data[i][2]);
                		}
                		$('#' + ids.table_below).find("tr:gt(0)").remove();
                		$('#' + ids.table_below).append($(resultHtml));
                	}
                	$('#model_id').bind("change",function (){
                		var id;
                		if((id=$(this).val())!="-1"){
            				$.ajax({
            					url:urls.basicUrl+urls.getModelUrl,
            					data:{id:id},
            					success:function (result){
            						modelCallback(result);
            					},
            					fail:function (){
            						layer.msg("模板数据获取失败");
            					}
            				})
            			}
                	})
                }
            }
            
           
            ~function() {
                for (var key in eventObject) 
                	eventObject[key]();
                if(query_type==='edit'){
                	savedDataInit()
                	var type_edit_init=~function (){
                    	$('#model_id').css("display","none")
                    	$('#model_id').after($('#model_id').find("option:selected").html())
                    	$('input[name="name"]',$('#'+ids.table_above)).attr("readonly","readonly");
                    }();
                }
                var cacheDivPrepare=~function (){
                    $('body').append("<div style='display:none' id='cache_div'> </div>")
                }();
            } ()
        }
    }
    app.prototype = app.fn
    return app
})