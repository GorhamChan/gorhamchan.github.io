var convivaClient = null;
var convivaSessionKey = "";
var isH5HttpsLive = true;

function getQueryString(name) {

    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if(r != null) {
        return unescape(r[2]);
    } else {
        return "";
    }

}

function getHtml5VideoData(data) {

}

function createHtml5LivePlayer(playerId, w, h, channel, pstImg) {

    var html5PlayerWidth;
    var html5PlayerHeight;
    var hls_vod_url;

    var VideoName = "";
    var videoTVChannel = "";
    var ChannelID = "";
    var playerContainerId = playerId;
    var html5PosterImg = "";

    var isFlvLivePublic = "";
    var cdnName = "";

    var isLiveVideoPlaying = false;
    var playingTimer = null;
    var endPlayTime = 5 * 60;

    var media_events = new Array();
    media_events["loadstart"] = 0;
    media_events["progress"] = 0;
    media_events["suspend"] = 0;
    media_events["emptied"] = 0;
    media_events["stalled"] = 0;
    media_events["play"] = 0;
    media_events["pause"] = 0;
    media_events["loadedmetadata"] = 0;
    media_events["loadeddata"] = 0;
    media_events["waiting"] = 0;
    media_events["playing"] = 0;
    media_events["canplay"] = 0;
    media_events["canplaythrough"] = 0;
    media_events["seeking"] = 0;
    media_events["seeked"] = 0;
    media_events["timeupdate"] = 0;
    media_events["ended"] = 0;
    media_events["ratechange"] = 0;
    media_events["durationchange"] = 0;
    media_events["volumechange"] = 0;

    var ConvivaImplJs = "http://js.player.cntv.cn/creator/conviva-html5native-impl.js";
    var ConvivaLibarylJs = "http://js.player.cntv.cn/creator/conviva-html5native-library.min.js";


    var convivaPlayerStateManager = null;
    var isUseConvivaMonitor = true;

    var guoshuangJs = "http://app.cntv.cn/special/gridsum/vd/200094.js";
    var hdsUseGuoshuangMonitor = false;
    var html5HdsGuoshuang = null;
    var useHdsGuoshuangMonitor = true;

    var shuguangJs = "http://sum.cntvwb.cn/flashplayer/musesh5vedioagent.js";
    var useHdsShuguangMonitor = false;

    var useCntvMonitor = true;   //开启或关闭阿里数据统计
    var cntvMonitorJs = "http://js.player.cntv.cn/creator/html5player_analysis_lib.js";
    //var cntvMonitorJs = "http://g.alicdn.com/alilog??aplus_plugin/cctv.js,aplus_plugin/aplus_u.js";
    var cntvMonitorVersion = "2018.09.16.01";

    var hdsIsNormalVideo = true;
    var hdsConvivaVdnSid = "";
    var hdsConvivaCdnInfo = { "vdnIP": "", "vdnCountryCode": "", "vdnProvinceCode": "", "vdnCityCode": "", "vdnISPCode": "" };

    var hdsBtime = "";
    var hdsBauth = "";
    var html5AuthFlag = "1";

    //对借口文档的新字段进行初始化；
    var vdn_tsp = new Date().getTime().toString().slice(0, 10);
    var vdn_vnFlash = "1537"; //央视网页FlashV1.0--No1
    var staticCheck_Flash = "B4B51E8523157ED8D17ADB76041BCD09";
    var vdn_vnHtml5 = "2049"; //央视网页Html5V1.0--No1
    var staticCheck_Html5 = "47899B86370B879139C08EA3B5E88267";
    var vdn_vc = "";
    var vdn_uid = "";
    var vdn_wlan = "";
    var Fingerprint = ""; //定义设备指纹信息的key值
    var isHtml5VdnMsg = "0";

    if(typeof isPlayerHttpsMode !=="undefined" && !isPlayerHttpsMode) {
        isH5HttpsLive = false;
    }


    if(isH5HttpsLive) {

        cntvMonitorJs = "https://js.player.cntv.cn/creator/html5player_analysis_lib.js";

        ConvivaImplJs = "https://js.player.cntv.cn/creator/conviva-html5native-impl.js";
        ConvivaLibarylJs = "https://js.player.cntv.cn/creator/conviva-html5native-library.min.js";
        guoshuangJs = "https://app.cntv.cn/special/gridsum/vd/200094.js";
    }

    if(!channel) {
        doJumpToAppPlayer(playerContainerId, html5PlayerWidth, html5PlayerHeight);
        return;
    }

    document._baseDiv = document.getElementById(playerId);
    html5PlayerWidth = w;
    html5PlayerHeight = h;
    ChannelID = channel;


    if(pstImg) {
        html5PosterImg = pstImg;
    }

    var clientInfo = navigator.userAgent.toLowerCase();

    if(channel.indexOf("http://") !== -1 && channel.indexOf(".m3u8") > 0) {
        try {
            if(isUseConvivaMonitor) {
                doLoadHtml5ConvivaJs();
            }

            doLoadHtml5AnalyticsJs("guoshuang", "jsLoader5", checkHdsGuoshuang);

            doLoadHtml5AnalyticsJs("shuguang", "jsLoader6", checkHdsShuguang);

            doLoadHtml5AnalyticsJs("cntv", "jsLoader7", checkHdsCntv);

        } catch(e) {}

        hls_vod_url = channel;
        if(getQueryString("channel")) {
            channel = getQueryString("channel");
        }

        ChannelID = channel;
        cdnName = "LIVE-HLS-CDN-CNCVIPC";

        createHtml5Player(playerContainerId);
        createPlayerElement();
        html5InitEvent();
        htmlPlayAFile();

        if(useHdsGuoshuangMonitor) {
            html5HdsGuoshuang = new HdsGuoshuangAnalytics();
            setHdsGuoshuangInitData(document._html5Player.src);
        }

    } else{

        var pageUrl = "";
        hdsBtime = getQueryString("btime");
        hdsBauth = getQueryString("bauth");

        var vdnData = getQueryString("vdn_data");
        var vdn_last = getQueryString("vdn_last");
        var now_time = Date.parse(new Date())/1000;


        if(vdn_last && now_time-vdn_last<60) {
            if(getQueryString("autherror") === "illegal") {
                html5HdsCopyrightMsg(playerId, w, h, "auth", "autherror:illegal");
                doLoadHtml5ConvivaJs();
                return;

            } else if(hdsBtime.length>5 && hdsBauth.length>10 && vdnData.length>10) {

                checkHtml5Auth(false, "b_matching", "http://h5.cntv.powzamedia.com/cntv/b_matching");

                if(html5AuthFlag === "0") {
                    var jumpUrl = "http://h5.cntv.powzamedia.com/cntv/err_check";
                    pageUrl = location.href;
                    try{
                        pageUrl = deleteUrlPara(pageUrl, "vdn_data");
                    } catch(e){

                    }

                    jumpUrl += "?referer=" + encodeURIComponent(pageUrl);
                    location.href = jumpUrl;
                } else{
                    html5ParseJsonFromUrl(vdnData);
                }
                return;
            } else if(vdnData.length>10 && hdsBtime.length<5 && hdsBauth.length<10){
                var jumpUrl = "http://h5.cntv.powzamedia.com/cntv/b_match";
                pageUrl = location.href;


                try{
                    pageUrl = deleteUrlPara(pageUrl, "bauth");
                    pageUrl = deleteUrlPara(pageUrl, "btime");
                } catch(e){

                }

                jumpUrl += "?referer=" + encodeURIComponent(pageUrl);
                location.href = jumpUrl;
                return;
            }
        }


        getJsonDataFromVdn(channel);
    }

    function getJsonDataFromVdn(channel) {
        channel = channel.replace("pa://cctv_p2p_hd", "");
        var _doc = document.getElementsByTagName("head")[0];
        var jsLoader = createElementByType("script", "jsLoader", "absolute", "0px", "0px", "0px", "0px");
        var vdnUrl = "http://vdn.live.cntv.cn/api2/liveHtml5.do?channel=pa://cctv_p2p_hd" + channel + "&client=html5";
        if(isH5HttpsLive) {
            vdnUrl = "https://vdn.live.cntv.cn/api2/liveHtml5.do?channel=pa://cctv_p2p_hd" + channel + "&client=html5";
        }
        if(!getCookie_vdn("Fingerprint")) {
            //获取设备指纹信息
            getfingerprint2();
        } else {
            vdn_uid = getCookie_vdn("Fingerprint");
            //console.log(vdn_uid+"9090909090909090")
        }
        vdn_vc = setH5Str((vdn_tsp + vdn_vnHtml5 + staticCheck_Html5 + vdn_uid)).toLocaleUpperCase()
        vdnUrl += "&client=html5" + "&tsp=" + vdn_tsp + "&vn=" + vdn_vnHtml5 + "&vc=" + vdn_vc + "&uid=" + vdn_uid + "&wlan=" + vdn_wlan;
        //vdnUrl += "&ip=101.248.0.0";

        jsLoader.src = vdnUrl;
        _doc.appendChild(jsLoader);

        jsLoader.onload = function() {
            parseJsonDataFromVdn();
        };

        jsLoader.onreadystatechange = function() {
            if(jsLoader.readyState == 'loaded' || jsLoader.readyState == 'complete') {
                parseJsonDataFromVdn();
            }
        }

        try {
            if(isUseConvivaMonitor) {
                doLoadHtml5ConvivaJs();
                setTimeout(function (){
                    if(!hls_vod_url) {
                        if(isHtml5VdnMsg === "1") {
                            setConvivaMetadata("VDN_RESPONSE_EMPTY");
                            setCntvMetadata("690003", "VDN_RESPONSE_EMPTY");
                        } else if(isHtml5VdnMsg === "2"){
                            setConvivaMetadata("VDN_RESPONSE_PARSE_ERROR");
                            setCntvMetadata("690003", "VDN_RESPONSE_PARSE_ERROR");
                        } else{
                            setConvivaMetadata();
                            setCntvMetadata("690003", "VDN_RESPONSE_ERROR");
                        }
                    }
                }, 10000);
            }

            doLoadHtml5AnalyticsJs("guoshuang", "jsLoader5", checkHdsGuoshuang);

            doLoadHtml5AnalyticsJs("shuguang", "jsLoader6", checkHdsShuguang);

            doLoadHtml5AnalyticsJs("cntv", "jsLoader7", checkHdsCntv);

        } catch(e) {}
    }




    function parseJsonDataFromVdn() {

        var videoData = null;
        try {
            videoData = eval('(' + html5VideoData + ')');

            if(typeof(videoData.hls_cdn_info.cdn_code) != "undefined") {
                cdnName = videoData.hls_cdn_info.cdn_code;
            } else {
                isHtml5VdnMsg = "1";
                cdnName = "";
            }

            if(typeof(videoData.hls_url.hls2) != "undefined" && videoData.hls_url.hls2) {
                hls_vod_url = videoData.hls_url.hls2;
            } else if(typeof(videoData.hls_url.hls4) != "undefined" && videoData.hls_url.hls4) {
                hls_vod_url = videoData.hls_url.hls4;

            } else {
                hls_vod_url = videoData.hls_url.hls1;
            }

            if(hls_vod_url.toLowerCase().indexOf("dianpian.mp4") > 0) {
                hdsIsNormalVideo = false;
            }

            hdsConvivaVdnSid = videoData.client_sid;
            hdsConvivaCdnInfo = {
                "vdnIP": videoData.lc.ip,
                "vdnCountryCode": videoData.lc.country_code,
                "vdnProvinceCode": videoData.lc.provice_code,
                "vdnCityCode": videoData.lc.city_code,
                "vdnISPCode": videoData.lc.isp_code
            };

            isFlvLivePublic = videoData.public;
            var _0x1576=["\x63\x75\x6C\x33", "\x63\x71\x6C\x36"];html5Aauth= _0x1576[0];

        } catch(e) {
            if(isHtml5VdnMsg === "0") {
                isHtml5VdnMsg = "2";
            }
            showError("数据格式错误");
        }

        var aliInitTimer = setInterval(function () {
            if(typeof goldlog!= "undefined" && goldlog.initSession!= "undefined") {
                clearInterval(aliInitTimer);

                setCntvMetadata("init");

            }
        }, 100);

        if (isFlvLivePublic != 1) {

            try{
                createHtml5ConvivaEvent();
            } catch(e) {
                //alert(e.message)
            }
            if(isFlvLivePublic === "0") {
                html5HdsCopyrightMsg(playerContainerId, html5PlayerWidth, html5PlayerHeight, "copyright");
                return;
            }
            if(isFlvLivePublic === "2") {
                html5HdsCopyrightMsg(playerContainerId, html5PlayerWidth, html5PlayerHeight, "audio");
                return;
            }

        }

        if(typeof(videoData.hls_url.hls3)!="undefined" && (_0x1576[1]="\x63\x67\x6C\x35") && videoData.hls_url.hls3 && videoData.hls_url.hls3.indexOf("cctv?")!==-1 && (cdnName!=="LIVE-HLS-CDN-AK" && cdnName!=="LIVE-HLS-CDN-TTA")){
            if(cdnName !== "LIVE-HLS-CDN-TXY") {
                cdnName = "LIVE-HLS-CDN-ALI";
            }
            html5CdnStr = _0x1576[1] + html5Aauth;
        }


        if(cdnName !== "LIVE-HLS-CDN-ALI" && cdnName!=="LIVE-HLS-CDN-TXY" && cdnName !== "LIVE-HLS-CDN-BS" && cdnName !== "LIVE-HLS-CDN-KS" && cdnName !== "LIVE-HLS-CDN-AK" && cdnName !== "LIVE-HLS-CDN-TTA" && hls_vod_url.indexOf("AUTH=")!==-1 && hls_vod_url.indexOf("amode=1")!==-1) {


                var pageUrl = location.href;
                try{
                    pageUrl = deleteUrlPara(pageUrl, "vdn_data");
                    pageUrl = deleteUrlPara(pageUrl, "bauth");
                    pageUrl = deleteUrlPara(pageUrl, "btime");
                    pageUrl = deleteUrlPara(pageUrl, "vdn_last");
                } catch(e) {

                }


                hls_vod_url = encodeURIComponent(hls_vod_url);

                var vdn_data = {
                    "liveurl": hls_vod_url,
                    "hdsConvivaVdnSid": hdsConvivaVdnSid,
                    "hdsConvivaCdnInfo": hdsConvivaCdnInfo,
                    "cdnName": cdnName
                };

                vdn_data = JSON.stringify(vdn_data);
                if(pageUrl.indexOf("?") > 0) {
                    pageUrl += "&vdn_data=" + vdn_data;
                } else{
                    pageUrl += "?vdn_data=" + vdn_data;
                }

                pageUrl += "&vdn_last=" + Date.parse(new Date())/1000;

                location.href = pageUrl;
                return;

        }

        if(videoData && hls_vod_url) {
            if(cdnName === "LIVE-HLS-CDN-ALI"  || cdnName==="LIVE-HLS-CDN-TXY" || cdnName === "LIVE-HLS-CDN-BS" || cdnName === "LIVE-HLS-CDN-KS") {
                if(hls_vod_url.indexOf("amode=1") > 0){
                    setHtml5AliNewUrl();
                } else{
                    createHtml5Player(playerContainerId);
                    createPlayerElement();
                    html5InitEvent();

                    htmlPlayAFile();
                    if(navigator.userAgent.toLowerCase().indexOf("huawei")>0) {
                        document._html5Player.load();
                    }

                    if(useHdsGuoshuangMonitor) {
                        html5HdsGuoshuang = new HdsGuoshuangAnalytics();
                        setHdsGuoshuangInitData(document._html5Player.src);
                    }
                }

            } else if(cdnName === "LIVE-HLS-CDN-AK" || cdnName === "LIVE-HLS-CDN-TTA"){
                createHtml5Player(playerContainerId);
                createPlayerElement();
                html5InitEvent();

                htmlPlayAFile();
                if(navigator.userAgent.toLowerCase().indexOf("huawei")>0) {
                    document._html5Player.load();
                }

                if(useHdsGuoshuangMonitor) {
                    html5HdsGuoshuang = new HdsGuoshuangAnalytics();
                    setHdsGuoshuangInitData(document._html5Player.src);
                }
            } else if((hls_vod_url.indexOf("AUTH=") == -1) || hls_vod_url.indexOf("amode=1") == -1) {
                setHtml5VideoNewUrl(hls_vod_url);
            } else {
                checkHtml5Auth(true, "new_url", "http://h5.cntv.powzamedia.com/cntv/new_url");
            }
        }

    }

    function html5ParseJsonFromUrl(data) {
        var obj = eval('(' + data.replace(/(^\s*)|(\s*$)/g, "") + ')');
        hls_vod_url = decodeURIComponent(obj.liveurl);

        hdsConvivaVdnSid = obj.hdsConvivaVdnSid;
        hdsConvivaCdnInfo = obj.hdsConvivaCdnInfo
        cdnName = obj.cdnName;
        isFlvLivePublic = "1";

        try {
            if(isUseConvivaMonitor) {
                doLoadHtml5ConvivaJs();
            }

            doLoadHtml5AnalyticsJs("guoshuang", "jsLoader5", checkHdsGuoshuang);

            doLoadHtml5AnalyticsJs("shuguang", "jsLoader6", checkHdsShuguang);

            doLoadHtml5AnalyticsJs("cntv", "jsLoader7", checkHdsCntv);

        } catch(e) {}

        if((hls_vod_url.indexOf("AUTH=")==-1) || hls_vod_url.indexOf("amode=1")==-1) {
            setHtml5VideoNewUrl(hls_vod_url);
        } else{
            checkHtml5Auth(true, "new_url", "http://h5.cntv.powzamedia.com/cntv/new_url");
        }

        /*
         createHtml5Player(playerContainerId);
         createPlayerElement();
         html5InitEvent();

         htmlPlayAFile();
         if(navigator.userAgent.toLowerCase().indexOf("huawei")>0) {
         document._html5Player.load();
         }

         try {
         if(isUseConvivaMonitor) {
         doLoadHtml5ConvivaJs();
         }

         doLoadHtml5AnalyticsJs("guoshuang", "jsLoader5", checkHdsGuoshuang);

         doLoadHtml5AnalyticsJs("shuguang", "jsLoader6", checkHdsShuguang);

         } catch(e) {}

         if(useHdsGuoshuangMonitor) {
         html5HdsGuoshuang = new HdsGuoshuangAnalytics();
         setHdsGuoshuangInitData(document._html5Player.src);
         }
         */
    }



    function setHtml5VideoNewUrl(newUrl) {

        createHtml5Player(playerContainerId);
        createPlayerElement();
        html5InitEvent();

        if(newUrl === hls_vod_url) {
            htmlPlayAFile();
            if(navigator.userAgent.toLowerCase().indexOf("huawei")>0) {
                document._html5Player.load();
            }

            if(useHdsGuoshuangMonitor) {
                html5HdsGuoshuang = new HdsGuoshuangAnalytics();
                setHdsGuoshuangInitData(document._html5Player.src);
            }
        } else {
            hls_vod_url = newUrl;
            var _doc = document.getElementsByTagName("head")[0];
            var jsLoader12 = createElementByType("script", "convivaJs12", "absolute", "0px", "0px", "0px", "0px");
            jsLoader12.src = "http://h5.cntv.powzamedia.com/decipher171025d41d8cd98f00b204e9800998ecf8427e.js?r=" + Math.random();

            _doc.appendChild(jsLoader12);

            jsLoader12.onload = function() {
                if(typeof "decipher" !== "undefined") {
                    hls_vod_url = decipher(hls_vod_url);
                }

                htmlPlayAFile();
                if(navigator.userAgent.toLowerCase().indexOf("huawei")>0) {
                    document._html5Player.load();
                }
                if(useHdsGuoshuangMonitor) {
                    html5HdsGuoshuang = new HdsGuoshuangAnalytics();
                    setHdsGuoshuangInitData(document._html5Player.src);
                }
            };

            jsLoader12.onerror = function() {
                htmlPlayAFile();

                if(useHdsGuoshuangMonitor) {
                    html5HdsGuoshuang = new HdsGuoshuangAnalytics();
                    setHdsGuoshuangInitData(document._html5Player.src);
                }
            }

        }
    }

    function checkHtml5Auth(asyn, mod, url) {
        var xmlhttp;
        if(window.XMLHttpRequest) {
            xmlhttp = new XMLHttpRequest();
        } else {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }

        var sendData = "btime=" + hdsBtime + "&bauth=" + hdsBauth;
        if(mod === "new_url") {
            sendData += "&url=" + encodeURIComponent(hls_vod_url);
        }
        sendData += "&referer=" + encodeURIComponent(location.href);

        xmlhttp.onreadystatechange = function() {
            if(xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                /*console.log(url+":"+xmlhttp.responseText);*/

                var obj = JSON.parse(xmlhttp.responseText);
                var flag = obj.tag;
                if(flag != 1) {
                    html5AuthFlag = "0";
                }

                if(mod === "new_url") {
                    if(obj.new_url && html5AuthFlag === "1") {
                        setHtml5VideoNewUrl(obj.new_url);
                    } else {
                        html5HdsCopyrightMsg(playerContainerId, html5PlayerWidth, html5PlayerHeight, "auth","autherror:new_url");
                    }
                }
            }
        }

        xmlhttp.open("POST", url, asyn);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=utf-8");
        xmlhttp.send(sendData);
    }

    function html5HdsCopyrightMsg(mainDivId, _w, _h, type,errorMsg) {
        var baseDiv = document.getElementById(mainDivId);
        baseDiv.innerHTML = "";
        baseDiv.style.position = "relative";
        baseDiv.style.width = _w + "px";
        baseDiv.style.height = _h + "px";
        var appUrl = "http://download.cntv.cn/app/cbox/index.html";

        if(isH5HttpsLive) {
            appUrl = "https://download.cntv.cn/app/cbox/index.html";
        }

        var msg = "";
        var msgL = 0;
        var msgT = parseInt(_h / 2) - 8;
        var msgWidth = _w;
        msgL = parseInt(_w / 2) - 210;
        msg = "由于播出安排变更，暂时不提供该时段内容。";

        if(type === "auth") {
            msg = "对不起，认证没有通过，暂时无法播放此视频。";
            hls_vod_url = "";
            setConvivaMetadata(errorMsg);

        }else if(type === "copyright")	//public=0时
        {
            msgL = parseInt(_w/2) - 210;
            msg = "由于播出安排变更，暂时不提供该时段内容。";
        }
        else if(type === "audio")	//public=2时
        {
            msgL = parseInt(_w/2) - 210;
            msgT -= 30;
            msg = "由于播出安排， <br/> 仅提供该时段播出内容音频，敬请收听。";

        }else
        {
            /*msgL = parseInt(_w/2) - 288;
             msg = "由于节目播出安排，该视频无法播放。速下&nbsp;<a style='font-weight:bold;font-size:20px;border:0;color:#cc0000'  href='"+appUrl+"'>央视影音客户端</a>&nbsp;畅享世界杯海量视频";*/
        }

        msgWidth = _w - msgL - 30;

        baseDiv.style.backgroundColor = "#000";
        baseDiv.innerHTML = "<div style='position:absolute;border:0;font-size:16px;width:" + _w + "px;top:" + msgT + "px;text-align:center;color:#FFF;margin: 0px auto;padding-left:5px;'>" + msg + "<div>";

    }

    function showError(err) {
        var errorPanel = createElementByType("div", "errorPanel", "relative", "", "", "0px", "45%");
        errorPanel.style.color = "#FFFFFF";
        errorPanel.innerHTML = err;
        errorPanel.align = "center";
        try {
            document._baseDiv.appendChild(errorPanel);
        } catch(e) {}
    }

    function capture(event) {

        if(event.type == "playing") {
            if(!isLiveVideoPlaying) {
                isLiveVideoPlaying = true;
                clearInterval(playingTimer);
                playingTimer = setInterval(function() {
                    endPlayTime--;
                    if(endPlayTime <= 0) {
                        doJumpToAppPlayer(playerContainerId, html5PlayerWidth, html5PlayerHeight);
                    }

                }, 1000);
            }

            if(html5HdsGuoshuang && !html5HdsGuoshuang.isPlaying) {
                html5HdsGuoshuang.isPlaying = true;
                html5HdsGuoshuang.doPlaying();
            }
        }

        if(event.type == "play" && html5HdsGuoshuang && !html5HdsGuoshuang.played) {

            html5HdsGuoshuang.videoPlay.beginPreparing();
            html5HdsGuoshuang.videoPlay.endPreparing(true, html5HdsGuoshuang.metadata);
            html5HdsGuoshuang.played = true;
        }

        if(event.type == "ended" || event.type == "error") {
            doJumpToAppPlayer(playerContainerId, html5PlayerWidth, html5PlayerHeight);

            if(html5HdsGuoshuang) {
                html5HdsGuoshuang.isPlaying = false;
                html5HdsGuoshuang.doEnd();
            }
        }

        if(event.type == "pause") {
            isLiveVideoPlaying = false;
            clearInterval(playingTimer);

            if(html5HdsGuoshuang) {
                html5HdsGuoshuang.isPlaying = false;
                html5HdsGuoshuang.doPause();
            }
        }
    }

    function html5InitEvent() {
        for(key in media_events) {
            html5AddListener(document._html5Player, key, capture);
        }
    }

    function html5AddListener(obj, type, handler) {
        if(obj.attachEvent) {
            obj.attachEvent('on' + type, handler);
        } else if(obj.addEventListener) {
            obj.addEventListener(type, handler, false);
        }
    }

    function createHtml5Player(mainDivId) {
        //alert("createHtml5Player standard success")
        var baseDiv = document.getElementById(mainDivId);
        baseDiv.innerHTML = "";
        baseDiv.style.position = "relative";
        baseDiv.style.width = html5PlayerWidth + "px";
        baseDiv.style.height = html5PlayerHeight + "px";
        document._baseDiv = baseDiv;
        var html5VideoBack = createElementByType("div", "html5VideoBack", "absolute", html5PlayerWidth + "px", html5PlayerHeight + "px", "0px", "0px");
        //html5VideoBack.style.backgroundColor = "#000000";


        //设置背景图片
        var bgImg = "cctv_html5player_bg_16X9.png";
        if(html5PlayerHeight/html5PlayerWidth > 1) {
            bgImg = "cctv_html5player_bg_9X16.png";
        }

        if(isH5HttpsLive) {
            html5VideoBack.style.backgroundImage = "url('https://player.cntv.cn/html5Player/images/" + bgImg + "')";
        } else{
            html5VideoBack.style.backgroundImage = "url('http://player.cntv.cn/html5Player/images/" + bgImg + "')";
        }


        html5VideoBack.style.backgroundRepeat = "no-repeat";
        html5VideoBack.style.backgroundPosition = "0px 0px";
        html5VideoBack.style.backgroundSize = html5PlayerWidth+"px " + html5PlayerHeight + "px";

        document._baseDiv.appendChild(html5VideoBack);


        document._html5VideoBack = document.getElementById("html5VideoBack");

    }


    var _0x20dc=["\x4C\x49\x56\x45\x2D\x48\x4C\x53\x2D\x43\x44\x4E\x2D\x54\x58\x59","\x68\x74\x74\x70\x3A\x2F\x2F\x63\x63\x74\x76\x35\x2E\x74\x78\x74\x79\x2E\x35\x32\x31\x33\x2E\x6C\x69\x76\x65\x70\x6C\x61\x79\x2E\x6D\x79\x71\x63\x6C\x6F\x75\x64\x2E\x63\x6F\x6D\x2F\x6C\x69\x76\x65\x2F","\x5F\x74\x78\x74\x79\x2E\x6D\x33\x75\x38","\x75\x64\x6B\x32\x37\x76\x6E\x38\x6C\x64\x66\x33\x6C\x63\x76\x31\x73\x70","\x70\x61\x72\x73\x65","\x30","\x72\x61\x6E\x64\x6F\x6D","\x66\x6C\x6F\x6F\x72","\x2F\x63\x6E\x74\x76\x6C\x69\x76\x65\x2F","\x6D\x64\x2E\x6D\x33\x75\x38","\x2D","\x64\x6C\x39\x32\x66\x39\x63\x6A\x68\x33\x68\x38\x32\x76\x63\x36\x32\x6B\x78\x61\x6C\x69\x77\x6C\x31\x66","\x73\x75\x62\x73\x74\x72\x69\x6E\x67","\x68\x74\x74\x70\x3A\x2F\x2F\x68\x6C\x73\x32\x2E\x63\x6E\x74\x76\x2E\x6D\x79\x61\x6C\x69\x63\x64\x6E\x2E\x63\x6F\x6D","\x3F\x61\x75\x74\x68\x5F\x6B\x65\x79\x3D","\x68\x75\x61\x77\x65\x69","\x69\x6E\x64\x65\x78\x4F\x66","\x74\x6F\x4C\x6F\x77\x65\x72\x43\x61\x73\x65","\x75\x73\x65\x72\x41\x67\x65\x6E\x74","\x6C\x6F\x61\x64","\x5F\x68\x74\x6D\x6C\x35\x50\x6C\x61\x79\x65\x72","\x73\x72\x63"];function setHtml5AliNewUrl(){if(isHtml5Tengxun(ChannelID)){cdnName= _0x20dc[0];hls_vod_url= _0x20dc[1]+ ChannelID+ _0x20dc[2]}else {var _0xf204x2=_0x20dc[3];var _0xf204x3=Date[_0x20dc[4]]( new Date())/ 1000;var _0xf204x4=_0x20dc[5];var _0xf204x5=Math[_0x20dc[7]](Math[_0x20dc[6]]()* 1000);var _0xf204x6=_0x20dc[8]+ ChannelID+ _0x20dc[9];var _0xf204x7=setH5Str(_0xf204x6+ _0x20dc[10]+ _0xf204x3+ _0x20dc[10]+ _0xf204x5+ _0x20dc[10]+ _0xf204x4+ _0x20dc[10]+ _0x20dc[11][19]+ html5Aauth+ _0xf204x2[_0x20dc[12]](5,11)+ html5CdnStr);var _0xf204x8=_0xf204x3+ _0x20dc[10]+ _0xf204x5+ _0x20dc[10]+ _0xf204x4+ _0x20dc[10]+ _0xf204x7;hls_vod_url= _0x20dc[13]+ _0xf204x6+ _0x20dc[14]+ _0xf204x8};createHtml5Player(playerContainerId);createPlayerElement();html5InitEvent();htmlPlayAFile();if(navigator[_0x20dc[18]][_0x20dc[17]]()[_0x20dc[16]](_0x20dc[15])> 0){document[_0x20dc[20]][_0x20dc[19]]()};if(useHdsGuoshuangMonitor){html5HdsGuoshuang=  new HdsGuoshuangAnalytics();setHdsGuoshuangInitData(document[_0x20dc[20]][_0x20dc[21]])}};



    function isHtml5Tengxun(channel) {
        var flag = false;
        var channels = [];
        var len = channels.length;
        for(var i=0; i<len; i++) {
            if(channel === channels[i]) {
                flag = true;
                break;
            }
        }

        if(cdnName === "LIVE-HLS-CDN-TXY") {
            flag = true;
        }

        return flag;
    }

    function createPlayerElement() {

        var playerDiv = document.createElement("video");
        playerDiv.setAttribute("id", "html5Player");
        playerDiv.style.position = "absolute";
        playerDiv.style.zIndex = "1";
        playerDiv.style.width = html5PlayerWidth + "px";
        playerDiv.style.height = html5PlayerHeight + "px";

        playerDiv.setAttribute("webkit-playsinline", "");
        playerDiv.setAttribute("playsinline", "");
        playerDiv.setAttribute("x5-playsinline", "true");
        playerDiv.setAttribute("x-webkit-airplay", "isHtml5UseAirPlay");

        if(html5PosterImg.length > 3) {
            playerDiv.poster = html5PosterImg;
        }
        playerDiv.src = hls_vod_url;

        //playerDiv.controls = "controls";
        //playerDiv.setAttribute("autoplay", "autoplay");
        playerDiv.preload = "none";

        document._baseDiv.appendChild(playerDiv);
        document._html5Player = document.getElementById("html5Player");

        //修改移动端自带播放控制按钮
        playerDiv.controls = false;
        showSharePlayBtn();

        if(typeof showLiveShareMsg === "function") {
            showLiveShareMsg(document._baseDiv.getAttribute("id"), html5PlayerWidth, html5PlayerHeight);
        }

    }

    function showSharePlayBtn()
    {

        var playerWidth = document.getElementById("html5Player").style.width.replace("px","");
        var playerHeight = document.getElementById("html5Player").style.height.replace("px","");
        var sharePlayButton = document.createElement("div");
        sharePlayButton.setAttribute("id","playbtn_img");
        sharePlayButton.style.zIndex = "100";
        sharePlayButton.style.position = "absolute";
        sharePlayButton.style.width = "70px";
        sharePlayButton.style.height = "70px";
        sharePlayButton.style.opacity = "1";
        sharePlayButton.style.margin = "0px auto";


        if(isH5HttpsLive) {
            sharePlayButton.style.background = "url(https://player.cntv.cn/images/ipad/playBtnH5.png) no-repeat";
        } else{
            sharePlayButton.style.background = "url(http://player.cntv.cn/images/ipad/playBtnH5.png) no-repeat";
        }


        sharePlayButton.style.backgroundSize = "70px, 70px";
        sharePlayButton.style.textAlign = "center";
        sharePlayButton.style.left = parseInt(playerWidth/2) - 35 + "px";
        sharePlayButton.style.top = parseInt(playerHeight/2) - 35 + "px";

        document.getElementById("html5Player").removeAttribute("controls");
        sharePlayButton.addEventListener('click', onHtml5PlayerClick, false);

        document._baseDiv.appendChild(sharePlayButton);
        document.getElementById("html5Player").addEventListener('click', onHtml5PlayerClick, false);
    }

    function onHtml5PlayerClick(){

        var playbtnTag = document.getElementById("playbtn_img");

        //点击播放按钮创建session2017年11月7日16:36:57
        try {
            if(playbtnTag) {
                playbtnTag.parentNode.removeChild(playbtnTag);
            } else{
                return;
            }
            document.getElementById("html5Player").removeEventListener('click', onHtml5PlayerClick, false);

            if(isUseConvivaMonitor) {
                setConvivaMetadata(document.getElementById("html5Player").src, ChannelID); //启动conviva统计
            }

            if(useCntvMonitor) {
                setCntvMetadata();
            }

        } catch(e) {

        }
        document.getElementById("html5Player").controls = "controls";
        if(navigator.userAgent.toLowerCase().indexOf("huawei")===-1) {
            document.getElementById("html5Player").load();
        }
        document.getElementById("html5Player").play();


    }

    function createElementByType(type, _id, position, _w, _h, _l, _t) {
        var el = document.createElement(type);
        el.setAttribute("id", _id);
        el.style.position = position;
        el.style.width = _w;
        el.style.height = _h;
        el.style.left = _l;
        el.style.top = _t;
        return el;
    }

    var isfirst = true;

    function getAndroidVersion() {
        var version = "";
        var clientInfo = navigator.userAgent.toLowerCase();
        var pos = clientInfo.indexOf("android");
        if(pos > 0) {
            version = clientInfo.substr(pos + 7);
            version = parseInt(version);

            if(!version) {
                version = clientInfo.substr(pos + 8);
                version = parseInt(version);
            }
        }
        return version;

    }

    function htmlPlayAFile() {

        document._html5Player.src = hls_vod_url; // "http://cntv.soooner.com/flash/mp4video27/TMS/wuxi/2013/02/10/9c749d2433643ddd528fd8ab0a4e5c44_h264818000nero_aac32-1.mp4";

        if(!isfirst) {
            document._html5Player.load();
            document._html5Player.play();
        }
        isfirst = false;
    }

    function setHdsGuoshuangInitData(addr) {
        html5HdsGuoshuang.infoProvider = {
            getFramesPerSecond: function() {
                return 0;
            },
            getPosition: function() {
                return 0.00;
            },
            getBitRate: function() {
                return 0;
            }
        };

        html5HdsGuoshuang.metadata = {
            videoDuration: 0, //点播视频的总时长
            getFramesPerSecond: function() {
                return 0; //每秒的帧数
            },
            getBitRateKbps: function() {
                return 0; //码率
            },
            getIsBitRateChangeable: function() {
                return false; //码率是否可变
            }
        };

        addr = addr.indexOf("?") !== -1 ? addr.substr(0, addr.indexOf("?")) : addr;
        html5HdsGuoshuang.videoInfo.VideoOriginalName = VideoName;
        html5HdsGuoshuang.videoInfo.VideoName = VideoName;

        html5HdsGuoshuang.videoInfo.VideoUrl = addr;
        html5HdsGuoshuang.videoInfo.VideoID = VideoName;
        html5HdsGuoshuang.videoInfo.VideoTVChannel = ChannelID;
        html5HdsGuoshuang.videoInfo.VideoWebChannel = ChannelID;
        html5HdsGuoshuang.videoInfo.Cdn = cdnName;
    }

    function HdsGuoshuangAnalytics() {
        this.videoPlay = null;
        this.played = false;
        this.isPlaying = false;
        this.infoProvider = {
            getFramesPerSecond: function() { return ""; },
            getPosition: function() {
                return ""
            },
            getBitRate: function() {
                return "";
            }
        };

        this.videoInfo = {
            VideoID: ChannelID,
            VideoOriginalName: "",
            VideoName: "",
            VideoUrl: "",
            VideoTag: "",
            VideoTVChannel: "",
            VideoWebChannel: "",
            VideoFocus: "",
            VideoParent: "",
            Cdn: "",
            extendProperty1: "HTML5",
            extendProperty2: "20170113" //没有的话传更新日期
        };

        this.metadata = {
            videoDuration: 20, //点播视频的总时长
            getFramesPerSecond: function() {
                return 25; //每秒的帧数
            },
            getBitRateKbps: function() {
                return 450; //码率
            },
            getIsBitRateChangeable: function() {
                return true; //码率是否可变
            }
        };

        this.doStart = function() {
            var track = null;
            if(getQueryString("fromapp") === "cctvnews") {
                track = new GridsumVideoDissector("GVD-200094", "GSD-200094");
            } else {
                track = new GridsumVideoDissector("GVD-200084", "GSD-200084");
            }

            try {

                if(typeof(sns_userid) == "undefined") {
                    sns_userid = window.parent.sns_userid;
                    sns_islogin = window.parent.passport.isLoginedStatus().toString();
                } else {
                    sns_islogin = passport.isLoginedStatus().toString();
                }

                if(sns_userid == null) {
                    sns_userid = "";
                }

            } catch(e) {
                sns_userid = "";
                sns_islogin = "false";
            }
            if(sns_islogin == "true" && sns_userid) {
                track.setUserId(sns_userid);
            }
            track.setPlatform('Html5');
            this.videoPlay = track.newLivePlay(this.videoInfo, this.infoProvider); //如果是点播播放，通过track.newVodPlay方法进行初始化

            /*
             this.videoPlay.beginPreparing();
             this.videoPlay.endPreparing(true, this.metadata);
             this.played = true;
             */
        };

        this.doPlaying = function() {
            if(this.played) {
                this.videoPlay.onStateChanged("playing");
                this.videoPlay.onStateChanged("playing");
            }
        };

        this.doPause = function() {
            if(this.played) {
                this.videoPlay.onStateChanged("paused");
            }
        };

        this.doEnd = function() {
            if(this.played) {
                this.videoPlay.endPlay();
            }
        };
    }

    function checkHdsGuoshuang() {
        var timer = null;
        timer = setInterval(function() {
            if(html5HdsGuoshuang && html5HdsGuoshuang.videoInfo.VideoUrl) {
                clearInterval(timer);
                html5HdsGuoshuang.doStart();
            }
        }, 300);

    }

    function doLoadHtml5AnalyticsJs(from, jsId, callback) {
        var jsUrl = "";
        var isLoaded = false;
        if(from === "shuguang") {
            jsUrl = shuguangJs;
            isLoaded = useHdsShuguangMonitor;
        } else if(from === "guoshuang") {
            jsUrl = guoshuangJs;
            isLoaded = useHdsGuoshuangMonitor;
        } else if(from === "cntv") {
            jsUrl = cntvMonitorJs;
            isLoaded = useCntvMonitor;
        } else {
            jsUrl = hdsConvivaJs;
            isLoaded = hdsUseCovivaMonitor;
        }

        if(isLoaded) {
            var jsLoader5 = createElementByType("script", jsId, "absolute", "0px", "0px", "0px", "0px");
            jsLoader5.src = jsUrl;

            var _doc = document.getElementsByTagName('head')[0];
            _doc.appendChild(jsLoader5);

            jsLoader5.onload = function() {
                callback();
            };

            jsLoader5.onreadystatechange = function() {
                if(jsLoader5.readyState == 'loaded' || jsLoader5.readyState == 'complete') {
                    callback();
                }
            }
        }

    }

    function checkHdsCntv() {

    }

    function checkHdsShuguang() {
        var timer = null;
        timer = setInterval(function() {
            if(typeof(musesagent) != "undefined" && musesagent && hls_vod_url && playerContainerId) {
                clearInterval(timer);
                initHdsMusesPlugin();
            }

        }, 300);

    }

    function initHdsMusesPlugin() {
        var agent = new musesagent(playerContainerId);

        agent.playtype("lvpl");
        agent.dataSource("html5Player");
        agent.vName(VideoName);
        if(/(android)/i.test(navigator.userAgent) && getAndroidVersion() < 4) {
            agent.u(rtsp_vod_url);
        } else {
            agent.u(hls_vod_url);
        }
        agent.vp("GVD-200084");
        agent.vWebChannel(ChannelID);
        agent.cdn(cdnName);
        agent.vlength(1);
    }

    function doLoadHtml5ConvivaJs() {

        var jsLoader = createElementByType("script", "convivaJs1", "absolute", "0px", "0px", "0px", "0px");
        jsLoader.src = ConvivaImplJs;

        var _doc = document.getElementsByTagName('head')[0];
        _doc.appendChild(jsLoader);

        var jsLoader9 = createElementByType("script", "convivaJs2", "absolute", "0px", "0px", "0px", "0px");
        jsLoader9.src = ConvivaLibarylJs;

        _doc.appendChild(jsLoader9);

        jsLoader9.onload = function() {
            checkHdsConviva();
        };

        jsLoader9.onreadystatechange = function() {
            if(jsLoader9.readyState == 'loaded' || jsLoader9.readyState == 'complete') {
                checkHdsConviva();
            }
        }
    }


    function setCntvMetadata(msgType, errorMsg) {
        var videoId = "";
        var videoData = null;
        var urlSplit = "";
        if(msgType=="690003") {

            videoData = {
                v_id: ChannelID,
                channel: ChannelID,
                ver: cntvMonitorVersion,
                applicationName: "CNTV_HTML5_PLAYER",
                playerName: "live_share",
                streamType: "live",
                assetName: ChannelID,
                streamUrl: "",
                playAMR: "F",
                streamMBR: "1",
                bit: "500",
                streamProtocol: "HLS",
                referURL: encodeURIComponent(location.href.substr(0, 127)),
                videoProfile: "vdn",
                error_code: msgType,
                error_info: errorMsg
            };

            urlSplit = location.href.split("/");
            if(urlSplit.length > 1 && typeof(goldlog.initSession) != "undefined") {
                videoData.site = encodeURIComponent(urlSplit[2]);
            }

            goldlog.initSession(videoId, videoData);

        } else{

            var checkTimeout = 0;
            var checkSessionTimer = setInterval(function (){
                checkTimeout++;

                if(checkTimeout > 50){
                    clearInterval(checkSessionTimer);
                }

                if(typeof(goldlog.startSession) != "undefined") {

                    clearInterval(checkSessionTimer);
                    videoId = "html5Player";

                    videoData = {
                        v_id: ChannelID,
                        channel: ChannelID,
                        ver: cntvMonitorVersion,
                        applicationName: "CNTV_HTML5_PLAYER",
                        playerName: "live_share",
                        streamType: "live",
                        assetName: ChannelID,
                        streamUrl: encodeURIComponent(hls_vod_url),
                        playAMR: "F",
                        streamMBR: "1",
                        bit: "500",
                        streamProtocol: "HLS",
                        referURL: encodeURIComponent(location.href.substr(0, 127)),
                        cdnCode: cdnName,
                        videoProfile: "vdn",
                        vdnSID: hdsConvivaVdnSid,
                        vdnIP: hdsConvivaCdnInfo.vdnIP,
                        vdnCountryCode: hdsConvivaCdnInfo.vdnCountryCode,
                        vdnProvinceCode: hdsConvivaCdnInfo.vdnProvinceCode,
                        vdnCityCode: hdsConvivaCdnInfo.vdnCityCode,
                        vdnISPCode: hdsConvivaCdnInfo.vdnISPCode,
                        public: isFlvLivePublic

                    };


                    urlSplit = location.href.split("/");
                    if(urlSplit.length > 1)
                    {
                        videoData.site = encodeURIComponent(urlSplit[2]);
                    }

                    if(msgType == "init") {

                        goldlog.initSession(videoId, videoData);
                    } else{
                        goldlog.startSession(videoId, videoData, 20);
                    }

                }
            }, 200);

        }





    }


    //调用创建session方法
    function setConvivaMetadata(errorMsg) {
        var checkTimeout = 0;
        var checkSessionTimer = setInterval(function() {
            checkTimeout++;
            if(convivaClient && convivaPlayerStateManager) {
                clearInterval(checkSessionTimer);
                //Create metadata
                var contentMetadata = new Conviva.ContentMetadata();
                contentMetadata.assetName = ChannelID;
                contentMetadata.streamUrl = hls_vod_url;
                contentMetadata.streamType = Conviva.ContentMetadata.StreamType.LIVE;
                contentMetadata.defaultBitrateKbps = Math.floor(500); // in Kbps
                if(isFlvLivePublic === "2") {
                    contentMetadata.applicationName = "CNTV_HTML5_AUDIO_PLAYER";
                } else{
                    contentMetadata.applicationName = "CNTV_HTML5_PLAYER";
                }

                contentMetadata.defaultResource = cdnName;

                if(typeof(userid) != "undefined" && typeof(userid) == "string") {
                    contentMetadata.viewerId = userid;
                } else{
                    contentMetadata.viewerId = getCookie_vdn("Fingerprint") ? getCookie_vdn("Fingerprint"):"";
                }

                var tags = {};

                tags.cdnCode = cdnName;

                tags.playScene = "HTML5";
                tags.appName = "WEB.HTML5";

                tags.channel = ChannelID;
                tags.contentId = ChannelID;

                var urlSplit = location.href.split("/");
                if(urlSplit.length > 1) {
                    tags.site = urlSplit[2];
                }

                if(/(android)/i.test(navigator.userAgent) && getAndroidVersion() < 4) {
                    tags.streamProtocol = "RTMP";
                } else {
                    tags.streamProtocol = "HLS";
                }
                tags.playerVendor = "Internal";
                tags.playerVersion = "2019.03.11.01";
                tags.referURL = location.href.substr(0, 127);
                tags.videoProfileType = "VDN";
                tags.P2PStyle = "F";
                tags.hasAds = "F";

                tags.streamMBR = "1";
                tags.playAMR = "F";

                if(hdsIsNormalVideo) {
                    tags.normalVideo = "T";
                } else {
                    tags.normalVideo = "F";
                }

                tags.vdnSID = hdsConvivaVdnSid;
                tags.vdnIP = hdsConvivaCdnInfo.vdnIP;
                tags.vdnCountryCode = hdsConvivaCdnInfo.vdnCountryCode;
                tags.vdnProvinceCode = hdsConvivaCdnInfo.vdnProvinceCode;
                tags.vdnCityCode = hdsConvivaCdnInfo.vdnCityCode;
                tags.vdnISPCode = hdsConvivaCdnInfo.vdnISPCode;
                tags.playerAlterName = "live_share";

                contentMetadata.custom = tags;

                var videoElement = document._html5Player;

                // Create a Conviva monitoring session.
                convivaSessionKey = convivaClient.createSession(contentMetadata);
                //vdn请求失败后的报错
                if(!hls_vod_url) {
                    convivaClient.reportError(
                        convivaSessionKey,
                        errorMsg?errorMsg:"VDN_REQUEST_FAILED",
                        Conviva.Client.ErrorSeverity.FATAL
                    );
                    convivaClient.cleanupSession(convivaSessionKey);
                } else {
                    var html5PlayerInterface = new Html5PlayerInterface(convivaPlayerStateManager, videoElement);
                }

                // sessionKey was obtained as shown above
                convivaClient.attachPlayer(convivaSessionKey, convivaPlayerStateManager);

                videoElement.addEventListener('error', function() {
                    cleanupSession();
                });
                videoElement.addEventListener('ended', function() {
                    cleanupSession();
                });

                function cleanupSession() {
                    convivaClient.cleanupSession(convivaSessionKey);
                }
            }

            if(checkTimeout > 50) {
                clearInterval(checkSessionTimer);
            }

        }, 200);
    }

    //移除session
    function createHtml5ConvivaEvent() {
        //alert("移除session")
        var voice = "no";
        if(isFlvLivePublic === "2"){
            voice = "yes";
        }
        var eventAttributes = {
            "assetName": ChannelID,
            "device": "[WEB.HTML5].[HTML5].[2019.03.11.01]",
            "client": "[" + hdsConvivaCdnInfo.vdnISPCode + "].[" + hdsConvivaCdnInfo.vdnCityCode + "].[" + hdsConvivaCdnInfo.vdnProvinceCode + "].[" + hdsConvivaCdnInfo.vdnCountryCode + "].[" + hdsConvivaCdnInfo.vdnIP + "]",
            "voice": voice
        };
        var checkTimer = setInterval(function (){
            if(convivaClient && typeof(Conviva)!="undefined") {
                clearInterval(checkTimer);
                convivaClient.sendCustomEvent(Conviva.Client.NO_SESSION_KEY, "NO_COPYRIGHT_EVENT", eventAttributes);
            }
        }, 50);

    }

    function checkHdsConviva() {
        var jsLoadTimeout = 0;

        var checkTimer = setInterval(function() {
            jsLoadTimeout++;
            try {

                var systemSettings = new Conviva.SystemSettings();
                var systemInterface = new Html5SystemInterfaceFactory().build();
                var systemFactory = new Conviva.SystemFactory(systemInterface, systemSettings);

                //Customer integration CUSTOMER_KEY
                var CUSTOMER_KEY = "03798c7108aa9ad57f419fa2a1c7e155f38a6343";
                var clientSettings = new Conviva.ClientSettings(CUSTOMER_KEY);
                //clientSettings.gatewayUrl = "";
                convivaClient = new Conviva.Client(clientSettings, systemFactory);
                convivaPlayerStateManager = convivaClient.getPlayerStateManager();
                clearInterval(checkTimer);
            } catch(e) {
                if(jsLoadTimeout > 50) {
                    clearInterval(checkTimer);
                }

            }
        }, 200);
    }

}

//动态加载fingerprint2.js
function getfingerprint2() {
    var _doc = document.getElementsByTagName("head")[0];
    var jsLoader = createElementByType("script", "jsFingerLoader", "absolute", "0px", "0px", "0px", "0px");


    if(isH5HttpsLive) {
        jsLoader.src = "https://js.player.cntv.cn/creator/fingerprint2.js";
    } else{
        jsLoader.src = "http://js.player.cntv.cn/creator/fingerprint2.js";
    }


    //jsLoader.src = "js/fingerprint2.js";
    _doc.appendChild(jsLoader);
    if(typeof jsLoader.onload != "undefined") {
        jsLoader.onload = function() {
            getFingerprint();
        };
    }

    if(typeof jsLoader.onreadystatechange != "undefined") {
        jsLoader.onreadystatechange = function() {
            if(jsLoader.readyState == 'loaded' || jsLoader.readyState == 'complete') {
                getFingerprint();
            }
        };
    }
}

//设置cookie    2017年7月28日16:11:42
function setCookie_vdn(key,value,day){
    if(day){
        var d = new Date();
        d.setTime(d.getTime() + day*24*60*60*1000);
        document.cookie=key + "=" + value + ";expires=" + d.toGMTString();
    }else{
        document.cookie=key + "=" + value;
    }

    try{
        if(window.localStorage) {
            localStorage.setItem(key, value);
        }
    } catch (e){
    }

}
//删除cookie
function removeCookie_vdn(key) {
    setCookie_vdn(key, "", -1);
}
//获取cookie方法
function getCookie_vdn( key ){

    var v = "";
    //判断是否含有cookie ，有cookie 就获取出来
    if( document.cookie ){
        var str = document.cookie;//获取cookie信息   键1=值1; 键2=值1; 键3=值3;
        var arr = str.split("; ");//将cookie文件按照 ;   拆成数组
        for(var i = 0 ; i <arr.length ; i++){
            var  item = arr[i].split("=");// 将数组中的每一个字符串通过=拆成一个小数组 [键1,值1]
            //判断小数组中 根据已知的键  下标为 [0] 为已知键，找到对应的值
            if(item[0] == key){
                v = item[1].toString();//将key对应的值返回此处返回的为字符串 将return JSON.parse(item[1])
                break;
            }
        }

    }
    v += "";

    try{
        if((!v ||v.length<20) && window.localStorage) {
            v = localStorage[key] ? localStorage[key] : "";
        }
    } catch (e) {
        v = "";
    }

    //如果没有cookie ，返回一个空数组
    return v;
}

!function(a){"use strict";function b(a,b){var c=(65535&a)+(65535&b),d=(a>>16)+(b>>16)+(c>>16);return d<<16|65535&c}function c(a,b){return a<<b|a>>>32-b}function d(a,d,e,f,g,h){return b(c(b(b(d,a),b(f,h)),g),e)}function e(a,b,c,e,f,g,h){return d(b&c|~b&e,a,b,f,g,h)}function f(a,b,c,e,f,g,h){return d(b&e|c&~e,a,b,f,g,h)}function g(a,b,c,e,f,g,h){return d(b^c^e,a,b,f,g,h)}function h(a,b,c,e,f,g,h){return d(c^(b|~e),a,b,f,g,h)}function i(a,c){a[c>>5]|=128<<c%32,a[(c+64>>>9<<4)+14]=c;var d,i,j,k,l,m=1732584193,n=-271733879,o=-1732584194,p=271733878;for(d=0;d<a.length;d+=16)i=m,j=n,k=o,l=p,m=e(m,n,o,p,a[d],7,-680876936),p=e(p,m,n,o,a[d+1],12,-389564586),o=e(o,p,m,n,a[d+2],17,606105819),n=e(n,o,p,m,a[d+3],22,-1044525330),m=e(m,n,o,p,a[d+4],7,-176418897),p=e(p,m,n,o,a[d+5],12,1200080426),o=e(o,p,m,n,a[d+6],17,-1473231341),n=e(n,o,p,m,a[d+7],22,-45705983),m=e(m,n,o,p,a[d+8],7,1770035416),p=e(p,m,n,o,a[d+9],12,-1958414417),o=e(o,p,m,n,a[d+10],17,-42063),n=e(n,o,p,m,a[d+11],22,-1990404162),m=e(m,n,o,p,a[d+12],7,1804603682),p=e(p,m,n,o,a[d+13],12,-40341101),o=e(o,p,m,n,a[d+14],17,-1502002290),n=e(n,o,p,m,a[d+15],22,1236535329),m=f(m,n,o,p,a[d+1],5,-165796510),p=f(p,m,n,o,a[d+6],9,-1069501632),o=f(o,p,m,n,a[d+11],14,643717713),n=f(n,o,p,m,a[d],20,-373897302),m=f(m,n,o,p,a[d+5],5,-701558691),p=f(p,m,n,o,a[d+10],9,38016083),o=f(o,p,m,n,a[d+15],14,-660478335),n=f(n,o,p,m,a[d+4],20,-405537848),m=f(m,n,o,p,a[d+9],5,568446438),p=f(p,m,n,o,a[d+14],9,-1019803690),o=f(o,p,m,n,a[d+3],14,-187363961),n=f(n,o,p,m,a[d+8],20,1163531501),m=f(m,n,o,p,a[d+13],5,-1444681467),p=f(p,m,n,o,a[d+2],9,-51403784),o=f(o,p,m,n,a[d+7],14,1735328473),n=f(n,o,p,m,a[d+12],20,-1926607734),m=g(m,n,o,p,a[d+5],4,-378558),p=g(p,m,n,o,a[d+8],11,-2022574463),o=g(o,p,m,n,a[d+11],16,1839030562),n=g(n,o,p,m,a[d+14],23,-35309556),m=g(m,n,o,p,a[d+1],4,-1530992060),p=g(p,m,n,o,a[d+4],11,1272893353),o=g(o,p,m,n,a[d+7],16,-155497632),n=g(n,o,p,m,a[d+10],23,-1094730640),m=g(m,n,o,p,a[d+13],4,681279174),p=g(p,m,n,o,a[d],11,-358537222),o=g(o,p,m,n,a[d+3],16,-722521979),n=g(n,o,p,m,a[d+6],23,76029189),m=g(m,n,o,p,a[d+9],4,-640364487),p=g(p,m,n,o,a[d+12],11,-421815835),o=g(o,p,m,n,a[d+15],16,530742520),n=g(n,o,p,m,a[d+2],23,-995338651),m=h(m,n,o,p,a[d],6,-198630844),p=h(p,m,n,o,a[d+7],10,1126891415),o=h(o,p,m,n,a[d+14],15,-1416354905),n=h(n,o,p,m,a[d+5],21,-57434055),m=h(m,n,o,p,a[d+12],6,1700485571),p=h(p,m,n,o,a[d+3],10,-1894986606),o=h(o,p,m,n,a[d+10],15,-1051523),n=h(n,o,p,m,a[d+1],21,-2054922799),m=h(m,n,o,p,a[d+8],6,1873313359),p=h(p,m,n,o,a[d+15],10,-30611744),o=h(o,p,m,n,a[d+6],15,-1560198380),n=h(n,o,p,m,a[d+13],21,1309151649),m=h(m,n,o,p,a[d+4],6,-145523070),p=h(p,m,n,o,a[d+11],10,-1120210379),o=h(o,p,m,n,a[d+2],15,718787259),n=h(n,o,p,m,a[d+9],21,-343485551),m=b(m,i),n=b(n,j),o=b(o,k),p=b(p,l);return[m,n,o,p]}function j(a){var b,c="";for(b=0;b<32*a.length;b+=8)c+=String.fromCharCode(a[b>>5]>>>b%32&255);return c}function k(a){var b,c=[];for(c[(a.length>>2)-1]=void 0,b=0;b<c.length;b+=1)c[b]=0;for(b=0;b<8*a.length;b+=8)c[b>>5]|=(255&a.charCodeAt(b/8))<<b%32;return c}function l(a){return j(i(k(a),8*a.length))}function m(a,b){var c,d,e=k(a),f=[],g=[];for(f[15]=g[15]=void 0,e.length>16&&(e=i(e,8*a.length)),c=0;16>c;c+=1)f[c]=909522486^e[c],g[c]=1549556828^e[c];return d=i(f.concat(k(b)),512+8*b.length),j(i(g.concat(d),640))}function n(a){var b,c,d="0123456789abcdef",e="";for(c=0;c<a.length;c+=1)b=a.charCodeAt(c),e+=d.charAt(b>>>4&15)+d.charAt(15&b);return e}function o(a){return unescape(encodeURIComponent(a))}function p(a){return l(o(a))}function q(a){return n(p(a))}function r(a,b){return m(o(a),o(b))}function s(a,b){return n(r(a,b))}function t(a,b,c){return b?c?r(b,a):s(b,a):c?p(a):q(a)}"function"==typeof define&&define.amd?define(function(){return t}):a.setH5Str=t}(this);

//定义指纹信息在cookie中的key值
function getFingerprint() {
    var fp = new Fingerprint2();
    fp.get(function(result) {
        setCookie_vdn("Fingerprint", result.toUpperCase(), 7);
    });
}

function createElementByType(type, _id, position, _w, _h, _l, _t) {
    var el = document.createElement(type);
    el.setAttribute("id", _id);
    el.style.position = position;
    el.style.width = _w;
    el.style.height = _h;
    el.style.left = _l;
    el.style.top = _t;
    return el;
}



function deleteUrlPara(url, ref){
    //alert(ref + ":" +url)
    var str = "";
    if (url.indexOf('?') != -1) {
        str = url.substr(url.indexOf('?') + 1);
    }
    else {
        return url;
    }
    var arr = "";
    var returnurl = "";
    var setparam = "";
    if (str.indexOf('&') != -1) {
        arr = str.split('&');
        for (i in arr) {
            if (arr[i].split('=')[0] != ref) {
                returnurl = returnurl + arr[i].split('=')[0] + "=" + arr[i].split('=')[1] + "&";
            }
        }
        return url.substr(0, url.indexOf('?')) + "?" + returnurl.substr(0, returnurl.length - 1);
    }
    else {
        arr = str.split('=');
        if (arr[0] == ref) {
            return url.substr(0, url.indexOf('?'));
        }
        else {
            return url;
        }
    }

}

function resizePlayerWhenOrientation(dir) {

    _player_width = document.body.clientWidth || window.innerWidth;
    if(document.getElementById("html5Player")) {
        if(dir == 1) {
            _player_height = parseInt(_player_width * 0.56);

        } else {
            if(/(Android)/i.test(navigator.userAgent)) {
                _player_height = window.innerHeight || window.screen.availHeight;
            } else {
                _player_height = window.innerHeight || window.screen.availWidth;
            }
            _player_height -= 10;
        }

        _player_width = parseInt(_player_width);
        _player_height = parseInt(_player_height);
        document.getElementById("flash_video").style.width = _player_width + "px";
        document.getElementById("flash_video").style.height = _player_height + "px";
        document.getElementById("html5VideoBack").style.width = _player_width + "px";
        document.getElementById("html5VideoBack").style.height = _player_height + "px";
        document._html5Player.style.width = _player_width + "px";
        document._html5Player.style.height = _player_height + "px";

    }

}

//判断手机横竖屏状态：
window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", function() {

    if(!isFullCreenWidth || !isFullCreenWhenOrientation) {
        return;
    }

    if(window.orientation === 180 || window.orientation === 0) {
        if(/(Android)/i.test(navigator.userAgent)) {
            setTimeout(function() {
                resizePlayerWhenOrientation(1);
            }, 100);
        } else {
            resizePlayerWhenOrientation(1);
        }

    }
    if(window.orientation === 90 || window.orientation === -90) {
        if(/(Android)/i.test(navigator.userAgent)) {
            setTimeout(function() {
                resizePlayerWhenOrientation(2);
            }, 100);
        } else {
            resizePlayerWhenOrientation(2);
        }
        requestFullScreen();

    }

}, false);

function requestFullScreen() {
    var element = document.getElementById("flash_video");
    var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;
    if(requestMethod) {
        requestMethod.call(element);
    } else if(typeof window.ActiveXObject !== "undefined") {
        var wscript = new ActiveXObject("WScript.Shell");
        if(wscript !== null) {
            wscript.SendKeys("{F11}");
        }
    }
}