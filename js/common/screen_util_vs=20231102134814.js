var Screen = {};
Screen.echart = {};
Screen.echart.formatter = {};
Screen.canvas = {};
Screen.stringutil = {};
Screen.date = {};
Screen.AMap = {};


/**
 * 异步请求时候，处理错误返回.
 * 返回 true 表示已经开启了提示信息  false没有超时
 * @zhanglh
 * @param data
 */
Screen.ajax = function (ajaxObj) {
    if (ajaxObj.type == null || ajaxObj.type == "") {
        ajaxObj.type = "POST";
    }

    if (ajaxObj.url == null || ajaxObj.url == "") {
        return;
    }
    if (ajaxObj.loading == null || ajaxObj.loading == "") {
        ajaxObj.loading = true;
    }
    if (ajaxObj.loading) {
    }
    var xhr = $.ajax({
        type: ajaxObj.type,
        url: ajaxObj.url,
        data: ajaxObj.data,
        // timeout: ajaxObj.timeout || 30 * 1000,
        timeout: 300 * 1000,
        cache: ajaxObj.cache || false,
        async: ajaxObj.async || true,
        dataType: ajaxObj.dataType || "json",
        success: function (data) {
            var isNotLoginOut = true;
            if (isNotLoginOut && ajaxObj.success != null && typeof (ajaxObj.success) === "function") {
                ajaxObj.success(data, ajaxObj.params);
            }
        },
        error: function (XmlHttpRequest, textStatus, errorThrown) {
            /**
             * 错误处理 待补充完整
             */
            if (ajaxObj.error != null && typeof (ajaxObj.error) === "function") {
                ajaxObj.error();
            } else {
                if (XmlHttpRequest.status != null) {
                    if (XmlHttpRequest.status == 500) {
                        alert("内部错误,请联系管理员");
                    } else if (XmlHttpRequest.status == 0 && XmlHttpRequest.statusText == "timeout") {
                        alert("请求超时");
                    } else if (XmlHttpRequest.status == 404) {
                        alert("请求链接未找到");
                    }
                }
            }
        },
        complete: function (XmlHttpRequest, textStatus, errorThrown) {
            //Sungrow.dialog.hiding();
            if (ajaxObj.complete != null && typeof (ajaxObj.complete) === "function") {
                ajaxObj.complete();
            }
        }
    });
    return xhr;
};


/**
 *  echart横坐标格式化  line feed
 * @param params ha
 * @param provideNumber  每行个数
 * @returns {string}
 * @zhanglh
 */
Screen.echart.formatter.xlabelFeed = function (params, provideNumber) {
    var newParamsName = "";
    if (params == null) return "";
    var paramsNameNumber = params.length;
    var rowNumber = Math.ceil(paramsNameNumber / provideNumber);
    if (paramsNameNumber > provideNumber) {
        for (var p = 0; p < rowNumber; p++) {
            var tempStr = "";
            var start = p * provideNumber;
            var end = start + provideNumber;
            if (p == rowNumber - 1) {
                tempStr = params.substring(start, paramsNameNumber);
            } else {
                tempStr = params.substring(start, end) + "\n";
            }
            newParamsName += tempStr;
        }
    } else {
        newParamsName = params;
    }
    return newParamsName;
};


/**
 * 方法说明：动态构建分支线形图
 * branchSetting：请求参数 遵循branchSetting规约
 * context：canvas对象
 * invervalTime：定时器执行时间
 * key : 唯一标识
 * @zhanglh
 */
Screen.canvas.drawBranchImage = function (branchSetting, context, invervalTime, key) {
    var defaultStrokeStyle = "black";
    var defaultLineWidth = 4;
    var defaultSpeed = 1;
    if (branchSetting.data.length > 0) {
        for (var i = 0; i < branchSetting.data.length; i++) {
            var branchSonSetting = branchSetting.data[i];
            // 每一个定义一个定时器
            eval(key + "_updateBranchImageInterval" + i + "=" + setInterval(updateBranchImage(branchSonSetting, context, key + "_updateBranchImageInterval" + i), invervalTime) + ";");
        }
    }

    function updateBranchImage(branchSonSetting, context, interval) {
        if (branchSonSetting.xcur == null) {
            branchSonSetting.xcur = branchSonSetting.xs;
            branchSonSetting.ycur = branchSonSetting.ys;
        }

        //设置 画笔颜色 线宽 速度
        if (branchSonSetting.color == null) {
            branchSonSetting.color = defaultStrokeStyle;
        }
        if (branchSonSetting.lineWidth == null) {
            branchSonSetting.lineWidth = defaultLineWidth;
        }
        if (branchSonSetting.speed == null) {
            branchSonSetting.speed = defaultSpeed;
        }

        //定义颜色
        context.strokeStyle = branchSonSetting.color;
        context.lineWidth = branchSonSetting.lineWidth;
        context.speed = branchSonSetting.speed;
        //判断数据是否正确 1
        //双向考虑
        var tempX = context.speed;
        tempY = context.speed;
        //速度不允许超出单条线的距离
        if (Math.abs(branchSonSetting.yd - branchSonSetting.ys) >= Math.abs(branchSonSetting.xd - branchSonSetting.xs)
            && context.speed > Math.abs(branchSonSetting.xd - branchSonSetting.xs)) {
            context.speed = Math.abs(branchSonSetting.yd - branchSonSetting.ys) - 1;
        } else if (context.speed > Math.abs(branchSonSetting.yd - branchSonSetting.ys)) {
            context.speed = Math.abs(branchSonSetting.xd - branchSonSetting.xs) - 1;
        }

        //速度自适应，不允许运行结果点超过结束范围
        if (branchSonSetting.xcur != branchSonSetting.xd && branchSonSetting.ycur != branchSonSetting.yd) {
            tempX = branchSonSetting.xcur < branchSonSetting.xd ? context.speed : context.speed * (-1);
            tempY = branchSonSetting.ycur < branchSonSetting.yd ? context.speed : context.speed * (-1);
            if (((branchSonSetting.xcur + tempX < branchSonSetting.xd) && tempX < 0) ||
                ((branchSonSetting.xcur + tempX > branchSonSetting.xd) && tempX > 0)
            ) {
                tempX = branchSonSetting.xd - branchSonSetting.xcur;
            }

            if (((branchSonSetting.ycur + tempY < branchSonSetting.yd) && tempY < 0) ||
                ((branchSonSetting.ycur + tempY > branchSonSetting.yd) && tempY > 0)
            ) {
                tempY = branchSonSetting.yd - branchSonSetting.ycur;
            }

            drawLine(context, branchSonSetting.xcur, branchSonSetting.ycur, branchSonSetting.xcur + tempX, branchSonSetting.ycur + tempY);
            branchSonSetting.xcur = branchSonSetting.xcur + tempX;
            branchSonSetting.ycur = branchSonSetting.ycur + tempY;
        } else if (branchSonSetting.xcur != branchSonSetting.xd) {
            if (context.speed <= Math.abs(branchSonSetting.xd - branchSonSetting.xcur)) {
                tempX = branchSonSetting.xcur < branchSonSetting.xd ? context.speed : context.speed * (-1);
            } else {
                tempX = branchSonSetting.xd - branchSonSetting.xcur;
            }
            drawLine(context, branchSonSetting.xcur, branchSonSetting.ycur, branchSonSetting.xcur + tempX, branchSonSetting.ycur);
            branchSonSetting.xcur = branchSonSetting.xcur + tempX;
        } else if (branchSonSetting.ycur < branchSonSetting.yd) {
            if (context.speed <= Math.abs(branchSonSetting.yd - branchSonSetting.ycur)) {
                tempY = branchSonSetting.ycur < branchSonSetting.yd ? context.speed : context.speed * (-1);
            } else {
                tempY = branchSonSetting.yd - branchSonSetting.ycur;
            }
            drawLine(context, branchSonSetting.xcur, branchSonSetting.ycur, branchSonSetting.xcur, branchSonSetting.ycur + tempY);
            branchSonSetting.ycur = branchSonSetting.ycur + tempY;
        }

        if (branchSonSetting.ycur == branchSonSetting.yd && branchSonSetting.xcur == branchSonSetting.xd) {
            //结束 终止定时器
            window.clearTimeout(eval(interval));
            //判断是否有孩子
            if (branchSonSetting.children != null && branchSonSetting.children.length > 0) {
                for (var j = 0; j < branchSonSetting.children.length; j++) {
                    //孩子继承父亲属性 颜色 线宽 速度
                    if (branchSonSetting.children[j].color == null) {
                        branchSonSetting.children[j].color = branchSonSetting.color;
                    }
                    if (branchSonSetting.children[j].lineWidth == null) {
                        branchSonSetting.children[j].lineWidth = branchSonSetting.lineWidth;
                    }
                    if (branchSonSetting.children[j].speed == null) {
                        branchSonSetting.children[j].speed = branchSonSetting.speed;
                    }
                    eval(interval + "_" + j + "=" + setInterval(updateBranchImage(branchSonSetting.children[j], context, interval + "_" + j), invervalTime) + ";");
                }
            }

        } else {
            return function () {
                updateBranchImage(branchSonSetting, context, interval);
            }
        }
    }


    function drawLine(content, xstart, ystart, xend, yend) {
        context.beginPath();
        context.moveTo(xstart, ystart);
        context.lineTo(xend, yend);
        context.stroke();
        context.closePath();
    }
};

Screen.canvas.drawBranchImageExample = function () {
    //在html页面上 添加canvas标签 id为 myCanvas 例如       <canvas id="myCanvas" width="958px" height="540px"  >
    var myCanvas = document.getElementById('myCanvas');
    var context = myCanvas.getContext("2d");
    //请求参数格式规约
    var branchSettingTest = {
        data: [ // 支持多条线路一起画，data为数组形式。
            {
                xs: 10, //x轴开始坐标
                ys: 10, //y轴开始坐标
                xd: 100,//x轴结束坐标
                yd: 10,//y轴结束坐标
                speed: 10, //定时器每次执行时 画图的速度 10代表每次画10像素。
                color: "yellow", //画笔颜色定义 孩子如不定义，则孩子默认继承父亲
                children: [{ //孩子同父亲结构
                    xs: 100,
                    ys: 10,
                    xd: 300,
                    yd: 10
                }, {
                    xs: 100,
                    ys: 10,
                    xd: 100,
                    yd: 150,
                    children:
                        [{
                            xs: 100,
                            ys: 150,
                            xd: 300,
                            yd: 150
                        }, {
                            xs: 100,
                            ys: 150,
                            xd: 100,
                            yd: 300
                        }]
                }, {
                    xs: 100,
                    ys: 10,
                    xd: 150,
                    yd: 100
                }]
            }, {
                xs: 109,
                ys: 109,
                xd: 109,
                yd: 300,
                color: "green",
                children: [{
                    xs: 109,
                    ys: 300,
                    xd: 300,
                    yd: 300
                }
                ]
            }
        ]
    };


    Screen.canvas.drawBranchImage(branchSettingTest, context, 100, "b");
    //Screen.canvas.drawBranchImage(branchSettingTest,context,100,"a1111"); 可以同时开启多个
};


//特殊需求，临时更改，单位中文转英文
Screen.stringutil.replaceUnit = function (unit) {
    if (unit == "万度") {
        unit = "万kWh";
    } else if (unit == "亿度") {
        unit = "亿kWh"
    } else if (unit == "度") {
        unit = "kWh";
    }
    return unit;
};

//累加：a[i] = a[i-1] + a[i]
Screen.stringutil.addUpArr = function (arr) {
    var restArr = arr.slice(0);
    for (var i = 1; i < restArr.length; i++) {
        if ($.isNumeric(restArr[i - 1]) && $.isNumeric(restArr[i])) {
            restArr[i] = parseFloat(restArr[i - 1]) + parseFloat(restArr[i]);
        } else if ($.isNumeric(restArr[i - 1])) {
            restArr[i] = parseFloat(restArr[i - 1]);
        }
    }
    return restArr;
};


Screen.stringutil.addUpArr_curMonth = function (arr) {
    var restArr = arr.slice(0);
    var now = new Date();
    var mon = now.getMonth();
    var month = mon + 1;
    var day = now.getDate();
    var days = getDays();
    var len = restArr.length;
    if (month == 1) {
        restArr[0] = restArr[0] * day / days;
    } else {
        for (var i = 1; i < len && i < month; i++) {
            if ($.isNumeric(restArr[i - 1]) && $.isNumeric(restArr[i])) {
                if (i == mon) {
                    restArr[i] = parseFloat(restArr[i - 1]) + parseFloat(restArr[i]) * day / days;
                } else {
                    restArr[i] = parseFloat(restArr[i - 1]) + parseFloat(restArr[i]);
                }
            } else if ($.isNumeric(restArr[i - 1])) {
                restArr[i] = parseFloat(restArr[i - 1]);
            }
        }
    }
    return restArr;
};

//合计数组的值
Screen.stringutil.sumArrayData = function (array) {
    var sum = 0;
    for (var i = 0; i < array.length; i++) {
        if ($.isNumeric(array[i])) {
            sum += parseFloat(array[i]);
        }
    }
    return sum;
};

Screen.stringutil.dealEchartBarArr = function (arr) {
    if (arr && arr.length) {
        if (!$.isNumeric(arr[0])) {
            arr[0] = "";//第一个值不能为"--",echart不能正常显示
        }
        for (var i = 1; i < arr.length; i++) {
            if (!$.isNumeric(arr[i])) {
                arr[i] = "";
            }
        }
    }
    return arr;
};

//计算完成率
Screen.stringutil.CalculatedCompletionRate = function (actVal, planVal) {
    if ($.isNumeric(actVal) && $.isNumeric(planVal) && planVal != 0) {
        return parseFloat((actVal / planVal * 100).toFixed(2));
    }
    return "";
};

//检查数据是否返回值
Screen.stringutil.isNotNull = function (data) {
    if (data == 0 || data == "0") {
        return false;
    }
    if (data == null || data == "" || data == "null" || data == undefined || data == "undefined") {
        return false;
    }
    return true;
};

Screen.stringutil.dealEchartLineArr = function (arr) {
    if (arr && arr.length) {
        for (var i = 0; i < arr.length; i++) {
            if ("--" == arr[i] || "" == arr[i]) {
                arr[i] = "";
            }
        }
    }
    return arr;
};


Screen.stringutil.dealEchartToolTip = function (val) {
    if ("" == val || "-" == val || typeof val == 'undefined') {
        return "--"
    }
    return val;
};

//解析json字符串
Screen.stringutil.parseJson = function (data) {
    var object = null;
    try {
        object = JSON.parse(data);
        if (!isNotNull(object) || object.result_code == -1) {
            showErrorMsg("请求接口数据失败，请刷新重试");
        }
    } catch (e) {
        //showErrorMsg();
        log("解析数据出错 data:" + data);
    }
    return object;
};

//解析json字符串 今日发电量
Screen.stringutil.dealEnergyData = function (data, type, lang) {
    if (isNaN(data)) return "--";
    if (type != null && type == "unit") {
        if (lang == undefined || lang == null || lang == '' || lang == 'zh_CN') {
            return data > 10000 ? "万度" : "度";
        } else {
            return data > 1000 ? "MWh" : "kWh";
        }
    } else {
        if (lang == undefined || lang == null || lang == '' || lang == 'zh_CN') {
            return data > 10000 ? (data / 10000).toFixed(3) : data.toFixed(1);
        } else {
            return data > 1000 ? (data / 1000).toFixed(3) : data.toFixed(1);
        }
    }

};

//单位转换支持 GMw
Screen.stringutil.dealEnergyDataGMw = function (data, type, lang) {
    if (isNaN(data)) return "--";
    if (type != null && type == "unit") {
        if (lang == undefined || lang == null || lang == '' || lang == 'zh_CN') {
            return data > 100000000 ? "亿度" : (data > 10000 ? "万度" : "度");
        } else {
            return data > 1000000 ? "GWh" : (data > 1000 ? "MWh" : "kWh");
        }
    } else {
        if (lang == undefined || lang == null || lang == '' || lang == 'zh_CN') {
            return data > 100000000 ? (data / 100000000).toFixed(1) : (data > 10000 ? (data / 10000).toFixed(2) : data.toFixed(1));
        } else {
            return data > 1000000 ? (data / 1000000).toFixed(1) : (data > 1000 ? (data / 1000).toFixed(2) : data.toFixed(1));
        }
    }
};

/**
 * 判断风光储电站  0 光 1 风  2储能
 * powerType: 1    地面电站， 3分布式光伏， 4 户用光伏, 6村级电站, 7分布式储能, 8扶贫电站, 9风能电站, 5户用储能
 */
Screen.stringutil.judgePowerType = function (powerType) {
    var pvType = ",1,3,4,6,8,", storeType = ",5,7,", windType = ",9,";
    // if(pvType.indexOf(powerType)>=0){
    //    return 0 ;
    // }else
    if (windType.indexOf(powerType) >= 0) {
        return 1;
    } else if (storeType.indexOf(powerType) >= 0) {
        return 2;
    }
    return 0;
};
/**
 * 装机容量数据转换
 */
Screen.stringutil.handleCapacity = function (value, unit, defaultUnit) {
    if (language == 'zh_CN' || language == undefined || language == null || language == '') {
        if (defaultUnit == "万千瓦") {
            if (unit == "吉瓦" || unit == "GW") {
                return value * 1 * 100;
            } else if (unit == "兆瓦" || unit == "MW") {
                return value * 1 / 10;
            } else if (unit == "千瓦" || unit == "kW") {
                return value * 1 / 10000;
            } else if (unit == "瓦" || unit == "W") {
                return value * 1 / (10000 * 1000);
            }
        }
    } else {
        if (defaultUnit == "MW") {
            if (unit == "kW") {
                return value * 1 / 1000;
            } else if (unit == "W") {
                return value * 1 / (1000 * 1000);
            }
        }
    }
    return value * 1;
};


/**
 * 处理空数据为默认值
 */
Screen.stringutil.handleNullToDefault = function (value, defaultStr) {
    if (defaultStr == null) {
        defaultStr = "--";
    }
    if (value == null || value == "" || value == "NULL" || value == "null") {
        return defaultStr;
    }
    return value;
};

/**
 * 时钟走动
 * @param data
 */
Screen.date.clocking = function (container, type) {
    if (document.getElementById(container) == null) return;
    //分别获取年、月、日、时、分、秒
    var myDate = new Date();
    var year = myDate.getFullYear();
    var month = myDate.getMonth() + 1;
    var date = myDate.getDate();
    var hours = myDate.getHours();
    var minutes = myDate.getMinutes();
    var seconds = myDate.getSeconds();
    //月份的显示为两位数字如09月
    if (month < 10) {
        month = "0" + month;
    }
    if (date < 10) {
        date = "0" + date;
    }
    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    var dateFormat = "";
    if (type == null || type == "1") {
        dateFormat = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds + "";
    }
    document.getElementById(container).innerHTML = dateFormat;
};

/**
 * 启用时钟
 * @param container  时钟容器id
 * @param type  时钟格式
 */
Screen.date.infoClock = function (container, type) {
    window.setInterval(function () {
        Screen.date.clocking(container, type)
    }, 1000);
};


Screen.AMap.scontrol = function () {

};

Screen.AMap.scontrol.prototype = {
    addTo: function (map, dom) {
        dom.appendChild(this._getHtmlDom(map));
        //dom.appendChild(this._getHtmlSwitchDom(map));
    },
    _getHtmlDom: function (map) {
        this.map = map;
        // 创建一个能承载控件的<div>容器
        var controlUI = document.createElement("DIV");
        controlUI.style.width = '50px';     //设置控件容器的宽度
        controlUI.style.height = '50px';    //设置控件容器的高度
        controlUI.style.backgroundColor = '#B5D6EA';
        //controlUI.style.borderStyle='solid';
        //controlUI.style.borderWidth='2px';
        controlUI.style.cursor = 'pointer';
        controlUI.style.textAlign = 'center';

        // 设置控件的位置
        controlUI.style.position = 'absolute';
        controlUI.style.left = '1000px';     //设置控件离地图的左边界的偏移量
        controlUI.style.top = '280px';        //设置控件离地图上边界的偏移量
        controlUI.style.zIndex = '300';     //设置控件在地图上显示

        // 设置控件字体样式
        controlUI.style.fontFamily = 'Arial,sens-serif';
        controlUI.style.fontSize = '12px';
        controlUI.style.paddingLeft = '4px';
        controlUI.style.paddingRight = '4px';

        controlUI.className = "wxTitle";


        controlUI.innerHTML = "<div><div id='screen_lay' code='0'>" + LANG.I18N_COMMON_SATLLITE_MAP + "</div></div>";

        // 设置控件响应点击onclick事件
        controlUI.onclick = function () {
            if ($("#screen_lay") != null && $("#screen_lay").attr("code") == "0") {
                if (typeof S5 != 'undefined') {
                    S5.satellLayer.hide();
                } else if (typeof S5Area != 'undefined') {
                    S5Area.satellLayer.hide();
                } else if (typeof S5Relief != 'undefined') {
                    S5Relief.satellLayer.hide();
                }
                $("#screen_lay").attr("code", "1");
                $("#screen_lay").text(LANG.I18N_COMMON_STANDARD_MAP);
            } else if ($("#screen_lay") != null && $("#screen_lay").attr("code") == "1") {
                if (typeof S5 != 'undefined') {
                    S5.satellLayer.show();
                } else if (typeof S5Area != 'undefined') {
                    S5Area.satellLayer.show();
                } else if (typeof S5Relief != 'undefined') {
                    S5Relief.satellLayer.show();
                }
                $("#screen_lay").attr("code", "0");
                $("#screen_lay").text(LANG.I18N_COMMON_SATLLITE_MAP);
            }
        };
        //加载鱼骨
        map.plugin(["AMap.ToolBar"], function () {
            var toolBarSetting = {
                offset: new AMap.Pixel(1000, 340)
            };
            var toolBar = new AMap.ToolBar(toolBarSetting);
            map.addControl(toolBar);
        });
        $(".amap-controls").hide();
        return controlUI;
    }
};

/**
 * 空数值数转换为 --
 */
Screen.stringutil.transEmptyNum = function (val) {
    if (typeof val == 'undefined' || val == null || isNaN(val)) {
        return "--";
    }
    return val;
};

/**
 * 空单位数转换为 ""
 */
Screen.stringutil.transEmptyUnit = function (val) {
    if (typeof val == 'undefined' || val == null) {
        return "";
    }
    return val;
};


/**
 * 获取字节长度
 */
Screen.stringutil.strlen = function (str) {
    var len = 0;
    for (var i = 0; i < str.length; i++) {
        var c = str.charCodeAt(i);
        //单字节加1
        if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
            len++;
        } else {
            len += 2;
        }
    }
    return len;
};


var mapTools = {
    /**
     * 乘法带精度
     * @param a
     * @param b
     * @returns {number}
     */
    accMul: function (a, b) {
        // if (Sungrow.isDEDEEnv()) {
        //     a = Sungrow.transDeDENum2Normal(a);
        //     b = Sungrow.transDeDENum2Normal(b);
        // }
        var s1 = a + '';
        var s2 = b + '';
        var m = (s1.split('.').length > 1 ? s1.split('.')[1].length : 0);
        m += (s2.split('.').length > 1 ? s2.split('.')[1].length : 0);
        return Number(s1.replace('.', '')) * Number(s2.replace('.', '')) / Math.pow(10, m);
    },

    /**
     * 除法带精度
     * @param a
     * @param b
     * @returns {number}
     */
    accDiv: function (a, b) {
        // if (Sungrow.isDEDEEnv()) {
        //     a = Sungrow.transDeDENum2Normal(a);
        //     b = Sungrow.transDeDENum2Normal(b);
        // }
        a = a + '';
        b = b + '';
        var t1 = a.split('.').length > 1 ? a.split('.')[1].length : 0;
        var t2 = b.split('.').length > 1 ? b.split('.')[1].length : 0;
        var r1 = Number(a.replace('.', ''));
        var r2 = Number(b.replace('.', ''));
        var num = (r1 / r2) * Math.pow(10, t2 - t1);
        return Math.round(num * 100) / 100;
    },

    /**
     * 加法带精度
     * @param a
     * @param b
     * @returns {number}
     */
    accAdd: function (a, b) {
        // if (Sungrow.isDEDEEnv()) {
        //     a = Sungrow.transDeDENum2Normal(a);
        //     b = Sungrow.transDeDENum2Normal(b);
        // }
        var s1 = a + '', s2 = b + '';
        var t1 = s1.split('.').length > 1 ? s1.split('.')[1].length : 0;
        var t2 = s2.split('.').length > 1 ? s2.split('.')[1].length : 0;
        var num = Math.pow(10, Math.max(t1, t2));
        return (a * num + b * num) / num;
    },

    /**
     * 除法带精度
     * @param a
     * @param b
     * @returns {string}
     */
    accSub: function (a, b) {
        // if (Sungrow.isDEDEEnv()) {
        //     a = Sungrow.transDeDENum2Normal(a);
        //     b = Sungrow.transDeDENum2Normal(b);
        // }
        var s1 = a + '', s2 = b + '';
        var t1 = s1.split('.').length > 1 ? s1.split('.')[1].length : 0;
        var t2 = s2.split('.').length > 1 ? s2.split('.')[1].length : 0;
        var pre = Math.max(t1, t2);
        var num = Math.pow(10, pre);
        return ((a * num - b * num) / num).toFixed(pre);
    },

    /**
     * 高德地图国测局坐标系范围
     * @type {string}
     */
    CHINA_MAP: "00000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001100000001011000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011101010111100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000110111111111000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000111101111110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000110111100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111111110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111111100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011010111000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001110011100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000110000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001010011100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000111100110001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000111110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011111000111000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111110011000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111000000000111000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000111100000000000010111110100000011000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000111110000000001111111111111111000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000111111111000000111111111111111110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011111111111101111111111111111111111100000000000000000000000000000000000000000000000000000000000000000000000000000000000000011111111111111111111111111111111111111000000000000000000000000000000000000000000000000000000000000000000000000000000000000101111111111111111111111111111111111111110000000000000000000000000000000000000000000000000000000000000000000000000000000000011111111111111111111111111111111111111111100000000000000000000000000000000000000000000000000000000000000000000000000000000001111111111111111111111111111111111111111111100000000000000000000000000000000000000000000000000000000000000000000000000000000111111111111111111111111111111111111111111111000000000000000000000000000000000000000000000000000000000000000000000000000000001111111111111111111111111111111111111111111100000000000000000000000000000000000000000000000000000000000000000000000000000000011111111111111111111111111111111111111111111100000000000000000000000000000000000000000000000000000000000000000011110000000001111111111111111111111111111111111111111111110000000000000000000000000000000000000000000000000000000000011000011111100000000111111111111111111111111111111111111111111111100000000000000000000000000000000000000000000000000001111111100111111111100110111111111111111111111111111111111111111111111110000000000000000000000000000000000000000000000000001111111111111111111111111111111111111111111111111111111111111111111111111100000000000000000000000000000000000000000000000011111111111111111111111111111111111111111111111111111111111111111111111111111000000000000000000000000000000000000000000000111111111111111111111111111111111111111111111111111111111111111111111111111111100000000000000000000000000000000000000000101111111111111111111111111111111111111111111111111111111111111111111111111111111111000000000000000000000000000000000000001111111111111111111111111111111111111111111111111111111111111111111111111111111111111100000000000000000000000000000000000011111111111111111111111111111111111111111111111111111111111111111111111111111111111111110000000000000000000000000000000000011111111111111111111111111111111111111111111111111111111111111111111111111111111111111110000000000000000000000000000000000001111111111111111111111111111111111111111111111111111111111111111111111111111111111111110000000000000000000000000000000000001111111111111111111111111111111111111111111111111111111111111111111111111111111111111111000000000000000000000000000000000000111111111111111111111111111111111111111111111111111111111111111111111111111111111111111000000000000000000000000000000000000001111111111111111111111111111111111111111111111111111111111111111111111111111111111111000000000000000000000000000000000000000111111111111111111111111111111111111111111111111111111111111111111111111111111111111100000000000000000000000000000000000000011111111111111111111111111111111111111111111111111111111111111111111111111111111111100000000000000000000000000000000000000011111111111111111111111111111111111111111111111111111111111111111111111111111111111100000000000000000000000000000000000000111111111111111111111111111111111111111111111111111111111111111111111111111111111111110000000000000000000000000000000000001111111111111111111111111111111111111111111111111111111111111111111111111111111111111111110000000000000000000000000000000001111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111100000000000000000000000000000011111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111110000000000000000000000000011111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111000000000000000000000000000111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111011111000000000000000000000000000111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111100100000000000000000000000000000111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111100011100000000000000000000000000011111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111000111110000000000000000000000001111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111110011111110000000000000000000000111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111110111111110000000000000000000000111011111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111110000000000000000000000001111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111100000000000000000000000011111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111000000000000000000000000011111111111111111111111111111111111111111111111100001111111111111111111111111111111111111111111111111010000000000000000000000111111111111111111111111111111111111111111110000000000000001111111111111111111111111111111111111111111100000000000000000000011111111111111111111111111111111100000000000000000000000000001111111111111111111111111111111111111111110000000000000000000001111111111111111111111111111111100000000000000000000000000000001111111111111111111111111111111111111111000000000000000000000111111111111111111111111111111110000000000000000000000000000001111111111111111111111111111111111111111100000000000000000000111111111111111111111111111111000000000000000000000000000000000111111111111111111111111111111111111111111000000000000000000001111111111111111111111111110000000000000000000000000000000000001110011111111111111111111111111111111111111100000000000000000000011111111111111111100000000000000000000000000000000000000000000000001111111111111111111111111111111111111000000000000000000001111111111111111111000000000000000000000000000000000000000000000000011111111111111111111111111111111111100000000000000000000011111111111111111100000000000000000000000000000000000000000000000000011111111111111111111111111111111111000000000000000000001111111111111111100000000000000000000000000000000000000000000000000000000111111111111111111111111111111110000000000000000000000000111111111100000000000000000000000000000000000000000000000000111111111111111111111111111111111111111000000000000000000000000011111111100000000000000000000000000000000000000000000000000011111111111111111111111111111110001111100000000000000000000000000111110000000000000000000000000000000000000000000000000000001111111111111111111111111111111000000000000000000000000000000000001110000000000000000000000000000000000000000000000000000000011111111111111111111111111111000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111111111111111111111111100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000111111111111111111000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011111111111111111000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000111111111111111100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011111111111111100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011111111111110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011111111111110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111111111110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010110000000000000000000000",
    /**
     * 坐标是否国测局格式
     * @param lat
     * @param lng
     * @returns {boolean}
     */
    isGcj: function (lat, lng) {
        var coorX = parseInt(mapTools.accDiv(mapTools.accSub(lng, 73.0), 0.5));
        var coorY = parseInt(mapTools.accDiv(mapTools.accSub(lat, 3.5), 0.5));
        if (coorY >= 0 && coorY < 101 && coorX >= 0 && coorX < 124) {
            try {
                coorY = 124 * coorY + coorX;
                return mapTools.CHINA_MAP.charAt(coorY) === '1';
            } catch (e) {
                console.log(e)
                return true
            }
        } else {
            return false
        }
    }
};


Screen.echart.axisLabelPaddingBottom = function (num) {
    var bottom = 40;
    switch (num) {
        case 5:
            bottom = 22;
            break;
        case 4:
            bottom = 28;
            break;
        case 3:
            bottom = 30;
            break;
        case 2:
            bottom = 25;
            break;
    }
    return bottom;

}

/**
 * 设置echart图例柱形宽度
 * @param num
 */

Screen.echart.barWidth = function (num) {
    var barWidth = 22;
    switch (num) {
        case 5:
            barWidth = 6;
            break;
        case 4:
            barWidth = 10;
            break;
        case 3:
            barWidth = 14;
            break;
        case 2:
            barWidth = 18;
            break;
    }
    return barWidth;

}
