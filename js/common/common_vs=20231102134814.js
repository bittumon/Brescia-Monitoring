//获取本月天数
function getDays() {
//构造当前日期对象
    var date = new Date();

//获取年份
    var year = date.getFullYear();

//获取当前月份
    var mouth = date.getMonth() + 1;

//定义当月的天数；
    var days;

//当月份为二月时，根据闰年还是非闰年判断天数
    if (mouth == 2) {
        days = year % 4 == 0 ? 29 : 28;

    }
    else if (mouth == 1 || mouth == 3 || mouth == 5 || mouth == 7 || mouth == 8 || mouth == 10 || mouth == 12) {
        //月份为：1,3,5,7,8,10,12 时，为大月.则天数为31；
        days = 31;
    }
    else {
        //其他月份，天数为：30.
        days = 30;

    }
    return days;
}

//合计数组的值
function sumArrayData(array) {
    var sum = 0;
    for (var i = 0; i < array.length; i++) {
        if($.isNumeric(array[i])){
            sum += parseFloat(array[i]);
        }
    }
    return sum;
}

Array.prototype.max = function() {
    var max = $.isNumeric(this[0])?this[0]:0;
    var len = this.length;
    for (var i = 1; i < len; i++){
        var v = $.isNumeric(this[i])?this[i]:0;
        if (parseInt(v) > parseInt(max)) {
            max = this[i];
        }
    }
    return max;
};

function parseJson(data){
    var object = null;
    try{
        object = JSON.parse(data);
        if(!isNotNull(object)||object.result_code==-1){
            showErrorMsg("请求接口数据失败，请刷新重试");
        }
    } catch(e){
        //showErrorMsg();
        log("解析数据出错 data:"+data);
    }

    return object;
}

//检查数据是否返回值
function isNotNull(data){
    if(data == 0 || data == "0"){
        return false;
    }
    if(data==null||data==""||data=="null"||data==undefined||data=="undefined"){
        return false;
    }
    return true;
}

function checkGetValue(data){
    return isNotNull(data)?data:"";
}

function showErrorMsg(message){
    if(!isNotNull(message)){
        message = "数据请求失败，请重试!";
    }
    $("#failInfo").html(message);
    $("#failInfo").slideDown();
    setTimeout(function(){
        $("#failInfo").slideUp();
    },3000);
}

function showLoading(){
    if($("#loadding").length>0){
        $("#loadding").show();
    }
}

function hideLoading(){
    if($("#loadding").length>0){
        $("#loadding").hide();
    }
}

function log(msg){

}

function toFix(num,n){
    if(num==0||num=="0"){
        return 0;
    }
    if(!isNotNull(num)){
        return "--";
    }
    if(!isNotNull(n)){
        n=2;
    }
    var strNum = num +"";
    var lang = getCookie("lang");
    if(lang=="de"){
        strNum = strNum.replace(".",",");
    }
    if($.isNumeric(num)){
       return parseFloat(parseFloat(num).toFixed(n));
    } else {
        return "--";
    }
}

function dealEchartLineArr(arr){
    if(arr && arr.length){
        for(var i = 0; i < arr.length; i ++){
            if("--" == arr[i] || "" == arr[i]){
                arr[i] = "";
            }
        }
    }
    return arr;
}

function dealEchartBarArr(arr){
    if(arr && arr.length){
        if(!$.isNumeric(arr[0])){
            arr[0] = "";//第一个值不能为"--",echart不能正常显示
        }
        for(var i = 1; i < arr.length; i ++){
            if(!$.isNumeric(arr[i])){
                arr[i] = "";
            }
        }
    }
    return arr;
}

function dealEchartToolTip(val){
    if(typeof val == 'undefined' || val == null  || "" == val || "-" == val || "NaN" == val){
        return "--"
    }
    return val;
}

//echart axis.axisTick
var axisTickObj = {
    show: true,
    lineStyle:{
        color: '#ffffff'
    }
};

//计算完成率
function CalculatedCompletionRate(actVal, planVal){
    if($.isNumeric(actVal) && $.isNumeric(planVal) && planVal != 0){
        return parseFloat((actVal/planVal * 100).toFixed(2));
    }
    return "";
}

function sumOfArr(arr){
    var sum = 0;
    for(var i = 0; i < arr.length; i ++){
        if($.isNumeric(arr[i])){
            sum += parseFloat(arr[i]);
        }
    }
    return sum;
}

//累加：a[i] = a[i-1] + a[i]
function addUpArr(arr){
    var restArr = arr.slice(0);
    for(var i = 1; i < restArr.length; i ++){
        if($.isNumeric(restArr[i - 1]) && $.isNumeric(restArr[i])){
            restArr[i] = parseFloat(restArr[i - 1]) +　parseFloat(restArr[i]);
        }else if($.isNumeric(restArr[i - 1])){
            restArr[i] = parseFloat(restArr[i - 1]);
        }
    }
    return restArr;
}

/**
 * 月计划发电量累加：实际值/ (计划值*当前天数/当月天数)
 * 当前月之前：a[i] = a[i-1] + a[i]
 * 当前月：a[i] = a[i-1] + a[i]*date/days
 */
function addUpArr_curMonth(arr){
    var restArr = arr.slice(0);
    var now = new Date();
    var mon = now.getMonth();
    var month = mon + 1;
    var day = now.getDate();
    var days = getDays();
    var len = restArr.length;
    if(month == 1){
        restArr[0] = restArr[0] * day / days;
    }else{
        for(var i = 1; i < len && i < month; i ++){
            if($.isNumeric(restArr[i - 1]) && $.isNumeric(restArr[i])){
                if(i == mon){
                    restArr[i] = parseFloat(restArr[i - 1]) +　parseFloat(restArr[i]) * day / days;
                }else {
                    restArr[i] = parseFloat(restArr[i - 1]) +　parseFloat(restArr[i]);
                }
            }else if($.isNumeric(restArr[i - 1])){
                restArr[i] = parseFloat(restArr[i - 1]);
            }
        }
    }
    return restArr;
}

/**
 * 获取用户的组织信息;
 * 大屏logo，
 * 大屏标题，
 * 右下角图片滚动，
 * 累计发电滚动刷新，
 * 星空背景，
 * 点击电站图标刷新两侧数据
 * 电站详细信息按钮
 */
var autoSlideEnergy = false;
function initLogo(){
    $.ajax({
        type: "post",
        data: '',
        url: 'powerAction_loadOrgPro.action',
        async: false,
        dataType: "json",
        beforeSend: function () {
        },
        success: function (data, s) {
            if (data) {
                var object = JSON.parse(data);
                var li_html = "";
                var first = true;
                var result = object.result_data;
                var orgProList = result.orgProList;
                $(".slideBox ul").empty();
                if (typeof orgProList == 'undefined' || typeof orgProList.length == 'undefined') {
                    return;
                }

                /**
                 * 判断大屏标题是否为图片
                 */
                var titleIsImageFlag = false;
                for (var i = 0; i < orgProList.length; i++) {
                    var obj = orgProList[i];
                    if (obj.pro_key == 'logo_name' && obj.pro_value && obj.pro_value.indexOf("http") === 0) {
                        titleIsImageFlag = true;
                        break;
                    }
                }

                for (var i = 0; i < orgProList.length; i++) {
                    var obj = orgProList[i];
                    if (obj.pro_key == 'logo_name' && obj.pro_value) {
                        //当大屏标题为图片性质时候，则title默认值
                        var imgHtml = '<span id="pageTitle">' + obj.pro_value +'</span>';
                        if(titleIsImageFlag){
                            $("title").text(LANG["I18N_COMMON_SMART_ENERGY"]); //默认值
                            imgHtml = '<img src="'+ obj.pro_value + '" class="imageTitle">';
                            $(".systemTitle").addClass("systemImageTitle");
                        } else {
                            $("title").text(obj.pro_value);
                        }
                        $(".systemTitle").html(imgHtml);
                    }else if (obj.pro_key == 'logo_img') {
                        if(obj.pro_value){
                            $("#pageLogImg").css("width","169px");
                            $("#pageLogImg").css("height","48px");
                            $("#pageLogImg").attr("src", obj.pro_value);
                        }
                    }else if (obj.pro_key == 'image') {//右下角滚动图片
                        if(obj.pro_value){
                            if(first){
                                li_html = "";
                                $("#slideBox ul").empty();
                                first = false;
                            }
                            li_html = "<li><img style='width: 100%; height: 205px' src='" + obj.pro_value + "' /></li>";
                            $("#slideBox ul").append(li_html);
                        }
                    }else if (obj.pro_key == 'fp_tile') {
                        if(obj.pro_value && $(".dzsyb_fp")){
                            $(".dzsyb_fp").show();
                            $(".fp_title").text(obj.pro_value);
                            $("#fp_unit").text("户");
                        }
                    }else if (obj.pro_key == 'slide_flag') {//累计发电滚动刷新
                        if(obj.pro_value && obj.pro_value == "1"){
                            autoSlideEnergy = true;
                        }
                    }else if (obj.pro_key == 'bk_style') {//星空背景
                        if(obj.pro_value && obj.pro_value == "0" && typeof startBackGroud != 'undefined'){
                            startBackGroud();
                        }
                    }else if (obj.pro_key == 'ps_target') {//点击电站图标刷新两侧数据
                        if(obj.pro_value && obj.pro_value == "1" && typeof setPsTarget != 'undefined'){
                            setPsTarget();
                        }
                    }else if (obj.pro_key == 'show_dinfo') {//电站详细信息按钮
                        if(obj.pro_value && obj.pro_value == "1" && typeof setShowDetailinfo != 'undefined'){
                            setShowDetailinfo();
                        }
                    }else if (obj.pro_key == 'nyj_left3') {//nyj 页面左下角
                        if(obj.pro_value && obj.pro_value == "1" && typeof setLeft3 != 'undefined'){
                            setLeft3();
                        }
                    }else if (obj.pro_key == 'nyj_right3') {//nyj 页面右下角
                        if(obj.pro_value && obj.pro_value == "1" && typeof setright3 != 'undefined'){
                            setright3();
                        }
                    }else if (obj.pro_key == '1_1_lang') {//1.1 语言切换按钮
                        if(obj.pro_value && obj.pro_value == "1" && typeof showLangDiv != 'undefined'){
                            showLangDiv();
                        }
                    }else if (obj.pro_key == '1_1_right3') {//1.1 右中部与右底部互换位置，然后右底部显示图片轮播
                        if(obj.pro_value && obj.pro_value == "1" && typeof set_1_1_Right3 != 'undefined'){
                            set_1_1_Right3();
                        }
                    }else if (obj.pro_key == '1_1_right2') {//1：右中部显示电站效率，不显示电站PR
                        if(obj.pro_value && obj.pro_value == "1" && typeof set_1_1_Right2 != 'undefined'){
                            set_1_1_Right2();
                        }
                    }else if (obj.pro_key == '1_1_r3_clk') {//1: 点击发电计划弹出显示已接入各电站的发电计划
                        if(obj.pro_value && obj.pro_value == "1" && typeof set_right3_click != 'undefined'){
                            set_right3_click();
                        }
                    }else if (obj.pro_key == 'tt_power') {//1: 点击发电计划弹出显示已接入各电站的发电计划
                        if(obj.pro_value && obj.pro_value == "1" && typeof hide_total_power != 'undefined'){
                            hide_total_power();
                        }
                    }else if (obj.pro_key == '1_1_no_eth') {//1:不显示3d地球,直接显示用户电站区域
                        if(obj.pro_value && obj.pro_value == "1" && typeof skipShow3DEarth != 'undefined'){
                            skipShow3DEarth();
                        }
                    }/*else if (obj.pro_key == '5_only_sl') {//1:大屏5.0仅显示光伏电站
                        if(obj.pro_value && obj.pro_value == "1" && typeof onlyShowSolar != 'undefined'){
                            onlyShowSolar();
                        }
                    }*/else if (obj.pro_key == 'safe_days') {//1:大屏5.0显示右上角安全运营天数
                        if(obj.pro_value && obj.pro_value == "1" && typeof showSafeRunDays != 'undefined'){
                            showSafeRunDays();
                        }
                    } else if (obj.pro_key == '5_st_wind') {//1:大屏5.0展示风光储
                        if (obj.pro_value && obj.pro_value == "1" && typeof showWindStorage != 'undefined') {
                            showWindStorage();
                        }
                    }
                }
                $("#pageTitle").show();
				if(user_key == '22100'){
					$("#pageLogImg").hide();
				}
            } else {
                console.log("获取组织属性失败");
            }
        }
    });
}

/*
 获取地址栏参数
 */
function GetQueryString(name)
{
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r!=null) return unescape(r[2]); return null;
}

//东旭集团定制,特殊需求，临时更改，单位中文转英文 弹出iframe 调用
function replaceUnit_scrn4Dialog(unit){
    var orgId = $("#org_id").val()||$("#org_id",parent.document).val();
    if(orgId!="3040"){
        return unit;
    }
    if (unit=="万度"){
        unit = "万kWh";
    } else if (unit=="亿度"){
        unit = "亿kWh"
    } else if(unit=="度") {
        unit = "kWh";
    }
    return unit;
}

//特殊需求，临时更改，单位中文转英文
function replaceUnit(unit){
	if(curtOrgId_refresh&&curtOrgId_refresh!="3040"){//东旭集团定制
        return unit;
    }
    
    if (unit=="万度"){
        unit = "万kWh";
    } else if (unit=="亿度"){
        unit = "亿kWh"
    } else if(unit=="度") {
        unit = "kWh";
    }
    return unit;
}

function windDirectionTrans(val){
    if($.isNumeric(val)){
        if(val >= 348.76 || val < 11.26){
            return LANG["I18N_COMMON_WIND_DIRECTION1"];
        }else if(val >= 11.26 && val < 33.76){
            return LANG["I18N_COMMON_NORTH_NORTHEAST"];
        }else if(val >= 33.76 && val < 56.26){
            return LANG["I18N_COMMON_NORTHEAST"];
        }else if(val >= 56.26 && val < 78.75){
            return LANG["I18N_COMMON_EAST_NORTHEAST"];
        }else if(val >= 78.75 && val < 101.26){
            return LANG["I18N_COMMON_EAST"];
        }else if(val >= 101.26 && val < 123.76){
            return LANG["I18N_COMMON_EAST_SOUTHEAST"];
        }else if(val >= 123.76 && val < 146.26){
            return LANG["I18N_COMMON_SOUTHEAST"];
        }else if(val >= 146.26 && val < 168.76){
            return LANG["I18N_COMMON_SOUTH_SOUTHEAST"];
        }else if(val >= 168.76 && val < 191.26){
            return LANG["I18N_COMMON_SOUTH"];
        }else if(val >= 191.26 && val < 213.76){
            return LANG["I18N_COMMON_SOUTH_SOUTHWEST"];
        }else if(val >= 213.76 && val < 236.26){
            return LANG["I18N_COMMON_SOUTHWEST"];
        }else if(val >= 236.26 && val < 258.76){
            return LANG["I18N_COMMON_WEST_SOUTHWEST"];
        }else if(val >= 258.76 && val < 281.26){
            return LANG["I18N_COMMON_WEST"];
        }else if(val >= 281.26 && val < 303.76){
            return LANG["I18N_COMMON_WEST_NORTHWEST"];
        }else if(val >= 303.76 && val < 326.26){
            return LANG["I18N_COMMON_NORTHWEST"];
        }else if(val >= 326.26 && val < 348.76){
            return LANG["I18N_COMMON_NORTH_NORTHWEST"];
        }
    }
    return "";
}

function windLevelTrans(val){
    if($.isNumeric(val)){
        if(val < 0.3){
            return LANG["I18N_COMMON_CALM"];
        }else if(val >= 0.3 && val < 1.6){
            return LANG["I18N_COMMON_LIGHT_AIR"];
        }else if(val >= 1.6 && val < 3.4){
            return LANG["I18N_COMMON_BREEZE"];
        }else if(val >= 3.4 && val < 5.5){
            return LANG["I18N_COMMON_GENTLE_BREEZE"];
        }else if(val >= 5.5 && val < 8.0){
            return LANG["I18N_COMMON_SOFT_BREEZE"];
        }else if(val >= 8.0 && val < 10.8){
            return LANG["I18N_COMMON_COOL_BREEZE"];
        }else if(val >= 10.8 && val < 13.9){
            return LANG["I18N_COMMON_STRONG_BREEZE"];
        }else if(val >= 13.9 && val < 17.2){
            return LANG["I18N_COMMON_STRONG_WIND"];
        }else if(val >= 17.2 && val < 20.8){
            return LANG["I18N_COMMON_COMMON_GALE"];
        }else if(val >= 20.8 && val < 24.5){
            return LANG["I18N_COMMON_STRONG_GALE"];
        }else if(val >= 24.5 && val < 28.5){
            return LANG["I18N_COMMON_WHOLE_GALE"];
        }else if(val >= 28.5 && val <= 32.6){
            return LANG["I18N_COMMON_STORM"];
        }else if(val > 32.6){
            return LANG["I18N_COMMON_TYPHOON"];
        }
    }
    return "";
}

//根据当前时间修改 地球光照
function updateEarthTime(earth){
    var d1 = (new Date()).Format("yyyy-MM-dd hh:mm");
    if(earth){
        earth.setOption(
            {
                series:[{
                    light: {
                        time: d1,
                    }
                }]
            }
        );
    }
}

//个位数前拼接0
function dealTimeNum(val){
    var rest = "--";
    if($.isNumeric(val)){
        rest = val > 9? val:("0"+val);
    }
    return rest;
}

//数字转换为度数：101.2 -> 101°12′
function dealLongLat(val){
    var resStr = "--";
    if($.isNumeric(val)){
        resStr =  parseInt(val) +'°' + ((parseFloat(val) - parseInt(val)) * 60).toFixed(0) + "′";
    }
    return resStr;
}

//数字转换为 资源类型
function trans2localType(val){
    var arr = [LANG["I18N_LOCALTYPE1"], LANG["I18N_LOCALTYPE2"], LANG["I18N_LOCALTYPE3"]];
    if($.isNumeric(val)){
        return arr[parseInt(val) - 1];
    }
    return "--";
}

function getCurrentMonthDate(){
    var now = new Date();
    var m = now.getMonth() + 1;
    var y = now.getFullYear();
    return y + "" + dealTimeNum(m);
}

function isUndefinedOrNull(val) {
    if (typeof val == 'undefined' || null == val  || 'null' ==  val  || 'NaN' ==  val || val == "--" || val == "-" || val === "") {
        return true;
    }
    return false;
}

/**
 * 是否为空字符
 * @param str
 */
function isEmptyStr(str) {
    if (typeof str == 'undefined' || str == null || str == "null" || str == "NaN" || str === "" || str == "--" || str == "-") {
        return true;
    }
    return false;
}

/**
 * 工具对象
 */
var commonTools = {
    invalidValueReplacement: '--',

    /**
     * 处理数字数据精度，默认精度2
     */
    parsePrecisionVal: function (val, fixed, noFillZero) {
        if ($.isNumeric(val)) {
            if (noFillZero) {//小数部分不补0
                return parseFloat(parseFloat(val).toFixed(($.isNumeric(fixed) ? fixed : 2)));
            }
            return parseFloat(val).toFixed(($.isNumeric(fixed) ? fixed : 2));
        } else {
            return '--'
        }
    },

    /**
     * 接口封装数据 obj{value: x; unit: y}
     * 获取obj.value, obj.unit
     * */
    getMapValue: function (map) {
        if (typeof map != 'undefined' && map != null && typeof map.value != 'undefined' && map.value != null) {
            return map.value;
        }
        return "--";
    },
    getMapUnit: function (map) {
        if (typeof map != 'undefined' && map != null && typeof map.unit != 'undefined' && map.unit != null) {
            return map.unit;
        }
        return "";
    },

    zeroFill: function (value) {
        return value < 10 ? '0' + value : value;
    },


    /**
     * 处理空单位
     */
    dealEmptyUnitTool: function (val) {
        if (isEmptyStr(val)) {
            return "";
        }
        return val;
    },

    /**
     * 处理空值
     */
    dealEmptyValueTool: function (val) {
        if (isEmptyStr(val)) {
            return "--";
        }
        return val;
    },

    /**
     * 将脏数字数据转换成0
     * @param value
     * @returns {*}
     */
    transEmptyNumValueToZero: function (value) {
        if ($.isNumeric(value)) {
            return value;
        }
        return 0;
    },


    /**
     * 设置元素title 属性
     * 当txt 长度大于 len, 返回 title
     */
    addTitleOrEmpty: function (txt, len) {
        var title = '';
        if (!isUndefinedOrNull(txt) && $.isNumeric(len) && (txt + '').length > len) {
            title = ' title=\"' + txt + '\"';
        }
        return title;
    },

    /**
     * 单位进位倍数
     * 英文1000，中文10000
     */
    getMultipleByLanguage: function (lang) {
        var multiple = 10000;
        if (lang == 'en_US') {//英文下单位转换倍数是1000
            multiple = 1000;
        }
        return multiple;
    },

    /**
     * 处理功率数据；val（功率原始值单位瓦），multiple（单位进位倍数，英文1000，中文10000）
     * 返回数据和单位
     */
    dealWattData: function (val, multiple) {
        var obj = {value: '--', unit: ''};
        if ($.isNumeric(val)) {
            if (val < 1000) {
                obj.value = val;
                obj.unit = LANG.I18N_COMMON_ENERGY_UNIT_W;
            } else if (val > multiple * multiple * 1000) {//GW / 亿千瓦
                obj.value = val / (multiple * multiple * 1000);
                obj.unit = LANG.I18N_COMMON_BILLION_KILOWATTS;
            } else if (val > multiple * 1000) {//MW / 万千瓦
                obj.value = val / (multiple * 1000);
                obj.unit = LANG.I18N_COMMON_TEN_MW;
            } else if (val >= 1000) {//kW / 千瓦
                obj.value = val / 1000;
                obj.unit = LANG.I18N_COMMON_KW_UNIT;
            }
            obj.value = commonTools.parsePrecisionVal(obj.value);
        }
        return obj;
    },

    /**
     * 得到当前时间对应的的date_id, 日：yyyyMMdd, 月：yyyyMM, 年：yyyy
     * type: 1(日), 2(月)， 3（年）
     */
    currentDateId: function (type) {
        var now = new Date();
        var y = now.getFullYear();
        var m = now.getMonth() + 1;
        var d = now.getDate();
        var dateId = null;
        if (type === 1) {
            dateId = y + "" + commonTools.zeroFill(m) + "" + commonTools.zeroFill(d);
        } else if (type === 2) {
            dateId = y + "" + commonTools.zeroFill(m);
        } else if (type === 3) {
            dateId = y + "";
        }
        return dateId;
    },

    /**
     * 空数组判断
     */
    isEmptyArr: function (arr) {
        var flag = true;
        if (typeof arr === 'undefined' || arr == null || typeof arr.length === 'undefined' || arr.length == null || arr.length === 0) {
            return flag;
        }
        for (var i = 0, len = arr.length; i < len; i++) {
            if (!isUndefinedOrNull(arr[i])) {
                flag = false;
                break;
            }
        }
        return flag;
    },

    /**
     * 浏览器控制台打log
     */
    consoleError: function (msg) {
        try {
            if (typeof(console) != "undefined") {
                console.error(msg)
            }
        } catch (e) {
        }
    },

    /**
     * 浏览器控制台打log
     */
    consoleLog: function (msg) {
        try {
            if (typeof(console) != "undefined") {
                console.log(msg)
            }
        } catch (e) {
        }
    },

    /**
     * 获取字符串长度
     * @param str
     * @returns {*}
     */
    getLengthOfStr: function (str) {
        if (typeof str == 'undefined' || str == null) {
            return 0;
        }
        return (str + "").length;
    },

    /**
     * 判断当前时间是整五分钟
     */
    currentMinTimeIsMultiplesOf5: function () {
        var now = new Date();
        var min = now.getMinutes();
        if (min % 5 === 0) {
            return true;
        }
        return false;
    },

    /**
     * 仅判断是否为空或未定义
     */
    isStrictUndefinedOrNull: function (object) {
        if (typeof object == 'undefined' || object == null) {
            return true;
        }
        return false;
    },

    /**
     * 函数名：计算字符串长度
     * 函数说明：计算字符串长度，半角长度为1，全角长度为2
     * @param str 字符串
     * @return 字符串长度
     */
    getStrLength: function (str) {
        if (commonTools.isStrictUndefinedOrNull(str)) {
            return 0;
        }
        var len = 0, c;
        //str 是数字需转换成字符串
        str = str + '';
        for (var i = 0; i < str.length; i++) {
            c = str.charCodeAt(i);
            if (this.isDBCCase(c)) { //半角
                len = len + 1;
            } else { //全角
                len = len + 2;
            }
        }
        return len;
    },

    /**
     * 判断半角字符
     * @param c 字符
     * @return true：半角; false：全角
     */
    isDBCCase: function (c) {
        // 基本拉丁字母（即键盘上可见的，空格、数字、字母、符号）
        if (c >= 32 && c <= 127) {
            return true;
        }
        // 日文半角片假名和符号
        else if (c >= 65377 && c <= 65439) {
            return true;
        }
        return false;
    },

    /**
     * 获取设备状态：0离线, 1故障, 2告警, 3正常
     * 根据 dev_status 设备状态（1：在线，0：离线）  ，dev_fault_status 设备故障状态（1：故障，2：告警 3：其他, 4:正常）
     * dev_fault_status == 3 也算正常,离线那边定义了这个来表示：提示和建议
     * 与接口逻辑一致：离线的设备不进行故障告警状态的判断，dev_fault_status 为空设备正常
     */
    getDeviceStatus: function (devStatus, devFaultStatus) {
        var deviceStatus = 0;
        devStatus = commonTools.isStrictUndefinedOrNull(devStatus) ? 0 : devStatus;
        if (1 == devStatus) {//在线设备才会有故障状态
            if (1 == devFaultStatus || 2 == devFaultStatus) {
                deviceStatus = devFaultStatus;
            } else {//没有设备故障状态，按正常处理
                deviceStatus = 3;
            }
        }
        return deviceStatus;
    },

    /**
     * 值为undefined或者空 则返回0
     * @param value
     * @returns {*}
     */
    isUndefinedOrNullReturnZero: function (value) {
        if (isUndefinedOrNull(value)) {
            value = "0";
        }
        return value;
    },

    /**
     * get ps detail info
     * @param psId
     * @param successFn
     */
    getPsDetailInfo1: function (psId, successFn) {
        var param = {};
        param["service"] = "getPsDetail";
        param["ps_id"] = psId;
        param["req"] = "app";

        var ajaxObj = {};
        ajaxObj.data = param;
        ajaxObj.url = "powerAction_loaddata.action";
        ajaxObj.dataType = "json";
        ajaxObj.async = false;
        ajaxObj.success = successFn;
        Screen.ajax(ajaxObj);
    },

    /**
     * 加载电站天气
     */
    loadPsWeather: function (psId, successFn){
        var param = {};
        param["service"] = "getWeatherInfo";
        param["ps_id"] = psId;
        param["req"] = "app";

        var ajaxObj = {};
        ajaxObj.data = param;
        ajaxObj.url = "powerAction_loaddata.action";
        ajaxObj.dataType = "json";
        ajaxObj.async = false;
        ajaxObj.success = successFn;
        Screen.ajax(ajaxObj);
    },

    /**
     * get weather info by date
     */
    getWeatherObjByDate: function (weatherList, date) {
        var weatherObj = {};
        for (var i = 0, tmpObj, lens = weatherList.length; i < lens; i++) {
            tmpObj = weatherList[i];
            if (tmpObj.date_time === date.getFullYear() + '-' + commonTools.zeroFill(date.getMonth() + 1) + '-' + commonTools.zeroFill(date.getDate())) {
                weatherObj = tmpObj;
                break;
            }
        }
        return weatherObj;
    },

    /**
     * 功率单位转换 为英文单位
     * @param obj
     */
    transPowerUnit: function (val, unit) {
        var resultObj = {
            unit: "",
            value: "--"
        };
        if (language != "zh_CN") {
            resultObj.value = val;
            resultObj.unit = unit;
        } else {
            if (unit == "万千瓦" || unit == "万KW" || unit == "WKW") {
                if (val >= 100) {
                    resultObj.value = val / 100;
                    resultObj.unit = 'GW';
                } else {
                    resultObj.value = val * 10;
                    resultObj.unit = 'MW';
                }
            } else if (unit == "千瓦" || unit == "千W") {
                resultObj.value = val;
                resultObj.unit = 'kW';
            } else if (unit == "瓦") {
                resultObj.value = val;
                resultObj.unit = 'W';
            }else {
                resultObj.value = val;
                resultObj.unit = unit;
            }
        }
        if ($.isNumeric(resultObj.value)) {
            resultObj.value = parseFloat(parseFloat(resultObj.value).toFixed(2));
        }
        return resultObj;
    },

    /**
     * poverty relief info
     */
    loadPovertyReliefInfo: function (orgId, successFn, beforeFn){
        if (typeof beforeFn == 'function') {
            beforeFn();
        }
        var param = {};
        param["service"] = "energyPovertyAlleviation";
        param["org_id"] = orgId;

        var ajaxObj = {};
        ajaxObj.data = param;
        ajaxObj.url = "powerAction_loaddata.action";
        ajaxObj.dataType = "json";
        ajaxObj.async = false;
        ajaxObj.success = successFn;
        Screen.ajax(ajaxObj);
    },

    /**
     * get local time
     */
    getLocalTime: function (offset) {
        var localDate = new Date();
        if (isEmptyStr(offset)) {
            return localDate;
        }
        var localTime = localDate.getTime();
        var localOffset = localDate.getTimezoneOffset() * 60000; //获得当地时间偏移的毫秒数
        var utc = localTime + localOffset; //utc即GMT时间
        var localOffsetDate = utc + (3600 * 1000 * offset);
        return new Date(localOffsetDate);
    },

    /**
     * get substring width ...
     * length 是半角长度
     */
    getSubstringByHalfAngleLen: function (str, length) {
        if (commonTools.getStrLength(str) > length) {
            // 实际需要裁剪的长度
            var realLength = (str + '').length;
            for(var i = 1; i < realLength; i ++) {
                if (commonTools.getStrLength(str.substring(0, i)) >= length) {
                    realLength = i;
                    break;
                }
            }
            return (str + '').substring(0, realLength) + '...';
        }
        return str;
    },

    /**
     * get marker label x offset by string length
     */
    getMarkerLabelXOffset: function (str) {
        return 8 - 3 * (commonTools.getStrLength(str) - 2);
    },

    /**
     * 获取markers 中点
     * return lngLat = []
     */
    getMarkersCenter: function (markers) {
        if (commonTools.isEmptyArr(markers)) {
            return null;
        }
        var latitude = 0, longitude = 0, validCount = 0;
        for (var i = 0, tmpObj, lens = markers.length; i < lens; i++) {
            tmpObj = markers[i].getExtData();
            if (!$.isNumeric(tmpObj.longitude) || !$.isNumeric(tmpObj.latitude)) {
                continue;
            }
            validCount++;
            latitude += parseFloat(tmpObj.latitude);
            longitude += parseFloat(tmpObj.longitude);
        }
        if (validCount == 0) {
            return null;
        }
        return [toFix(longitude / validCount, 6), toFix(latitude / validCount, 6)];
    },

    /**
     * 根据语言 language 给数字加千分分隔符
     * 小数点.前每3位逗号分割，
     * @param str
     * @param language
     * @param precision 保留小数的位数，可不传，
     * @param illegalNumReplace 无效数字替换，默认'--'，可不传
     * @param noFillZero: 小数末尾补零标记(true 表示结尾不补零)
     * eg. commonTools.strCommaSplit('abc', 'en', null, 0) return 0
     */
    strCommaSplit: function (str, language, precision, illegalNumReplace, noFillZero) {
        if (commonTools.isStrictUndefinedOrNull(language)) {
            language = sysLangNumSplit;
        }
        //暂时支持中文和英文，日文待续
        if ($.isNumeric(str)) {
            if (!commonTools.isStrictUndefinedOrNull(precision) && /^[0-9]+$/.test(precision)) {
                if (noFillZero) {
                    str = parseFloat(parseFloat(str).toFixed(precision));
                } else {// 在有精度(precision)要求的情况下默认末尾补零
                    str = parseFloat(str).toFixed(precision);
                }
            }
            if (commonTools.isDEDEEnv(language)) { // 德文
                return commonTools.employThousandSplitSymbolDEDE(str)
            } else {
                return commonTools.employThousandSplitSymbol(str)
            }
        } else {
            if (commonTools.isStrictUndefinedOrNull(illegalNumReplace)) {
                illegalNumReplace = commonTools.invalidValueReplacement;
            }
            return illegalNumReplace;
        }
    },

    /**
     * 德文环境
     */
    isDEDEEnv: function() {
        // if (true) { // todo
        if (sysLangNumSplit == 'de_de' || sysLangNumSplit == '_de_de') {
            return true;
        }
        return false;
    },

    /**
     * 给数字num加千位分隔符
     * 返回的是德文分隔符规则的数字 eg.123.456,798
     * @param num 输入的是英文分隔符规则的数字 eg.12345.678
     * @param illegalNumReplace 非数字替换字符串，可不传入，默认 --
     * @returns {*}
     */
    employThousandSplitSymbolDEDE: function (num, illegalNumReplace) {
        return commonTools.employThousandSplitSymbol(num, illegalNumReplace, ',', '.');
    },

    /**
     * 给数字num加千位分隔符
     * 默认返回的是文千位分隔符 eg. commonTools.employThousandSplitSymbol(1234.56) -> 1,234.56
     * @param num 输入的是英文分隔符规则的数字 eg.12345.678
     * @param illegalNumReplace 非数字替换字符串，可不传入，默认 --
     * @returns {*}
     */
    employThousandSplitSymbol: function (num, illegalNumReplace, decimalSeparator, thousandSplitSymbol) {
        // 小数点分隔符，不传默认'.'
        var decimalSeparator = decimalSeparator || ".";
        // 千位分隔符，不传默认','
        var thousandSplitSymbol = thousandSplitSymbol || ",";
        if (!$.isNumeric(num)) {
            return illegalNumReplace || commonTools.invalidValueReplacement;
        }
        if (typeof num == "number") {
            num += '';
        }
        var source = num.split(".");
        source[0] = source[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), ("$1" + thousandSplitSymbol));
        return source.join(decimalSeparator);
    },

    /**
     * common easy echarts tooltip formatter function
     * @param data
     * @returns {string}
     */
    commonTooltipFormatter: function (data) {
        data = data || [];
        var str = '';
        for(var i = 0, tmpObj, lens = data.length; i < lens; i ++) {
            tmpObj = data[i];
            str += tmpObj.seriesName + ": " + toFix(tmpObj.value, sysLangNumSplit) + "<br>";
        }
        return str
    },

    /**
     * 饼状图通用tooltip formatter 方法
     * @param data
     * @returns {string}
     */
    commonPieTooltipFormatter: function (data) {
        var html = data.name + ": " + toFix(data.value) + " (" + toFix(data.percent) + "%)";
        if (!isEmptyStr(data.seriesName)) {
            html = data.seriesName + '<br/>' + html;
        }
        return html;
    },

    /**
     * 替换小数点，德文时将小数点替换成‘,’
     * 与 transDeDENum2Normal 作用相反
     * @param value 是一个小数点为‘.’的数字
     */
    replaceDecimalPoint: function(numStr) {
        if (commonTools.isDEDEEnv()) {
            if (typeof numStr !== "string") {
                numStr = numStr + '';
            }
            return numStr.replace(/\./g, ',');
        }
        return numStr;
    }

};