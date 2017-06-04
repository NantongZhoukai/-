; define(function (require) {
    var $ = require('jquery');
    var util=require("util");
    ~function(){
        $('body').append("<div style='display:none' id='cache_div'> </div>")
    }();
    var myCache=function (){
        var key,value, limit;
        //存数据
         key=arguments[0];
        if(arguments.length>1){
            value=arguments[1];
            limit=arguments[2];
    	 limit=Number(limit);
         if(!limit)limit=60000;
    	  $('#cache_div').data(key,value);
          $('#cache_div').data(key+"_time",new Date().getTime()+limit);
            
        }
        //取数据
        else{
    		 var time=  $('#cache_div').data(key+"_time");
             if(!time)return null;
             var currentTime=new Date().getTime();
             if(currentTime<time)
                 return  $('#cache_div').data(key);
             else{
                 $.removeData(key);
                 $.removeData(key+"_time");
                 return null;
             }
        	
        }
    }
    var myCacheAjax=function (opt){
        var url=opt.url;
        var data=opt.data;
        var limit=Number(opt.limit);
        if(!limit)limit=60000;
        if(data){
             try{
                data=data.toJSONString();
             }catch(e){
                 data=data+"";
             }
        }
        var key=url+data?data:"";
        key=util.hashCode(key);
        var callBack=opt.success;
        var cacheData=$.simpleCache(key);
        if(cacheData){
            callBack(cacheData);
        }else{
            opt.success=function (data){
                $.simpleCache(key,data,limit);
                callBack(data);
            }
            $.ajax(opt);
        }
    }
    $.simpleCache=myCache;
    $.cacheAjax=myCacheAjax;
});