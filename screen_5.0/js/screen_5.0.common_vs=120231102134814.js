var S5 = {
    modArr: [], //模块索引(模块名)数组
    modTitles: [], //模块标题数组
    refreshInterval: null,//定时器
    todayEnergySpeedUp: 0, //今日发电量递增
    todayEnergyIntervalTime: 3 * 1000,//今日发电量跳变时间
    todyaEnergyCoefficientUp: (3 * 1000) / (15 * 60 * 1000),//今日发电量递增系数

    /*轮播风光储电站类型*/
    energyTab: [LANG["I18N_PV"], LANG["I18N_COMMON_WIND"], LANG["I18N_STORE"]], //光风储切换顺序
    energyTabIndex: 0, //光风储切换 当前下标
    energyTabIntervalTime: 35 * 1000, // 风光储tab切换时间间隔

    windPsTodayGen: 0, //风能电站今日发电量(度)
    windPsTotalGen: 0, //风能电站累计发电量(度)
    cur_wind_power: 21.11, //风能当前功率（MW）
    equal_hour_gen_rate: 3.5, //风能等效小时 发电量 系数
    energyTabLoading: false, // 风光储是否刚切换

    //地图轮询
    //energyMapIndex:0 ,// 电站轮询展示下标
    energyMapIndex: [0, 0, 0],//光风储电站各自下标 顺序不可调
    psToPsIntervalTime: 13 * 1000,//电站轮询间隔
    psToPsAnimation: 200, // 电站自动轮播切换动画缩放时的时间间隔 毫秒
    chinaToPsIntervalTime: 10 * 1000,//中国地图跳转到具体电站轮询延迟
    energyMapArr: [[], [], []],//光风储电站分组 顺序不可调
    energyMapInterval: null, //
    lastSelectedPsMarker: null,//上一个被选中的marker
    curSelectedPsMarker: null,//当前被选中的marker

    playFlag: false, //轮播标识
    selectedPsFlag: false,//是否有选中的电站 标识，用于右键消除选中电站，提升效率
    axisColor: "#00F3F7",//坐标轴颜色
    barColor: "#3EB5FF",//坐标轴颜色

    psScollIntervalTime: 60 * 1000, //底部风机发电动态取值
    refreshModulesInterval: null,
    refreshModulesIntervalTime: 10 * 60 * 1000, //刷新6个模块
    isShowMapUtils: true, //是否显示地图上的工具条【电站查询、缩放比例等】
    store_charge_dis_rate: 0.96,//储能电站充放电系数: 储能充电 * rate = 储能放点

    mapInfoWindow: null, //高德地图信息框
    preMapZoom: 4, //记录高德地图zoom
    mapMaxZoom: 14, //记录高德地图zoom

    mod1: {},
    mod2: {},
    mod3: {},
    mod4: {},
    mod5: {},
    mod6: {}
};
S5.echarts = {}; //echarts图例
var tempInterval = null;
var tempStart = 12;//上一个点的级别
var tempMiddle = 4; //国家级别

//电站数据存储
S5.kpi = { //来自接口 getKpiByUserIdAndAreaCode 电站统计需要补充的直接加
    interval_time: 1000 * 60 * 5, //接口请求间隔
    load_flag: false, // 是否已经加载了 取到值则为true
    power_list: [],
    power_scoll_list: [],
    total_energy: 0,   //总发电
    total_energy_view: 0, // 总发电的跳变值 为本页计算值
    total_energy_unit: 0, // 总发电单位
    today_energy_15min: 0,
    today_energy: 0,  //今日发电
    today_energy_view: 0, //今日发电跳变值
    today_energy_virgin: 0, //今日发电原数据
    today_energy_unit: "", //今日发电单位
    curr_power: "",  // 当前功率
    curr_power_virgin: "", //当前功率原数据
    curr_power_unit: "", //当前功率单位
    power_build_data: {}, // 电站建设数据
    es_ps_total_energy: {//光伏累计发电
        value: "--",
        unit: ""
    },
    pv_ps_today_energy_virgin: 0 //光伏今日发电原始值
};
S5.map_id;
S5.infoTime = null;

/**
 * echart 清缓存
 */
S5.clearEcharts = function (num) {
    if (num == null) {
        S5.echarts = {};
    } else if (isNaN(num) && num.length > 0) {
        for (var i = 0; i < num.length; i++) {
            if (S5.echarts['eChart' + num[i]] != undefined && S5.echarts['eChart' + num[i]] != null && typeof S5.echarts['eChart' + num[i]].dispose == 'function') {
                S5.echarts['eChart' + num[i]].dispose();
            }
            delete S5.echarts['eChart' + num[i]];
        }
    } else {
        delete S5.echarts['eChart' + num];
    }
};

/**
 * 修改语言
 */
function changeLanguage(lang) {
    var url = bathPath + "/index_x.xhtml?lang=" + lang;
    window.location.href = url;
}



/**
 * 是否开启详情展示
 * @type {boolean}
 */
var detailFlag = false;
//点击模块展示详细信息
S5.showDetialInfo = function (modName) {
    if (detailFlag) {
        require.config({
            baseUrl: bathPath + '/screen_5.0/modules/detail_js'
        });

        require([modName + '_detail'], function (detailMd) {
            detailMd.showModDetail();
        });
    }
};

//设置单个模块
S5.setOneModule = function (num, modTitle, modName, invelTime) {
    var curNum = num * 1;
    require.config({
        baseUrl: bathPath + '/screen_5.0/modules/js',
        //版本号
        urlArgs: 'v='+vs,
    });

    require([modName], function (targetMd) {
        S5['mod' + curNum] = targetMd;
        $("#skin_body_module_" + curNum).load(bathPath + "/screen_5.0/modules/" + modName + ".html", function (responseText, textStatus) {
            targetMd.loadModule(curNum, modTitle, modName);
            targetMd.loadModuleData(curNum, invelTime);
        });
    });
};

//关闭二级弹窗
function closeDetailFm() {
    $(".shadow_div").slideToggle();
    $("#detailFrame").slideToggle();
    $("#detailFrame").attr("src", "");
}

//设置显示模块 及 模块顺序
S5.setUserModules = function () {
    return;
    /*$(".shadow_div").show();
    $(".screen_module_content").show();

    $("#sortable").sortable({
        connectWith: "#sortable1",
        containment: ".screen_module_content"
    });
    $("#sortable").disableSelection();
    $("#sortable1").sortable({
        connectWith: "#sortable",
        containment: ".screen_module_content",
        stop: function (event, ui) {
            if ($("#sortable .screen_module .mod_id").length >= 7) {
                moveLastOneMd();
            }
        }
    });
    $("#sortable1").disableSelection();

    var param = {};
    param["service"] = "queryScreenUserMdIfo";
    $.ajax({
        type: "post",
        data: param,
        url: bathPath + '/powerAction_loaddata.action',
        dataType: "json",
        beforeSend: function () {

        },
        success: function (data, s) {
            var htmlStr = "";
            var object = JSON.parse(data);
            var result_data = object.result_data;
            if (result_data.mod_list != undefined && result_data.mod_list != null) {
                var mod_list = result_data.mod_list;
                for (var i = 0; i < mod_list.length; i++) {
                    var modObj = mod_list[i];
                    htmlStr += '<li class="screen_module"><input type="hidden" value="' + modObj.module_name + '"><input type="hidden" class="mod_id" value="' + modObj.module_id + '">' + modObj.mod_title + '</li>';
                }
                $("#sortable").html(htmlStr);
            } else {
                alert(LANG["I18N_MODEL_LOAD_FAIL"]);
            }
        },
        error: function () {
            alert(LANG["I18N_MODEL_LOAD_FAIL"]);
        }
    });

    var param0 = {};
    param0["service"] = "queryScreenUserSelectableMdIfo";
    $.ajax({
        type: "post",
        data: param0,
        url: bathPath + '/powerAction_loaddata.action',
        dataType: "json",
        beforeSend: function () {

        },
        success: function (data, s) {
            var htmlStr = "";
            var object = JSON.parse(data);
            var result_data = object.result_data;
            if (result_data.mds_list != undefined && result_data.mds_list != null) {
                var mds_list = result_data.mds_list;
                for (var i = 0; i < mds_list.length; i++) {
                    var modObj = mds_list[i];
                    htmlStr += '<li class="screen_module"><input type="hidden" value="' + modObj.module_name + '"><input type="hidden" class="mod_id" value="' + modObj.module_id + '">' + modObj.mod_title + '</li>';
                }
                $("#sortable1").html(htmlStr);
            } else {
                alert(LANG["I18N_MODEL_LOAD_FAIL"]);
            }
        },
        error: function () {
            alert(LANG["I18N_MODEL_LOAD_FAIL"]);
        }
    })*/
};

//保存
S5.save_user_mods = function () {
    var ids = "";
    var modArr = $("#sortable .screen_module .mod_id");
    for (var i = 0; i < modArr.length; i++) {
        ids += $(modArr[i]).val() + ",";
    }
    if (modArr.length != 6) {
        alert(LANG["I18N_MODEL_LOAD_WARNING"]);
        return;
    }
    ids = ids.substr(0, ids.length - 1);
    var param1 = {};
    param1["service"] = "saveScreenUserMdInfo";
    param1["mod_ids"] = ids;
    $.ajax({
        type: "post",
        data: param1,
        url: bathPath + '/powerAction_loaddata.action',
        dataType: "json",
        beforeSend: function () {
        },
        success: function (data, s) {
            var object = JSON.parse(data);
            var result_data = object.result_data;
            if (result_data.update_flag != undefined && result_data.update_flag != null && result_data.update_flag == 1) {
                alert(LANG["I18N_MODEL_UPDATE_SUCCESS"]);
                location.reload(true);
            } else {
                alert(LANG["I18N_MODEL_UPDATE_FAIL"]);
            }
        },
        error: function () {
            alert(LANG["I18N_COMMON_REQUEST_TIMEOUT"]);
        }
    });
};

//最后一个模块移动到可选模块中
S5.moveLastOneMd = function () {
    var lastOne = $("#sortable li:last").detach();
    $("#sortable1").prepend(lastOne);
};

S5.close_user_mods = function () {
    $(".shadow_div").hide();
    $(".screen_module_content").hide();
    $("#sortable").empty();
    $("#sortable1").empty();
};

//将非数字数据转为0
S5.tansEmptyNumData = function (val) {
    if ($.isNumeric(val)) {
        return val;
    }
    return 0;
};

/**
 * 获取风能今日发电(度)，虚拟取值
 */
S5.getWindTodayGen = function () {
    var now = new Date();
    var hour = now.getHours();
    var mint = now.getMinutes();
    var curMin = hour * 60 + mint;
    return (S5.windPsTodayGen * curMin) / (24 * 60);
};

/**
 * 获取风能前15分钟今日发电(度)，虚拟取值
 */
S5.getWindTodayGen_15minAgo = function () {
    var now = new Date();
    now.setTime(now.getTime() - (15 * 60 * 1000));
    var hour = now.getHours();
    var mint = now.getMinutes();
    var curMin = hour * 60 + mint;
    return (S5.windPsTodayGen * curMin) / (24 * 60);
};

/**
 * 功率单位转换 为英文单位
 * @param obj
 */
S5.trandPowerUnit = function (val, unit) {
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
        //resultObj.value = parseFloat(parseFloat(resultObj.value).toFixed(2));
        resultObj.value = parseFloat(parseFloat(resultObj.value).toFixed(2));
    }
    return resultObj;
};


S5.getDaysOfMonth = function (year, month) {
    var new_year = year;    //取当前地年份
    var new_month = month++;//取下一个月地第一天，方便计算（最后一天不固定）
    if (month > 12) //如果当前大于12月，则年份转到下一年
    {
        new_month -= 12;        //月份减
        new_year++;            //年份增
    }
    var new_date = new Date(new_year, new_month, 1); //取当年当月中地第一天
    var s = (new Date(new_date.getTime() - 1000 * 60 * 60 * 24)).getDate();
    //s = eval(s+1);
    return s;//获取当月最后一天日期
};

/**
 * 根据风速求功率
 */
S5.getWindPowerBySpeed = function (wind_speed) {
    var cur_wind_power = "--";
    if ($.isNumeric(wind_speed)) {
        var f = parseFloat(wind_speed);
        if (f >= 13) {
            cur_wind_power = 51.5;
        } else if (f >= 4) {
            cur_wind_power = parseFloat(parseFloat(52 * f / 13 - 4).toFixed(2));
        } else {
            cur_wind_power = 0.5;
        }
    }
    return cur_wind_power;
};

//清理
function clearPlayInterval() {
    if (S5.scolInterval != null) {
        window.clearInterval(S5.scolInterval);
        S5.scolInterval = null;
    }
    if (S5.energyMapInterval != null) {
        clearInterval(S5.energyMapInterval);
        S5.energyMapInterval = null;
    }
}

//电站与电站之间的切换
S5.psToPsScollFn = function () {
    if (S5.playFlag) { //再次检测是否是播放状态
        //先执行一遍
        S5.psToPsScollFnMain();
        //防止异常导致的多定时器
        if (S5.energyMapInterval != null) {
            clearInterval(S5.energyMapInterval);
            S5.energyMapInterval = null;
        }
        S5.energyMapInterval = setInterval(function () {
            if (S5.playFlag) { //再次检测是否是播放状态
                S5.psToPsScollFnMain();
            } else {
                clearPlayInterval();
            }
        }, S5.psToPsIntervalTime);
    } else {
        clearPlayInterval();
    }
};

// 地图搜索框查询
function loadMapSearchEvent() {
    $("#stationSearchName").keyup(function () {
        var inputValue = $("#stationSearchName").val().trim();
        var showNum = 0;
        if (inputValue != "") {
            var lis = $("#map_searchListBox").children();
            for (var i = 0; i < lis.length; i++) {
                if ($(lis[i]).text().indexOf(inputValue) >= 0) {
                    $(lis[i]).show();
                    showNum += 1;
                } else {
                    $(lis[i]).hide();
                }
            }
        }
        if (showNum > 0) {
            $("#map_searchListBox").show();
        } else {
            $("#map_searchListBox").hide();
            $("#map_searchListBox").children().hide();
        }
    });
}





// 不知道什么用
S5.preSumilateLogin = function () {
    $(".alertInfo").slideDown();
    setTimeout(function () {
        $(".alertInfo").slideUp();
    }, 5 * 1000);
    setTimeout(function () {//请求失败，50秒后模拟登陆
    }, 50 * 1000);
};

/**
 * 加载ps展示,只显示电站名称和功率，速度快，不显示风电，储能 // 好像废弃了
 */
function loadPsScoll_power() {
    var data = S5.kpi.power_scoll_list || [];
    if (data.length > 30) {
        data = data.slice(0, 30);
    }
    var _html = '<marquee behavior="scroll" scrollamount="3" direction="left"  class="light" id="ps_scroll"><div class="iMarquee"><ul>';
    for (var i = 0; i < data.length; i++) {
        var power = data[i];
        var psType = Screen.stringutil.judgePowerType(power.ps_type);
        var powerObj = S5.trandPowerUnit(power.design_capacity, power.design_capacity_unit);
        var powerSpeed = Screen.stringutil.handleNullToDefault(Math.round(power.speed));
        var weatherImg = power.code == null ? "" : '<span class="name"><img  src= ' + bathPath + '/images/weather_white/' + power.code + '.png width="40" height="40"></span>';
        var weatherDesc = power.code == null ? "" : '<span><span class="name" style="margin-left: 0px;">' + Screen.stringutil.handleNullToDefault(power.code_name) + '</span>' +
        '<span><span class="name">' + LANG["I18N_COMMON_WIND_SPEED"] + '</span><label class="unit">' + commonTools.strCommaSplit(powerSpeed) + 'm/s</label></span>';
        if (power.design_capacity) {
            _html += '<li>';
            _html += '<div class="button">' + power.ps_name + '</div><span class="arrowB"></span>';
            _html += '<div class="dataCon">';
            var unit = "";
            if (typeof(power.design_capacity_unit) == 'undefined') {
                unit = "Wp";
                var design_capacity = power.design_capacity;
                if (design_capacity >= 1000 && design_capacity <= 1000000) {
                    design_capacity = toFix(design_capacity / 1000, 2);
                    unit = "kWp";
                } else if (design_capacity >= 1000000) {
                    design_capacity = toFix(design_capacity / 1000000, 2);
                    unit = "MWp";
                }
            } else {
                unit = power.design_capacity_unit;
            }
            _html += '<span><span class="name">' + LANG["I18N_COMMON_INSTALLED_CAPACITY"] + '</span><span class="num">' + commonTools.strCommaSplit(Screen.stringutil.handleNullToDefault(design_capacity)) + '</span><label class="unit">' + unit + '</label></span>';
            if (power.today_energy && power.today_energy.value) {
                _html += '<span><span class="name">' + LANG["I18N_COMMON_DAY_ENERGY"] + '</span><span class="num">' + commonTools.strCommaSplit(power.today_energy.value) + '</span><label class="unit">' + Screen.stringutil.handleNullToDefault(power.today_energy.unit) + '</label></span>';
            }
            //_html +=' <span><span class="name">'+power.weather_name+'</span><span class="num">23</span><label class="unit">C</label></span>';
            if (Screen.stringutil.handleNullToDefault(weatherDesc) != "--") {
                _html += weatherImg;
                _html += weatherDesc;
            }
            _html += '</div>';
            _html += '</li>';
        }
    }
    _html += "</ul></div></marquee>";
    $("#marquee_content_div").html(_html);
}





/*******************************方法整理后****************************************/

/**
 * tab切换 分别选择 光伏 储能 和 风能
 * @param dom
 */
S5.tab = function (dom) {
    //切换tab时候 回到中国，并开启中国跳转电站的定时器 以及电站跳电站的定时器
    S5.chinaToPsScollFn();
    S5.clearEcharts([2, 4, 6]);
    if (S5.energyTabIndex == 0) {
        var _html = '<span ><img style="width: 34px;" src="' + bathPath + '/screen_5.0/images/imgs/night.png"/></span><span id="tab_0" index="0">' + LANG["I18N_COMMON_SOLAR"] + '</span>';
        var _html_more = '<span id="tab_1" onclick="autoPlayFn(null,this)" index="1">' + LANG["I18N_COMMON_INTELLIGENT_POWER_TYPE8"] + '</span>' +
            '<span id="tab_2" onclick="autoPlayFn(null,this)" index="2">' + LANG["I18N_COMMON_STORE"] + '</span>';
    } else if (S5.energyTabIndex == 1) {
        var _html = '<span ><img style="height: 34px;"  src="' + bathPath + '/screen_5.0/images/iconGf.png"/></span><span id="tab_0" index="1">' + LANG["I18N_COMMON_INTELLIGENT_POWER_TYPE8"] + '</span>';
        var _html_more = '<span id="tab_1" onclick="autoPlayFn(null,this)" index="2">' + LANG["I18N_COMMON_STORE"] + '</span>' +
            '<span id="tab_2" onclick="autoPlayFn(null,this)" index="0">' + LANG["I18N_COMMON_SOLAR"] + '</span>';
    } else if (S5.energyTabIndex == 2) {
        var _html = '<span ><img style="width:34px;" src="' + bathPath + '/screen_5.0/images/imgs/store.png"/></span><span id="tab_0" index="2">' + LANG["I18N_COMMON_STORE"] + '</span>';
        var _html_more = '<span id="tab_1" onclick="autoPlayFn(null,this)" index="0">' + LANG["I18N_COMMON_SOLAR"] + '</span>' +
            '<span id="tab_2" onclick="autoPlayFn(null,this)" index="1">' + LANG["I18N_COMMON_INTELLIGENT_POWER_TYPE8"] + '</span>';
    }

    $(".defautCate").html(_html);
    $(".moreCate").html(_html_more);

    // 光 风 储 对应的 2 4 6 位置的 展示的echars 主题是不一样的
    // 光  当月发电趋势 | 当月电站PR  | 当年发电计划
    // 风  风能概况    | 当月发电趋势 | 等效小时
    // 储  装机容量    | 健康度      | 上线率

    if (S5.energyTab[S5.energyTabIndex] == LANG["I18N_PV"]) {
        S5.setOneModule(2, LANG["I18N_COMMON_CHART_TITLE_MONTH"], "cur_mon_gen_trend", 2000);
        S5.setOneModule(4, LANG["I18N_POWERSTATION_PR_MONTH"], "cur_mon_pr");
        S5.setOneModule(6, LANG["I18N_COMMON_YEAR_POWER_PLAN"], "cur_year_plan");
    } else if (S5.energyTab[S5.energyTabIndex] == LANG["I18N_COMMON_WIND"]) {
        S5.setOneModule(2, LANG["I18N_WIND_PROFILE"], "wind_ps_msg");
        S5.setOneModule(4, LANG["I18N_COMMON_CHART_TITLE_MONTH"], "wind_cur_mon_gen_trend");
        S5.setOneModule(6, LANG["I18N_COMMON_EQUIVALENT_HOUR"], "wind_equivalent_hours");
    } else if (S5.energyTab[S5.energyTabIndex] == LANG["I18N_STORE"]) {
        S5.setOneModule(2, LANG["I18N_COMMON_INSTALLED_CAPACITY"], "store_ps_msg");
        S5.setOneModule(4, LANG["I18N_COMMON_HEALTH_DEGREE"], "store_soh");
        S5.setOneModule(6, LANG["I18N_COMMON_ON_LINE_RATE"], "store_online_rate");
    }
};

//根据数据库配置，显示安全运营天数
function showSafeRunDays() {
    $(".safe_days").show();
}

//调用接口获取底部滚动，全部获取
function showFooter() {
    var ajaxObj = {};
    ajaxObj.data = {};
    ajaxObj.url = "powerAction_loaddata.action";
    ajaxObj.dataType = "json";
    ajaxObj.data["service"] = "getPsList";
    ajaxObj.data["valid_flag"] = "1";
    ajaxObj.data["is_get_weather_info"] = "1";
    ajaxObj.data["curPage"] = "1";
    ajaxObj.data["size"] = "30";
    ajaxObj.data["sort_column"] = "p83022";
    ajaxObj.data["sort_type"] = "1";
    ajaxObj.data["ps_weather"] = "1";
    ajaxObj.data["req"] = "app";
    ajaxObj.success = function (data) {
        var object = Screen.stringutil.parseJson(data);
        if (data != null) {
            if ($(object).length > 0 && object.result_code == 1 && object.result_data != null) {
                S5.kpi.power_scoll_list = object.result_data.pageList;
                loadPsScoll();
            }
        } else {
            log(LANG["I18N_PS_LOAD_FAIL"]);
        }
    };
    Screen.ajax(ajaxObj);
}

/**
 * 加载ps展示
 */
function loadPsScoll() {
    var data = S5.kpi.power_scoll_list || [];
    if (data.length > 30) {
        data = data.slice(0, 30);
    }
    var _html = '<marquee behavior="scroll" scrollamount="3" direction="left"  class="light" id="ps_scroll"><div class="iMarquee"><ul>';
    for (var i = 0; i < data.length; i++) {
        var power = data[i];
        var psType = Screen.stringutil.judgePowerType(power.ps_type);
        var powerObj = S5.trandPowerUnit(power.design_capacity, power.design_capacity_unit);
        var powerSpeed = Screen.stringutil.handleNullToDefault(Math.round(power.speed));
        var weatherImg = power.code == null ? "" : '<span class="name"><img  src= ' + bathPath + '/images/weather_white/' + power.code + '.png width="40" height="40"></span>';
        var weatherDesc = power.code == null ? "" : '<span><span class="name" style="margin-left: 0px;">' + Screen.stringutil.handleNullToDefault(power.code_name) + '</span>' +
        '<span><span class="name">' + LANG["I18N_COMMON_WIND_SPEED"] + '</span><span class="num">' + commonTools.strCommaSplit(powerSpeed) + '</span><label class="unit">m/s</label></span>';
        //风
        if (psType == "1") {
            //根据风速计算功率
            // 为了演示效果 风速+1 ，风场风力要比天气预报大
            powerSpeed = powerSpeed + 1;
            S5.cur_wind_power = S5.getWindPowerBySpeed(powerSpeed);
            weatherDesc = power.code == null ? "" : '<span><span class="name" style="margin-left: 0px;">' + Screen.stringutil.handleNullToDefault(power.code_name) + '</span>' +
            '<span><span class="name">' + LANG["I18N_COMMON_WIND_SPEED"] + '</span><span class="num">'+commonTools.strCommaSplit((powerSpeed))+'</span><label class="unit">m/s</label></span>';
            _html += '<li>';
            _html += '<div class="button">' + power.ps_name + '</div><span class="arrowB"></span>';
            _html += '<div class="dataCon">';
            _html += '<span><span class="name">' + LANG["I18N_COMMON_INSTALLED_CAPACITY"] + '</span><span class="num">52</span><label class="unit">MW</label></span>';

            _html += '<span><span class="name">' + LANG["I18N_COMMON_DAY_ENERGY"] + '</span><span class="num" id="windPsTodayGen">' + commonTools.strCommaSplit((S5.getWindTodayGen() / 10000).toFixed(2)) +
                '</span><label class="unit">'+LANG["I18N_COMMON_TEN_THOUSAND_KWH"]+'</label></span>';
            if (Screen.stringutil.handleNullToDefault(weatherDesc) != "--") {
                _html += weatherImg;
                _html += weatherDesc;
            }
            _html += '</div>';
            _html += '</li>';
        } else if (psType == "2") {
            _html += '<li>';
            _html += '<div class="button">' + power.ps_name + '</div><span class="arrowB"></span>';
            _html += '<div class="dataCon">';
            _html += '<span><span class="name">' + LANG["I18N_COMMON_INSTALLED_CAPACITY"] + '</span><span class="num">' + commonTools.strCommaSplit(Screen.stringutil.handleNullToDefault(powerObj.value)) +
                '</span><label class="unit">' + Screen.stringutil.handleNullToDefault(powerObj.unit) + '</label></span>';
            //写死数据
            var pSize = 0;
            if (power.ps_name == "阳光微网电站") {
                pSize = 1.5;
            } else if (power.ps_name == "三沙微网电站") {
                pSize = 1.5;
            } else if (power.ps_name == "青海玉树微网电站") {
                pSize = 14.4;
            }
            _html += '<span><span class="name">' + LANG["I18N_COMMON_BATTERY_CAPACITY"] + '</span><span class="num">' + pSize + '</span><label class="unit">MWh</label></span>';
            if (power.today_energy && Screen.stringutil.handleNullToDefault(power.today_energy.value) != "--") {
                _html += '<span><span class="name">' + LANG["I18N_COMMON_DAY_ENERGY"] + '</span><span class="num">' + commonTools.strCommaSplit(power.today_energy.value) + '</span><label class="unit">' +
                    Screen.stringutil.handleNullToDefault(power.today_energy.unit) + '</label></span>';
            }
            if (power.es_energy && Screen.stringutil.handleNullToDefault(power.es_energy.value) != "--") {
                _html += '<span><span class="name">' + LANG["I18N_ES_ENERGY_DAY"] + '</span><span class="num">' + commonTools.strCommaSplit(Screen.stringutil.handleNullToDefault(power.es_energy.value)) +
                    '</span><label class="unit">' + Screen.stringutil.handleNullToDefault(power.es_energy.unit) + '</label></span>';
            }
            //临时：储能充电 * 0.96 = 储能放点
            if (power.es_energy && Screen.stringutil.handleNullToDefault(power.es_energy.value) != "--") {
                _html += '<span><span class="name">' + LANG["I18N_ES_DISENERGY_DAY"] + '</span><span class="num">' + commonTools.strCommaSplit(S5.getDischargeByCharge(power.es_energy.value)) +
                    '</span><label class="unit">' + Screen.stringutil.handleNullToDefault(power.es_energy.unit) + '</label></span>';
            }
            if (Screen.stringutil.handleNullToDefault(weatherDesc) != "--") {
                _html += weatherImg;
                _html += weatherDesc;
            }
            _html += '</div>';
            _html += '</li>';
        } else {
            if (power.design_capacity) {
                _html += '<li>';
                _html += '<div class="button">' + power.ps_name + '</div><span class="arrowB"></span>';
                _html += '<div class="dataCon">';
                var unit = "";
                var design_capacity = "";
                if (typeof(power.design_capacity_unit) == 'undefined') {
                    unit = "Wp";
                    design_capacity = power.design_capacity_virgin;
                    if (design_capacity >= 1000 && design_capacity <= 1000000) {
                        design_capacity = toFix(design_capacity / 1000, 2);
                        unit = "kWp";
                    } else if (design_capacity >= 1000000) {
                        design_capacity = toFix(design_capacity / 1000000, 2);
                        unit = "MWp";
                    }
                } else {
                    design_capacity = power.design_capacity;
                    unit = power.design_capacity_unit;
                }
                _html += '<span><span class="name">' + LANG["I18N_COMMON_INSTALLED_CAPACITY"] + '</span><span class="num">' + commonTools.strCommaSplit(Screen.stringutil.handleNullToDefault(design_capacity)) + '</span><label class="unit">' + unit + '</label></span>';
                if (power.today_energy && power.today_energy.value) {
                    _html += '<span><span class="name">' + LANG["I18N_COMMON_DAY_ENERGY"] + '</span><span class="num">' + commonTools.strCommaSplit(power.today_energy.value) + '</span><label class="unit">' + Screen.stringutil.handleNullToDefault(power.today_energy.unit) + '</label></span>';
                }
                if (Screen.stringutil.handleNullToDefault(weatherDesc) != "--") {
                    _html += weatherImg;
                    _html += weatherDesc;
                }
                _html += '</div>';
                _html += '</li>';
            }

        }
    }
    _html += "</ul></div></marquee>";
    $("#marquee_content_div").html(_html);
}

/**
 * 整体页面数据刷新加载
 */
function infoPowerstationDatas() {
    var ajaxObj = {};
    ajaxObj.data = {};
    ajaxObj.data.isfirstLoad = "1";
    ajaxObj.data.service = "getKpiByUserIdAndAreaCode";
    ajaxObj.url = "powerAction_loaddata.action?st=" + new Date().getTime();
    ajaxObj.dataType = "json";
    ajaxObj.async = false;
    ajaxObj.success = function (data) {
        var object = Screen.stringutil.parseJson(data);
        if (object != null) {
            if ($(object).length > 0 && object.result_code == 1) {
                var result = object.result_data;
                var total_energy = 0;
                if (!(isNotNull(result) && isNotNull(result.total_energy_unit))) {
                    return;
                }
                // 今日发电信息
                S5.kpi.today_energy_virgin = result.today_energy_virgin; //今日发电
                S5.kpi.curr_power = result.curr_power;
                S5.kpi.curr_power_unit = result.curr_power_unit;
                S5.kpi.curr_power_virgin = result.curr_power_virgin;
                S5.kpi.today_energy = isNaN(result.today_energy_virgin_wh) ? "--" : (parseFloat(result.today_energy_virgin_wh) / 1000);
                S5.kpi.today_energy_unit = LANG["I18N_COMMON_KW_H"];
                S5.kpi.today_energy_virgin = result.today_energy_virgin;
                S5.kpi.today_energy_15min = isNaN(result.today_energy_15min_virgin) ? "--" : (parseFloat(result.today_energy_15min_virgin) / 1000);
                S5.kpi.total_energy = isNaN(result.total_energy_virgin_wh) ? "--" : (parseFloat(result.total_energy_virgin_wh) / 1000);
                S5.kpi.total_energy_unit = LANG["I18N_COMMON_KW_H"];
                //光伏累计发电
                S5.kpi.es_ps_total_energy = result.pv_ps_total_energy;
                var tmp_pv_ps_today_energy_virgin = result.pv_ps_today_energy_virgin;
                if ($.isNumeric(tmp_pv_ps_today_energy_virgin)) {
                    tmp_pv_ps_today_energy_virgin = (parseFloat(tmp_pv_ps_today_energy_virgin) / 1000).toFixed(2);
                }
                S5.kpi.pv_ps_today_energy_virgin = Screen.stringutil.transEmptyNum(tmp_pv_ps_today_energy_virgin);

                //加上风力发电
                var wind_today_gen = S5.getWindTodayGen();
                var wind_today_gen_15_min = S5.getWindTodayGen_15minAgo();
                S5.kpi.today_energy = S5.kpi.today_energy + wind_today_gen;
                S5.kpi.total_energy = S5.kpi.total_energy + S5.windPsTotalGen;
                S5.kpi.today_energy_15min = S5.kpi.today_energy_15min + wind_today_gen_15_min;

                if (autoSlideEnergy) {
                    S5.kpi.today_energy_view = isNaN(S5.kpi.today_energy_15min) ? S5.kpi.today_energy : S5.kpi.today_energy_15min;
                } else {//非滚动刷新发电量 不取15分钟前的值
                    S5.kpi.today_energy_view = S5.kpi.today_energy;
                }
                S5.kpi.total_energy_view = S5.kpi.total_energy - (S5.kpi.today_energy - S5.kpi.today_energy_view);
                S5.kpi.total_energy_view = isNaN(S5.kpi.total_energy_view) ? "--" : S5.kpi.total_energy_view;
                S5.todayEnergySpeedUp = (S5.kpi.today_energy - S5.kpi.today_energy_view) * S5.todyaEnergyCoefficientUp;
                S5.todayEnergySpeedUp = isNaN(S5.todayEnergySpeedUp) ? 0 : S5.todayEnergySpeedUp;

                //  节能信息
                S5.kpi.gas_mitigation = (result.gas_mitigation == null ? 0 : result.gas_mitigation * 1);
                S5.kpi.save_coal = (result.save_coal == null ? 0 : result.save_coal * 1);
                S5.kpi.plant_tree = (result.plant_tree == null ? 0 : result.plant_tree * 1);
                S5.kpi.gas_mitigation_unit = (result.gas_mitigation_unit == null ? LANG["I18N_COMMON_TEN_THOUSAND_TON"] : result.gas_mitigation_unit);
                S5.kpi.save_coal_unit = (result.save_coal_unit == null ? LANG["I18N_COMMON_TEN_THOUSAND_TON"] : result.save_coal_unit);
                S5.kpi.plant_tree_unit = (result.plant_tree_unit == null ? LANG["I18N_COMMON_TEN_THOUSAND_TREES"] : result.plant_tree_unit);

                // 加载节能减排数据
                S5.mod3.loadModuleData(3);
                // 加载当月发电趋势，今日发电依赖kpi接口返回
                S5.mod2.loadModuleData(2);
                //电站建设
                getPowerBuildData(result);

                S5.kpi.load_flag = true; //放在最后
                $("#safe_run_days").html(result.safe_operation);
            }
        } else {
            commonTools.consoleError("获取累计发电数据失败");
        }

        //赋值今日发电和累计发电
        $("#kpiTotayEenergy").text(commonTools.replaceDecimalPoint(Screen.stringutil.dealEnergyData(S5.kpi.today_energy, null, language)));
        $("#kpiTodayEenergyUnit").text(Screen.stringutil.dealEnergyData(S5.kpi.today_energy, "unit", language));
        // 总发电可能会超过GWh，采用dealEnergyDataGMw方法
        $("#kpiTotalEenergy").text(commonTools.replaceDecimalPoint(Screen.stringutil.dealEnergyDataGMw(S5.kpi.total_energy, null, language)) + " " + Screen.stringutil.dealEnergyDataGMw(S5.kpi.total_energy, "unit", language));
    };
    ajaxObj.error = function () {
        //S5.preSumilateLogin();
    };
    Screen.ajax(ajaxObj);
}

/**
 * 获取光风储电站建设数据
 */
function getPowerBuildData(result) {
    var pows = {};
    pows.pv = {};
    pows.pv.num = 0;
    pows.pv.capacity = 0;
    pows.pv.capacity_virgin = 0;
    pows.pv.capacity_unit = 0;

    pows.wind = {};
    pows.wind.num = 0;
    pows.wind.capacity = 0;
    pows.wind.capacity_virgin = 0;
    pows.wind.capacity_unit = 0;

    pows.store = {};
    pows.store.num = 0;
    pows.store.capacity = 0;
    pows.store.capacity_virgin = 0;
    pows.store.capacity_unit = 0;

    //电站建设
    if (result.powerType != null && result.powerType.length > 0) {
        for (var j = 0; j < result.powerType.length; j++) {
            var powerT = result.powerType[j];
            if (powerT != null) {
                var resultType = Screen.stringutil.judgePowerType(powerT.pstype);
                if (resultType == 0) {
                    pows.pv.num += powerT.num * 1;
                    pows.pv.capacity += Screen.stringutil.handleCapacity(powerT.capacity.value, powerT.capacity.unit, LANG["I18N_COMMON_TEN_MW"]);
                    pows.pv.capacity_virgin += commonTools.isUndefinedOrNullReturnZero(powerT.capacity_virgin);
                    pows.pv.capacity_unit = LANG["I18N_COMMON_TEN_MW"];
                } else if (resultType == 1) {
                    pows.wind.num += powerT.num * 1;
                    pows.wind.capacity += Screen.stringutil.handleCapacity(powerT.capacity.value, powerT.capacity.unit, LANG["I18N_COMMON_TEN_MW"]);
                    pows.wind.capacity_virgin += commonTools.isUndefinedOrNullReturnZero(powerT.capacity.capacity_virgin);
                    pows.wind.capacity_unit = LANG["I18N_COMMON_TEN_MW"];
                } else if (resultType == 2) {
                    pows.store.num += powerT.num * 1;
                    pows.store.capacity += Screen.stringutil.handleCapacity(powerT.capacity.value, powerT.capacity.unit, LANG["I18N_COMMON_TEN_MW"]);
                    pows.store.capacity_virgin += commonTools.isUndefinedOrNullReturnZero(powerT.capacity.capacity_virgin);
                    pows.store.capacity_unit = LANG["I18N_COMMON_TEN_MW"];
                }
            }
        }
    }
    S5.kpi.power_build_data = pows;
    // 显示电站建设信息
    S5.mod5.loadModuleData(5);
}


/**
 * 启动S5的其他业务
 */
S5.start = function () {
    if (!onlyShowSolarFlag) {
        $(".moreCate").show();
        $("#autoPlay").show();
    } else {
        $(".map_legends").remove();
        $(".moreCate").remove();
        $("#autoPlay").remove();
    }
    // 启动六个模块
    S5.loadUserModules();
    // 启动定时计划
    S5.intervalPlan();
};

S5.loadUserModules = function () {
    var param = {};
    param["service"] = "queryScreenUserMdIfo";
    // queryScreenUserMdIfo 接口获取 要展示的模块
    $.ajax({
        type: "post",
        data: param,
        url: bathPath + '/powerAction_loaddata.action',
        dataType: "json",
        beforeSend: function () {},
        success: function (data, s) {
            var object = JSON.parse(data);
            var result_data = object.result_data;
            var mod_list = result_data.mod_list;
            S5.modArr = [];
            S5.modTitles = [];
            for (var i = 0; i < mod_list.length; i++) {
                var modObj = mod_list[i];
                S5.modArr.push(modObj.module_name);
                S5.modTitles.push(modObj.mod_title);
                $("#skin_body_module_" + (i + 1)).attr("mod_id", modObj.module_id);
            }
            S5.loadModules(S5.modArr, S5.modTitles);
        },
        error: function () {
            alert(LANG["I18N_MODEL_LOAD_FAIL"])
        }
    })
};

//加载各模块
S5.loadModules = function (modArr, modTitles) {
    if (commonTools.isEmptyArr(modArr)) {
        commonTools.consoleError("modArr is Empty : " + modArr);
        return;
    }
    if (modArr.length != 6) {
        commonTools.consoleError("modArr.length != 6; length: " + modArr.length);
        return;
    }
    require.config({
        baseUrl: bathPath + "/screen_5.0/modules/js",
        urlArgs: 'v=2'+vs,
    });
    require(modArr, function (mod1, mod2, mod3, mod4, mod5, mod6) {
        S5.mod1 = mod1;
        S5.mod2 = mod2;
        S5.mod3 = mod3;
        S5.mod4 = mod4;
        S5.mod5 = mod5;
        S5.mod6 = mod6;
        infoPowerstationDatas();
        //定时刷新
        $("#skin_body_module_1").load(bathPath + "/screen_5.0/modules/" + modArr[0] + ".html", function (responseText, textStatus) {
            mod1.loadModule(1, modTitles[0], modArr[0]);
            mod1.loadModuleData(1);
        });
        $("#skin_body_module_2").load(bathPath + "/screen_5.0/modules/" + modArr[1] + ".html", function (responseText, textStatus) {
            mod2.loadModule(2, modTitles[1], modArr[1]);
            // mod2.loadModuleData(2);
        });
        $("#skin_body_module_3").load(bathPath + "/screen_5.0/modules/" + modArr[2] + ".html", function (responseText, textStatus) {
            mod3.loadModule(3, modTitles[2], modArr[2]);
            // mod3.loadModuleData(3);
        });
        $("#skin_body_module_4").load(bathPath + "/screen_5.0/modules/" + modArr[3] + ".html", function (responseText, textStatus) {
            mod4.loadModule(4, modTitles[3], modArr[3]);
            mod4.loadModuleData(4);
        });
        $("#skin_body_module_5").load(bathPath + "/screen_5.0/modules/" + modArr[4] + ".html", function (responseText, textStatus) {
            mod5.loadModule(5, modTitles[4], modArr[4]);
            // mod5.loadModuleData(5);
        });
        $("#skin_body_module_6").load(bathPath + "/screen_5.0/modules/" + modArr[5] + ".html", function (responseText, textStatus) {
            mod6.loadModule(6, modTitles[5], modArr[5]);
            mod6.loadModuleData(6);
        });
    });

    //定时刷新模块数据
    S5.refreshModulesInterval = setInterval(function () {
        S5.refreshFunc();
    }, S5.refreshModulesIntervalTime);
};

//不加载模块数据，不加载模块信息
S5.refreshFunc = function () {
    for (var i = 0; i < 6; i++) {
        S5['mod' + (i + 1)].loadModuleData(i + 1);
    }
};

//全部定时取数方法
S5.intervalPlan = function () {
    //定时刷新今日发电量和累计发电量
    if (autoSlideEnergy) {
        if (S5.kpi.today_energy >= S5.kpi.today_energy_15min) {
            window.setInterval(function () {
                if ((S5.kpi.today_energy_view * 1 + S5.todayEnergySpeedUp * 1) <= S5.kpi.today_energy * 1) {
                    S5.kpi.today_energy_view += S5.todayEnergySpeedUp * 1;
                    S5.kpi.total_energy_view += S5.todayEnergySpeedUp * 1;
                } else {
                    S5.kpi.today_energy_view = S5.kpi.today_energy;
                    S5.kpi.total_energy_view = S5.kpi.total_energy;
                }
                if (S5.kpi.today_energy_view > S5.kpi.today_energy) {
                    return;
                }
                $("#kpiTotayEenergy").text(commonTools.replaceDecimalPoint(Screen.stringutil.dealEnergyData(S5.kpi.today_energy_view, null, language)));
                $("#kpiTodayEenergyUnit").text(Screen.stringutil.dealEnergyData(S5.kpi.today_energy_view, "unit", language));
                $("#kpiTotalEenergy").text(commonTools.replaceDecimalPoint(Screen.stringutil.dealEnergyData(S5.kpi.total_energy_view, null, language)) + Screen.stringutil.dealEnergyData(S5.kpi.total_energy_view, "unit", language));

            }, S5.todayEnergyIntervalTime);
        }
    }
    //风光储数据切换
    if (typeof autoPlayFn != 'undefined') {
        autoPlayFn(false);
    }
    S5.infoPowerstationInterval = setInterval(function () {
        //整五分钟刷新，与大屏同步 // 判断当前时间是整五分钟
        if (commonTools.currentMinTimeIsMultiplesOf5()) {
            infoPowerstationDatas();
            findAllPowerstations(function () {
                //取计算风速
                for (var i = 0; i < S5.kpi.power_list.length; i++) {
                    var power = S5.kpi.power_list[i];
                    var psType = Screen.stringutil.judgePowerType(power.ps_type);
                    if (psType == "1") {
                        S5.cur_wind_power = S5.getWindPowerBySpeed(Math.round(power.speed));
                        break;
                    }
                }
            });
            showFooter()
        }
    }, 60 * 1000 * 1);
};

/**
 * 加载时钟
 */
S5.init = function () {
    Screen.date.infoClock("sysTime", null); //加载时钟
    S5.info();
    var refreshMin = 60;
    setInterval(function () {
        var myDate = new Date();
        var hour = myDate.getHours();
        if (hour == 6 || hour == 5) {//5点或6点刷新系统页面
            window.location.reload(true);
        }
    }, 60 * 1000 * refreshMin);

    showFooter();//底部滚动
};

//展示风光储（默认展示单光伏）
function showWindStorage() {
    onlyShowSolarFlag = false;
}

//语言设置
function showLangDiv() {
    $(".changeLangSpan").show();
}

/**
 * 根据充电的值获取放电值  = 充电*0.96
 */
S5.getDischargeByCharge = function (val) {
    var result_val = "--";
    if ($.isNumeric(val)) {
        var f = parseFloat(val);
        result_val = parseFloat(f * S5.store_charge_dis_rate).toFixed(2);
    }
    return result_val;
};

S5.parseIntVal = function (val) {
    if ($.isNumeric(val)) {
        return parseFloat(val).toFixed(0);
    } else {
        return '--'
    }
};

/**
 * 一位数前补0
 * @param value 数字
 */
S5.zeroFill = function (value) {
    return value < 10 ? '0' + value : value;
};

