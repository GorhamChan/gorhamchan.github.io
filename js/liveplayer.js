/*
*
*/

var livePlayerObjs = {};
livePlayerObjs.liveRetryTimeout = 60;
livePlayerObjs.fingerprintJsIsStarted = false;
var isFlashPlayer = true;

var liveConvivaClient = null;
var liveConvivaPlayerStateManager = null;
var isUseConvivaMonitor = true;
var isConvivaApiLoaded = false;
var systemFactory = null;

var isUseAliMonitor = true;
var isAliApiLoaded = false;
var isLiveControlsLoaded = false;
var Module;



var isMobleUseBrowserUi = false;
if(isIPad()) {
    //isMobleUseBrowserUi = true;
}

function createLivePlayer(paras) {
    var container = document.getElementById(paras.divId);


    if(location.href.indexOf("https://")!==-1) {
        paras.isHttps = "true";
        livePlayerObjs.isHttps = "true";
    }



    paras.w += "";
    paras.h += "";

    livePlayerObjs[paras.divId] = {};

    livePlayerObjs[paras.divId] = paras;



    if(paras.w.indexOf("%")>0) {
        container.style.width = paras.w;
    } else{
        container.style.width = paras.w + "px";
    }

    if(paras.h.indexOf("%")>0) {
        container.style.height = paras.h;
    } else{
        container.style.height = paras.h + "px";
    }


    //获取cookie并传递指纹信息
    var Fingerprint = "";
    if(!getCookie_vdn("Fingerprint") && !livePlayerObjs.fingerprintJsIsStarted){
        //获取设备指纹信息
        getfingerprint2();
    } else{
        Fingerprint = getCookie_vdn("Fingerprint");
    }

    livePlayerObjs.fingerprintJsIsStarted = true;





    if(paras.playerType==="hw" && isWasmSupported() && (isLiveHlsJsSupported() && !/(iphone|ipad)/i.test(navigator.userAgent)) && navigator.userAgent.indexOf("rv:11")===-1&&navigator.userAgent.indexOf("MSIE")===-1) {
        //设置播放器的背景图片
        var bgImg = "cctv_html5player_bg_16X9.png";
        if(paras.h/paras.w > 1) {
            bgImg = "cctv_html5player_bg_9X16.png";
        }
        livePlayerObjs[paras.divId].isLive = true;
        livePlayerObjs[paras.divId].isOldH5player = false;



        var container = document.getElementById(paras.divId);
        var convivaJsApi1 = "http://js.player.cntv.cn/creator/conviva-core-sdk.min.js";
        var convivaJsApi2 = "http://js.player.cntv.cn/creator/conviva-html5native-impl2.js";
        var aliApiUrl = "http://js.player.cntv.cn/creator/html5player_analysis_lib.js";
        var workerUrl = "http://js.player.cntv.cn/creator/h5.worker?v=190917";
        //livePlayerObjs[paras.divId].adCalls = "http://galaxy.bjcathay.com/s?z=cathay&c=1290,1291,1292&op=7&cb=parseLiveAdCallsDataFromApi";
        if(paras.isHttps === "true") {
            container.style.backgroundImage = "url('https://player.cntv.cn/html5Player/images/" + bgImg + "')";
            //livePlayerObjs[paras.divId].adCalls = "https://galaxy.bjcathay.com/s?z=cathay&c=1290,1291,1292&op=7&cb=parseLiveAdCallsDataFromApi";
            convivaJsApi1 = "https://js.player.cntv.cn/creator/conviva-core-sdk.min.js";
            convivaJsApi2 = "https://js.player.cntv.cn/creator/conviva-html5native-impl2.js";
            aliApiUrl = "https://js.player.cntv.cn/creator/html5player_analysis_lib.js";
            workerUrl = "https://js.player.cntv.cn/creator/h5.worker?v=190917";
            container.style.backgroundImage = "url('https://player.cntv.cn/html5Player/images/" + bgImg + "')";

        } else{
            container.style.backgroundImage = "url('https://player.cntv.cn/html5Player/images/" + bgImg + "')";
        }




        container.style.backgroundSize = "100% 100%";
        container.style.backgroundRepeat = "no-repeat";
        container.style.backgroundPosition = "0px 0px";
        container.style.margin = "0 auto";
        //container.style.position = "relative";

        if(livePlayerObjs[paras.divId].video && livePlayerObjs[paras.divId].video.hls || livePlayerObjs[paras.divId].adCallsVideo) {
            destroyH5LiveHls(paras);
        }

        if(livePlayerObjs[paras.divId].video) {
            clearInterval(livePlayerObjs[paras.divId].video.playedTimer);
        }


        if(typeof goldlog!="undefined" && goldlog["h5player_"+paras.divId] && typeof heartbeatStarted!=="undefined") {
            heartbeatStarted = false;
        }

        livePlayerObjs[paras.divId].video = {};
        livePlayerObjs[paras.divId].adCallsVideo = {};


        if(document.getElementById("h5player_"+paras.divId)) {
            removeH5LivePlayerEvents(paras.divId);
            if(isCanvasSupported(paras.divId)) {
                document.body.removeChild(document.getElementById("h5player_"+paras.divId));
                clearInterval(livePlayerObjs[paras.divId].canvasDrawTimer);
            } else{
                container.removeChild(document.getElementById("h5player_"+paras.divId));
            }

            clearInterval(livePlayerObjs[paras.divId].canvasDrawTimer);

        }


        if(liveConvivaClient && liveConvivaClient.cleanupSession && livePlayerObjs[paras.divId].convivaSessionKey!==undefined) {
            liveConvivaClient.cleanupSession(livePlayerObjs[paras.divId].convivaSessionKey);
            livePlayerObjs[paras.divId].convivaSessionKey = undefined;
        }

        container.innerHTML = "";

        if(paras.posterImg && paras.posterImg.length>3 || paras.isAutoPlay==="false") {
            showLivePlayerPosterImg(paras);
            return;
        }

        if(isIPad()) {
            container.innerHTML += '<style> .videoNoTimeline::-webkit-media-controls{display: none !important;}     </style>';
        }



        createLiveVideoLoadingImg(paras);

        //对借口文档的新字段进行初始化；
        var vdn_tsp =new Date().getTime().toString().slice(0,10);
        var vdn_vnFlash = "1537";										//澶缃戦〉FlashV1.0--No1
        var staticCheck_Flash = "B4B51E8523157ED8D17ADB76041BCD09";
        var vdn_vnHtml5 = "2049";										//澶缃戦〉Html5V1.0--No1
        var staticCheck_Html5 = "47899B86370B879139C08EA3B5E88267";
        var vdn_vc = "";
        var vdn_uid = "";
        var vdn_wlan = "";
        var Fingerprint = "";//定义设备指纹信息的key值

        if(!getCookie_vdn("Fingerprint") && !livePlayerObjs.fingerprintJsIsStarted){
            //获取设备指纹信息
            getfingerprint2();
        } else{
            vdn_uid = getCookie_vdn("Fingerprint");
        }


        var _doc = document.getElementsByTagName("head")[0];
        var jsLoader = createElementByType("script","hdsJsLoader","absolute","0px","0px","0px","0px");
        var vdnUrl = "http://vdn.live.cntv.cn/api2/liveHtml5.do?channel=pw://cctv_p2p_hd" + paras.t ;

        if(paras.isHttps === "true") {
            vdnUrl = "https://vdn.live.cntv.cn/api2/liveHtml5.do?channel=pw://cctv_p2p_hd" + paras.t ;
        }



        if(isIPad()) {
            vdn_vc = setH5Str((vdn_tsp+vdn_vnHtml5+staticCheck_Html5+vdn_uid)).toLocaleUpperCase();
            vdnUrl += "&client=html5"+"&tsp="+vdn_tsp + "&vn="+ vdn_vnHtml5 + "&vc="+vdn_vc + "&uid="+vdn_uid + "&wlan="+vdn_wlan;
        } else {
            vdnUrl = vdnUrl.replace("?channel=pw", "?channel=pc");
            vdn_vc = setH5Str((vdn_tsp+vdn_vnFlash+staticCheck_Flash+vdn_uid)).toLocaleUpperCase()
            vdnUrl += "&client=flash"+"&tsp="+vdn_tsp + "&vn="+ vdn_vnFlash + "&vc="+vdn_vc + "&uid="+vdn_uid + "&wlan="+vdn_wlan;
        }


        livePlayerObjs[paras.divId].isErrorDone = false;
        loadLiveScript(vdnUrl, parseLiveDataFromVdn, paras, parseLiveDataFromVdnWhenError, 10000);

        if(isLiveHlsJsSupported()) {
            if(!livePlayerObjs[paras.divId].isLoadWorker) {
                livePlayerObjs[paras.divId].isLoadWorker = true;
                loadLiveScript(workerUrl, null, null);
            }

        }


        livePlayerObjs.convivaJsLoaded = false;

        //加载conviva api并初始化
        livePlayerObjs[paras.divId].vdn = {};
        livePlayerObjs[paras.divId].vdn.vdnUrl = vdnUrl;
        if(isUseConvivaMonitor) {

            if(!isConvivaApiLoaded && typeof Html5PlayerInterface === "undefined") {
                isConvivaApiLoaded = true;
                LazyLoad.js(convivaJsApi1, function(){
                    LazyLoad.js(convivaJsApi2, function(){
                        livePlayerObjs.convivaJsLoaded = true;
                        initLiveConviva(paras);
                    });
                });
            } else if(livePlayerObjs.convivaJsLoaded || typeof Html5PlayerInterface !== "undefined"){
                initLiveConviva(paras);
            } else{
                var checkConvivaCount = 0;
                livePlayerObjs.loadConvivaTimer = setInterval(function () {
                    checkConvivaCount++;
                    if(checkConvivaCount > 50) {
                        clearInterval(livePlayerObjs.loadConvivaTimer);
                    }
                    if(typeof Html5PlayerInterface !== "undefined") {
                        clearInterval(livePlayerObjs.loadConvivaTimer);
                        initLiveConviva(paras);
                    }
                }, 200);
            }

        }



        livePlayerObjs.aliJsLoaded = false;

        if(!isAliApiLoaded && isUseAliMonitor) {
            isAliApiLoaded = true;
            LazyLoad.js(aliApiUrl, function(){
                livePlayerObjs.aliJsLoaded = true;
            });
        }



        try{
            var containerObj = document.getElementById(paras.divId);
            var originalStyle = containerObj.style.cssText;

            if(!originalStyle || originalStyle.length<4) {
                originalStyle = "none";
            }

            if(document.getElementById(paras.divId)) {
                document.getElementById(paras.divId).setAttribute("originalStyle", originalStyle);
            }

        } catch (e) {

        }



    }
    /*else if(paras.playerType==="hw" && isIPad()) {
        var appUrl = "http://app.cctv.com/appkhdxz/ydb/index.shtml";
        if(paras.isHttps === "true") {
            appUrl = "https://app.cctv.com/appkhdxz/ydb/index.shtml";
        }
        var showMsg = "对不起，不支持您的设备<br />请速下&nbsp;<a style='font-weight:bold;font-size:16px;border:0;color:#cc0000'  href='" + appUrl + "'>央视影音客户端</a>&nbsp;畅享海量直播节目";
        showLivePlayerMsg(paras, showMsg);
        return;
    }
    */
    else if(!isIPad()) {

        getFlashVer();

        if(!isFlashPlayer && !isIPad())    {

            showInstallFlashPlayerMsg(paras.divId, paras.w, paras.h);
            return;
        }



        var version = "2019.07.25.1";

        if(typeof goldlog === "undefined") {
            doLoadLiveAliAnalyticsJs(paras);
        }


        var playerurl = "https://player.cntv.cn/standard/live_HLSDRM20181022.swf";
        if(paras.playerType == "0shouye") {
            playerurl = "http://player.cntv.cn/standard/smallDRMplayer.swf";
        }

        if(paras.playerType == "small") {
            playerurl = "http://player.cntv.cn/standard/smallDRMplayer20790807.swf";
        }

        if(paras.playerType==="hw" || paras.playerType==="small2") {
            playerurl = "http://player.cntv.cn/standard/hwDRMplayer20190917.swf";
        }

        if(paras.playerType == "live") {
            //playerurl = "http://player.cntv.cn/standard/live_HLSDRM20190815.swf";
            playerurl = "http://player.cntv.cn/standard/live_HLSDRM20191015.swf";

        }



        var _hdsPauseAdplayerPath="http://player.cntv.cn/adplayer/cntvPauseAdPlayer.swf";
        var _hdsAdplayerPath = "http://player.cntv.cn/adplayer/cntvAdPlayer20150521.swf";
        var _hdsCornerAdplayerPath = "http://player.cntv.cn/adplayer/cntvCornerADPlayer.swf";

        if(paras.isHttps === "true") {
            playerurl = playerurl.replace("http://", "https://");
            _hdsPauseAdplayerPath="https://player.cntv.cn/adplayer/cntvPauseAdPlayer.swf";
            _hdsAdplayerPath = "https://player.cntv.cn/adplayer/cntvAdPlayer20150521.swf";
            _hdsCornerAdplayerPath = "https://player.cntv.cn/adplayer/cntvCornerADPlayer.swf";
        }



        var hdsFo = null;
        if(IsMaxthon())
        {
            //hdsFo = new SWFObject(playerurl + "?v=18"+version+"&a="+Math.random(), "flashplayer_" + paras.divId, "100%", "100%", "10.0.0.0", "#000000");
            hdsFo = new SWFObject(playerurl + "?v=18"+version, "flashplayer_" + paras.divId, "100%", "100%", "10.0.0.0", "#000000");
        }else
        {
            hdsFo = new SWFObject(playerurl + "?v=18"+version, "flashplayer_" + paras.divId, "100%", "100%", "10.0.0.0", "#000000");
        }


        if(typeof(hds_bitaRates)!="undefined" && typeof(hds_bitaRates)=="string")
        {
            hdsFo.addVariable("bitaRates", paras.br);

        }


        if(paras.playerType == "0shouye") {
            if(paras.w/paras.h < 1.5) {
                hdsFo.addVariable("playErrorImg", "https://player.cntv.cn/images/ipad/h5_0shouye_error4x3.png");
            } else{
                hdsFo.addVariable("playErrorImg", "https://player.cntv.cn/images/ipad/h5_0shouye_error16x9.png");
            }

            hdsFo.addVariable("playErrorJumpUrl", "http://tv.cctv.com/");
        }


        hdsFo.addVariable("id", "flashplayer_" + paras.divId);

        hdsFo.addVariable("ChannelID", paras.t);
        hdsFo.addVariable("videoTVChannel", paras.t);
        hdsFo.addVariable("isAutoPlay", paras.isAutoPlay);
        hdsFo.addVariable("br", paras.br);
        hdsFo.addVariable("posterImg", paras.posterImg);
        hdsFo.addVariable("isLive4k", paras.isLive4k);
        hdsFo.addVariable("https", paras.isHttps);
        hdsFo.addVariable("isHttps", paras.isHttps);
        hdsFo.addVariable("isLeftBottom", paras.isLeftBottom);
        hdsFo.addVariable("ruleVisible", paras.ruleVisible);



        if(paras.t.indexOf("pe://cctv_p2p_hd")!==-1) {
            hdsFo.addVariable("P2PChannelID", paras.t);
            hdsFo.addVariable("tai", paras.t+"_4M");
        } else{
            hdsFo.addVariable("P2PChannelID", "pa://cctv_p2p_hd" + paras.t);
            hdsFo.addVariable("tai", paras.t);
        }


        hdsFo.addVariable("VideoName", paras.t);
        hdsFo.addVariable("channelID", paras.t);


        if(typeof(live_Ad_Calls) != "undefined")
        {
            hdsFo.addVariable("adCalls", live_Ad_Calls);
            hdsFo.addVariable("adplayerPath",_hdsAdplayerPath);
        }
        else
        {
            if(typeof(_hdsAdCall) != "undefined")
            {
                hdsFo.addVariable("adCall", _hdsAdCall);
                hdsFo.addVariable("adplayerPath",_hdsAdplayerPath);
            }

        }

        if(typeof(live_Ad_Pause) != "undefined")
        {
            hdsFo.addVariable("adPause", live_Ad_Pause);
            hdsFo.addVariable("pauseAdplayerPath",_hdsPauseAdplayerPath);
        }
        else
        {
            if(typeof(_hdsAdPause) != "undefined")
            {
                hdsFo.addVariable("adPause",_hdsAdPause );
                hdsFo.addVariable("pauseAdplayerPath",_hdsPauseAdplayerPath);
            }
        }

        if(typeof(live_Ad_Corner) != "undefined")
        {
            hdsFo.addVariable("adCorner", live_Ad_Corner);
            hdsFo.addVariable("cornerAdplayerPath",_hdsCornerAdplayerPath);
        }
        if(typeof(live_Ad_Banner) != "undefined")
        {
            hdsFo.addVariable("adBanner", live_Ad_Banner);
        }
        if(typeof(live_Ad_Wenzi) != "undefined")
        {
            hdsFo.addVariable("adText", live_Ad_Wenzi);
        }

        hdsFo.addVariable("BannerWidth", 600);
        hdsFo.addVariable("BannerInterval", 20);
        hdsFo.addVariable("playBackType","common");
        if(paras.ruleVisible === "false"){
            hdsFo.addVariable("ruleVisible","false");
        } else {
            hdsFo.addVariable("ruleVisible","true");
        }

        if(paras.webFullScreenOn === "false"){
            hdsFo.addVariable("windeowFullBtnVisible","false");
        } else {
            hdsFo.addVariable("windeowFullBtnVisible","true");

        }




        if(paras.playerType==="hw") {
            hdsFo.addVariable("ruleVisible", "false");
            hdsFo.addVariable("windeowFullBtnVisible", "false");
            hdsFo.addVariable("briteBtnVisible", "false");
        }

        if(paras.playerType==="small2") {
            hdsFo.addVariable("briteBtnVisible", "true");

        }

        if(location.href.indexOf(".pandaplace.nl/pandacam")===-1&&location.href.indexOf("ipanda.com.de/monitor")===-1&&location.href.indexOf("en.ipanda.com/live")===-1 && location.href.indexOf("live.ipanda.com/webapp")===-1  && location.href.indexOf("live.ipanda.com/ipandade_iframe")===-1 && location.href.indexOf("live.ipanda.com/pandaplace")===-1)
        {
            hdsFo.addVariable("languageXml","");
            if(paras.t==="cctv5" || paras.t==="cctv5plus"){

                if(paras.t.indexOf("pe://cctv_p2p_hd")!==-1) {
                    hdsFo.addVariable("bitaRates", "4096");
                    if(paras.isHttps === "true") {
                        hdsFo.addVariable("configURL","https://player.cntv.cn/flashplayer/config/WebHDSPlayerConfig_1080P.xml");
                    } else{
                        hdsFo.addVariable("configURL","http://player.cntv.cn/flashplayer/config/WebHDSPlayerConfig_1080P.xml");
                    }

                } else{
                    //hdsFo.addVariable("configURL","http://player.cntv.cn/flashplayer/config/WebHDSPlayerConfig_HD.xml");

                    if(paras.isHttps === "true") {
                        hdsFo.addVariable("configURL","https://player.cntv.cn/flashplayer/config/WebDRMPlayerConfig.xml");
                    } else{
                        hdsFo.addVariable("configURL","http://player.cntv.cn/flashplayer/config/WebDRMPlayerConfig.xml");
                    }


                }
            } else{

                if(paras.isHttps === "true") {
                    hdsFo.addVariable("configURL","https://player.cntv.cn/flashplayer/config/WebDRMPlayerConfig.xml");
                } else{
                    hdsFo.addVariable("configURL","http://player.cntv.cn/flashplayer/config/WebDRMPlayerConfig.xml");
                }
            }

            /*
             if(ChannelID==="cctv1"){
             hdsFo.addVariable("configURL","http://player.cntv.cn/flashplayer/config/WebHDSPlayerConfig1080p.xml");
             }
             */

        }
        else
        {

            if(paras.isHttps === "true") {
                hdsFo.addVariable("languageXml","https://player.cntv.cn/xml/english/hdsLanguage.xml");
                hdsFo.addVariable("configURL","https://player.cntv.cn/flashplayer/config/WebHDSPlayerConfig-English.xml");

            } else{
                hdsFo.addVariable("languageXml","http://player.cntv.cn/xml/english/hdsLanguage.xml");
                hdsFo.addVariable("configURL","http://player.cntv.cn/flashplayer/config/WebHDSPlayerConfig-English.xml");

            }
        }

        if(location.href.indexOf("en.ipanda.com") !== -1) {


            if(paras.isHttps === "true") {
                hdsFo.addVariable("configURL","https://player.cntv.cn/flashplayer/config/WebHDSPlayerConfig_panda.xml");

            } else{
                hdsFo.addVariable("configURL","http://player.cntv.cn/flashplayer/config/WebHDSPlayerConfig_panda.xml");
            }
        }
        hdsFo.addVariable("referrer", document.referrer);
        //获取cookie并传递指纹信息
        if(!getCookie_vdn("Fingerprint")){
            //获取设备指纹信息
            getfingerprint2();
        } else{
            Fingerprint = getCookie_vdn("Fingerprint");
        }
        //把指纹信息传给播放器
        hdsFo.addVariable("fingerprint",Fingerprint);

        if(typeof(channelAbled) !== "undefined") {
            hdsFo.addVariable("channelAbled", channelAbled);
        }

        if(typeof(hdsSelectChannel) !== "undefined") {
            hdsFo.addVariable("selectChannel", hdsSelectChannel);
        }

        if(typeof(isHdsAbroad) !== "undefined") {
            hdsFo.addVariable("isabroad", isHdsAbroad);
        }



        hdsFo.addParam("wmode", paras.wmode);


        hdsFo.addParam("quality", "high");
        hdsFo.addParam("menu","false");
        hdsFo.addParam("allowFullScreen", "true");
        hdsFo.addParam("allowScriptAccess","always");




        hdsFo.write(paras.divId);
        if(paras.wmode==="true" || location.href.indexOf("tv.cntv.cn/live")!==-1 || location.href.indexOf("tv.cctv.com/live")!==-1){
            try{
                document.getElementById(divID).style.backgroundColor = "#000";
            } catch(e){
            }
        }


        //播放器容器的原始样式
        try{
            var contanerObj = document.getElementById(paras.divId);
            var originalStyle = contanerObj.style.cssText;
            if(!originalStyle || originalStyle.length<4) {
                originalStyle = "none";
            }

            document.getElementById("flashplayer_" + paras.divId).setAttribute("originalStyle", originalStyle);
        } catch (e) {

        }


    } else {
        livePlayerObjs[paras.divId].isOldH5player = true;

        var jsUrl = "http://js.player.cntv.cn/creator/live_common.js";

        if(paras.isHttps === "true") {
            jsUrl = "https://js.player.cntv.cn/creator/live_common.js";
        }


        if(!livePlayerObjs.isLoadLiveJs) {
            livePlayerObjs.isLoadLiveJs = true;
            loadLiveScript(jsUrl, createOldLivePlayer, paras);
        } else{
            if(typeof createFlashLivePlayer !== "undefined") {
                clearInterval(livePlayerObjs[paras.divId].loadLiveTimer);
                createOldLivePlayer(paras);
            } else{
                var checkCount = 0;
                livePlayerObjs[paras.divId].loadLiveTimer = setInterval(function () {
                    checkCount++;
                    if(checkCount > 50) {
                        clearInterval(livePlayerObjs[paras.divId].loadLiveTimer);
                    }
                    if(typeof createFlashLivePlayer !== "undefined") {
                        clearInterval(livePlayerObjs[paras.divId].loadLiveTimer);
                        createOldLivePlayer(paras);
                    }
                }, 200);
            }

        }



    }
}


function createOldLivePlayer(paras) {
    createFlashLivePlayer(paras.divId, paras.w, paras.h, paras.t);
}


function createLivebackPlayer(paras) {

    if(location.href.indexOf("https://")!==-1) {
        paras.isHttps = "true";
        livePlayerObjs.isHttps = "true";
    }

    if(!isWasmSupported()|| !isLiveHlsJsSupported() || /(iphone|ipad)/i.test(navigator.userAgent) || livePlayerObjs[paras.divId].isOldH5player) {


        if(typeof creatIpadFlashPlayer !== "undefined") {
            var oldPlayer = document.getElementById("html5Player_live");
            if(oldPlayer) {

                oldPlayer.style.display = "none";
                oldPlayer.style.visibility = "hidden";
                document.getElementById(paras.divId).removeChild(oldPlayer);

            }

            var newPlayer = document.getElementById("h5player_"+paras.divId);
            if(newPlayer) {
                newPlayer.style.display = "none";
                document.getElementById(paras.divId).removeChild(newPlayer);

            }

            document.getElementById(paras.divId).innerHTML = "";
            creatIpadFlashPlayer(paras.divId, paras.w, paras.h, paras.t, paras.start, paras.end, location.href,"id","", "", "", "", "", paras.title);



        }
        return false;
    }

    if(!(livePlayerObjs[paras.divId] && livePlayerObjs[paras.divId].video && livePlayerObjs[paras.divId].video.url && livePlayerObjs[paras.divId].video.url.length>3)) {
        return false;
    }


    var start = paras.start + "";
    var end = paras.end + "";


    if(start.length!== 10 && end.length!==10) {
        var startYear = start.substr(0, 4);
        var startMouth = start.substr(4, 2);
        var startDay = start.substr(6, 2);
        var startHour = start.substr(8, 2);
        var startMinute = start.substr(10, 2);
        var startSecond = "00";
        if(start.length === 14) {
            startSecond = start.substr(12, 2);
        }
        var startTimeStr = startYear + "-" + startMouth + "-" + startDay + " " + startHour + ":" + startMinute + ":" + startSecond;
        start = datetimeToUnix(startTimeStr);


        var endYear = end.substr(0, 4);
        var endMouth = end.substr(4, 2);
        var endDay = end.substr(6, 2);
        var endHour = end.substr(8, 2);
        var endMinute = end.substr(10, 2);
        var endSecond = "00";
        if(start.length === 14) {
            endSecond = start.substr(12, 2);
        }
        var endTimeStr = endYear + "-" + endMouth + "-" + endDay + " " + endHour + ":" + endMinute + ":" + endSecond;
        end = datetimeToUnix(endTimeStr);
    }

    livePlayerObjs[paras.divId].start = start;
    livePlayerObjs[paras.divId].end = end;
    livePlayerObjs[paras.divId].pointerStart = 0;
    livePlayerObjs[paras.divId].video.duration = end - start;


    var videoUrl = livePlayerObjs[paras.divId].video.url;
    var startIndex = videoUrl.indexOf("?start=");
    if(startIndex === -1) {
        startIndex = videoUrl.indexOf("&start=");
    }

    if(startIndex > 0) {
        livePlayerObjs[paras.divId].video.url = videoUrl.substring(0, startIndex+1) + "start="+start+"&end="+end;
    } else{
        if(videoUrl.indexOf("?") > 0) {
            livePlayerObjs[paras.divId].video.url += "&start="+start+"&end="+end;
        } else{
            livePlayerObjs[paras.divId].video.url += "?start="+start+"&end="+end;
        }
    }

    livePlayerObjs[paras.divId].video.originalUrl = livePlayerObjs[paras.divId].video.url;

    //检查版权
    //对接口文档的新字段进行初始化；
    var vdn_tsp =new Date().getTime().toString().slice(0,10);
    var vdn_vn = "2049";
    var vdn_vc = "";
    var staticCheck = "47899B86370B879139C08EA3B5E88267";
    var vdn_uid = "";
    var vdn_wlan = "";
    //获取cookie
    if(typeof(getCookie_vdn)=="function"){
        if(!getCookie_vdn("Fingerprint")){
            //获取设备指纹信息
            if(typeof(getfingerprint2)=="function" && typeof(getfingerprint2)!="undefined" && !livePlayerObjs.isFingerprintJsLoading){
                getfingerprint2();
            }
        } else{
            vdn_uid = getCookie_vdn("Fingerprint");
        }
    }
    //md5加密  动态校验码
    var vdn_vc = setH5Str((vdn_tsp+vdn_vn+staticCheck+vdn_uid)).toUpperCase();


    var vdnUrl = "http://vdn.live.cntv.cn/api2/liveTimeshiftHtml5.do?channel=pa://cctv_p2p_hd" + paras.t + "&client=html5&starttime=" + start;
    if(paras.isHttps === "true") {
        vdnUrl = "https://vdn.live.cntv.cn/api2/liveTimeshiftHtml5.do?channel=pa://cctv_p2p_hd" + paras.t + "&client=html5&starttime=" + start;
    }
    //添加新字段
    vdnUrl += "&tsp="+vdn_tsp + "&vn="+ vdn_vn + "&vc="+vdn_vc + "&uid="+vdn_uid + "&wlan="+vdn_wlan;
    vdnUrl += "&jsonp=liveAdCallsData";
    livePlayerObjs[paras.divId].isErrorDone = false;

    loadLiveScript(vdnUrl, checkLivebackCopyright, paras, checkLivebackCopyrightWhenError, 10000);

    clearInterval(livePlayerObjs[paras.divId].canvasDrawTimer);

    if(liveConvivaClient && liveConvivaClient.cleanupSession && livePlayerObjs[paras.divId].convivaSessionKey!==undefined) {
        liveConvivaClient.cleanupSession(livePlayerObjs[paras.divId].convivaSessionKey);
        livePlayerObjs[paras.divId].convivaSessionKey = undefined;
    }



}

function checkLivebackCopyrightWhenError(paras) {

    if(livePlayerObjs[paras.divId].isErrorDone) {
        return;
    }

    livePlayerObjs[paras.divId].isErrorDone = true;
    if(paras.t === "cctv1") {
        var obj = {};
        obj.ack = "yes";
        obj.public = "1";

        html5VideoData = JSON.stringify(obj);

        checkLivebackCopyright(paras);
    } else {
        showLivePlayerMsg(paras, "该视频暂时无法观看，请稍后再试。");
    }
}

function checkLivebackCopyright(paras) {
    livePlayerObjs[paras.divId].isErrorDone = true;
    var obj = null;
    var public = "1";

    try{
        var obj = eval('(' + html5VideoData + ')');
        if(obj.ack==="yes") {
            public = obj.public;
        }
    } catch(e){
        public = "error";
    }

    if(public === "error") {
        livePlayerObjs[paras.divId].isErrorDone = false;
        checkLivebackCopyrightWhenError(paras)
        return;
    }

    //创建新的conviva session



    if(public === "0") {
        showLivePlayerMsg(paras, "视频由于版权原因，您所在的地区暂时无法观看，请选择观看其他精彩视频。");

        if(isUseConvivaMonitor) {
            createFlvHtml5ConvivaEvent(paras);
        }
    } else{
        livePlayerObjs[paras.divId].adCallsIsPlayed = false;

        //livePlayerObjs[paras.divId].video.url = "https://cctvcnch5c.v.wscdns.com/live/cctv1_2/index.m3u8?contentid=2820180516001&start=1567864620&end=1567864740";

        livePlayerObjs[paras.divId].isLive = false;

        if(document.getElementById("error_msg_"+paras.divId)) {
            document.getElementById(paras.divId).removeChild(document.getElementById("error_msg_"+paras.divId));
        }


        if(document.getElementById("h5player_"+paras.divId)) {
            if(isCanvasSupported(paras.divId)) {
                document.getElementById("h5player_"+paras.divId).style.display = "none";

                if(document.getElementById("h5canvas_"+paras.divId)) {
                    document.getElementById("h5canvas_"+paras.divId).style.display = "block";
                }
            } else{
                document.getElementById("h5player_"+paras.divId).style.display = "block";
            }

        }



        if(!isMobleUseBrowserUi) {
            var controlsBar = document.getElementById("control_bar_"+paras.divId);
            if(!controlsBar && !isMobleUseBrowserUi) {
                var controls = new LiveControlsBar(paras);
            }


            if(!document.getElementById("player_progress_"+paras.divId)) {
                new LiveProgressBar(paras.divId);
                new LivePlayTimeShow(paras.divId, 75);
            } else{
                document.getElementById("player_progress_played_"+paras.divId).style.width = "0%";
                document.getElementById("player_progress_cached_"+paras.divId).style.width = "0%";
                document.getElementById("player_progress_pointer_"+paras.divId).style.left = "-12px";
                if(document.getElementById("played_time_timer_"+paras.divId)) {
                    document.getElementById("played_time_timer_"+paras.divId).innerHTML = "00:00";
                }
                if(document.getElementById("played_time_total_"+paras.divId)) {
                    document.getElementById("played_time_total_"+paras.divId).innerHTML = LivePlayTimeShow.prototype.formatTimeToStr(livePlayerObjs[paras.divId].video.duration)
                }

                LivePlayTimeShow.prototype.setPlayedTime(paras.divId, 0);
            }
        }

        var player = document.getElementById("h5player_"+paras.divId);

        if(player) {
            var remainClass = player.getAttribute("class").replace("videoNoTimeline", "");
            player.setAttribute("class", remainClass);
        }


        if(!/(iphone|ipad)/i.test(navigator.userAgent)) {
            if(paras.isAutoPlay === "true") {
                document.getElementById("h5player_"+paras.divId).autoplay = true;
            }

            createLiveHls(paras);
        } else{

            self.loadedState = false;
            playCanvasVideo(paras.divId, true);
        }


        if(isUseAliMonitor) {
            if(typeof goldlog!="undefined" && goldlog["h5player_"+paras.divId] && typeof heartbeatStarted!=="undefined") {
                heartbeatStarted = true;
            }
        }



    }




}

function getHtml5VideoData() {

}

function datetimeToUnix(datetime) {
    var tmp_datetime = datetime.replace(/:/g, '-');
    tmp_datetime = tmp_datetime.replace(/ /g, '-');
    var arr = tmp_datetime.split("-");
    var now = new Date(Date.UTC(arr[0], arr[1] - 1, arr[2], arr[3] - 8, arr[4], arr[5]));
    return parseInt(now.getTime() / 1000);
}

function getStartLevel(levels, defaultStream) {
    var defaultBitrate = 0;
    var len = levels.length;
    var min = 6000000;
    var startLevel = 1;
    switch (defaultStream) {
        case "lowChapters":
            defaultBitrate = 200000;
            break;
        case "chapters":
            defaultBitrate = 450000;
            break;
        case "chapters2":
            defaultBitrate = 850000;
            break;
        case "chapters3":
            defaultBitrate = 1200000;
            break;
        case "chapters4":
            defaultBitrate = 2000000;
            break;
        case "chapters5":
            defaultBitrate = 4000000;
            break;
        case "chapters6":
            defaultBitrate = 6000000;
            break;
    }

    for(var i=0; i<len; i++) {
        if(Math.abs(levels[i].bitrate - defaultBitrate) < min) {
            min = Math.abs(levels[i].bitrate - defaultBitrate);
            startLevel = i;
        }
    }
    return startLevel;
}

function destroyH5LiveHls(paras) {


    if(livePlayerObjs[paras.divId].adCallsVideo && livePlayerObjs[paras.divId].adCallsVideo.hls) {
        livePlayerObjs[paras.divId].adCallsVideo.hls.destroy();
        livePlayerObjs[paras.divId].adCallsVideo.hls.detachMedia();

        livePlayerObjs[paras.divId].adCallsVideo.hls = null;

        console.log("destroy ad");
    }

    if(livePlayerObjs[paras.divId].video && livePlayerObjs[paras.divId].video.hls) {
        livePlayerObjs[paras.divId].video.hls.destroy();
        livePlayerObjs[paras.divId].video.hls.detachMedia();
        livePlayerObjs[paras.divId].video.hls = null;
        console.log("destroy video");
    }


    if(liveConvivaClient && liveConvivaClient.cleanupSession && livePlayerObjs[paras.divId].convivaSessionKey!==undefined) {
        liveConvivaClient.cleanupSession(livePlayerObjs[paras.divId].convivaSessionKey);
        livePlayerObjs[paras.divId].convivaSessionKey = undefined;

    }




    if(isUseAliMonitor) {
        if(typeof goldlog!="undefined" && goldlog["h5player_"+paras.divId] && typeof heartbeatStarted!=="undefined") {
            heartbeatStarted = false;
        }
    }






}


function destroyLivePlayer(divId) {
    var canvas = document.getElementById("h5canvas_"+divId);
    var video = document.getElementById("h5player_"+divId);
    if(canvas) {
        document.getElementById(divId).removeChild(canvas);
        clearInterval(livePlayerObjs[divId].canvasDrawTimer);
    }
    if(video) {
        try{
            document.body.removeChild(video);
        } catch (e) {
            document.getElementById(divId).removeChild(video);
        }

    }



    if(livePlayerObjs[divId] && !livePlayerObjs[divId].isOldH5player) {

        destroyH5LiveHls({divId: divId});
    }


    document.getElementById(divId).innerHTML = "";

    if(liveConvivaClient && liveConvivaClient.cleanupSession && livePlayerObjs[divId].convivaSessionKey!==undefined) {
        try {
            liveConvivaClient.cleanupSession(livePlayerObjs[divId].convivaSessionKey);
            livePlayerObjs[divId].convivaSessionKey = undefined;
        } catch (e) {

        }

    }


    if(typeof goldlog!="undefined" && goldlog["h5player_"+divId] && typeof heartbeatStarted!=="undefined") {
        heartbeatStarted = false;
    }


    //hds直播清除session
    if(typeof(convivaClient)!=="undefined" && typeof(convivaSessionKey)!=="undefined" && convivaClient) {
        convivaClient.cleanupSession(convivaSessionKey);
    }

    //flv直播清除session
    if(typeof(flvConvivaClient)!=="undefined" && typeof(flvSessionKey)!=="undefined" && flvConvivaClient) {
        flvConvivaClient.cleanupSession(flvSessionKey);
    }



}



function playLiveVideo(paras) {

    if(document.getElementById("adcalls_bar_" + paras.divId)) {
        document.getElementById(paras.divId).removeChild(document.getElementById("adcalls_bar_" + paras.divId));
    }

    if(livePlayerObjs[paras.divId].adCallsIsPlayed) {
        return;
    }

    livePlayerObjs[paras.divId].adCallsIsPlayed = true;
    clearInterval(livePlayerObjs[paras.divId].adCallsRemainingTimer);
    destroyH5LiveHls(paras);



    if(document.getElementById("loading_"+paras.divId)) {
        document.getElementById("loading_"+paras.divId).style.display = "block";
    }

    createLiveHls(paras);

    if(isUseConvivaMonitor && livePlayerObjs[paras.divId].convivaSessionCreated && Array.isArray(livePlayerObjs.adCallsAPI) && livePlayerObjs.adCallsAPI.length>0) {

        liveConvivaClient.adEnd(livePlayerObjs[paras.divId].convivaSessionKey);

    }


    if(isUseAliMonitor) {
        if(typeof goldlog!="undefined" && goldlog["h5player_"+paras.divId] && typeof heartbeatStarted!=="undefined") {
            heartbeatStarted = true;
        } else{
            setCntvLiveMetadata(paras);
        }


    }





}


function createLiveVideoLoadingImg(paras) {
    if(isMobleUseBrowserUi) {
        return;
    }

    var htmls = "";
    htmls = '<div id="loading_' + paras.divId + '" style="position:absolute;top:42%;margin:0 auto;text-align:center;width:100%;height:42px;cursor:pointer;z-index:20;display:none;">';
    htmls += '<img src="https://player.cntv.cn/html5Player/images/cctv_html5player_loading.gif" style="width:120px;height:42px;display:inline-block;">';
    htmls += '</div>';

    document.getElementById(paras.divId).insertAdjacentHTML("afterBegin", htmls);
}


function getLiveAdCallsData(data) {

    if(typeof data === "object" && data.divId) {
        livePlayerObjs.adCallsPlayingNum += 1;
        getLiveAdCallsDataFromVdn(data, livePlayerObjs.adCallsPlayingNum);
    }

}

function getLiveAdCallsDataFromVdn(data, adNum) {

    if(!Array.isArray(livePlayerObjs.adCallsAPI) || livePlayerObjs.adCallsPlayingNum-livePlayerObjs.adCallsAPI.length>=0) {
        playLiveVideo(data);
        return;
    }


    //对接口文档的新字段进行初始化；
    var vdn_tsp =new Date().getTime().toString().slice(0,10);
    var vdn_vn = "2049";
    var vdn_vc = "";
    var staticCheck = "47899B86370B879139C08EA3B5E88267";
    var vdn_uid = "";
    var vdn_wlan = "";



    //获取cookie
    if(typeof(getCookie_vdn)=="function"){
        if(!getCookie_vdn("Fingerprint")){
            //获取设备指纹信息
            if(typeof(getfingerprint2)=="function" && typeof(getfingerprint2)!="undefined" && !livePlayerObjs.isFingerprintJsLoading){
                getfingerprint2();
            }
        } else{
            vdn_uid = getCookie_vdn("Fingerprint");
        }
    }
    //md5加密  动态校验码
    var vdn_vc = setH5Str((vdn_tsp+vdn_vn+staticCheck+vdn_uid)).toUpperCase();


    var vdnUrl = "http://vdn.apps.cntv.cn/api/getIpadInfoAd.do?pid=" + livePlayerObjs.adCallsAPI[adNum].guid + "&tai=ipad&from=html5";
    if(livePlayerObjs.isHttps === "true") {
        vdnUrl = "https://vdn.apps.cntv.cn/api/getIpadInfoAd.do?pid=" + livePlayerObjs.adCallsAPI[adNum].guid + "&tai=ipad&from=html5";
    }

    //添加新字段
    vdnUrl += "&tsp="+vdn_tsp + "&vn="+ vdn_vn + "&vc="+vdn_vc + "&uid="+vdn_uid + "&wlan="+vdn_wlan;
    vdnUrl += "&jsonp=liveAdCallsData";


    loadLiveScript(vdnUrl, parseLiveAdCallsDataFromVdn, data, getLiveAdCallsData);

    livePlayerObjs.adCallsAPI[livePlayerObjs.adCallsPlayingNum].loadTime = 0;
    livePlayerObjs.adCallsAPI[livePlayerObjs.adCallsPlayingNum].cdnCode = "";
    if(isUseAliMonitor) {
        sendLiveAliAdCallsRequestData(data, "play.1.40");
    }


}

function parseLiveAdCallsDataFromVdn(paras) {

    var title = "";
    var videoUrl = "";
    var defaultStream = "";
    var duration = 15;
    var cdnCode = "";
    var obj = null;

    try{
        var obj = eval('(' + liveAdCallsData + ')');
        videoUrl = obj["hls_url"];
        title = obj["title"];
        defaultStream = obj["default_stream"];
        duration = obj["video"]["totalLength"];
        cdnCode = obj["hls_cdn_info"]["cdn_code"];
    } catch(e){
        title = "error";
    }



    if(title==="error" || videoUrl.length<3 || obj["public"]!=1 || (livePlayerObjs.adCallsPlayingNum-livePlayerObjs.adCallsAPI.length>=0)) {

        livePlayerObjs.adCallsPlayingNum += 1;
        getLiveAdCallsDataFromVdn(paras, livePlayerObjs.adCallsPlayingNum);
    } else {

        livePlayerObjs.adCallsAPI[livePlayerObjs.adCallsPlayingNum].title = title;
        livePlayerObjs.adCallsAPI[livePlayerObjs.adCallsPlayingNum].hlsUrl = videoUrl;
        livePlayerObjs.adCallsAPI[livePlayerObjs.adCallsPlayingNum].defaultStream = defaultStream;
        livePlayerObjs.adCallsAPI[livePlayerObjs.adCallsPlayingNum].duration = duration;
        livePlayerObjs.adCallsAPI[livePlayerObjs.adCallsPlayingNum].cdnCode = cdnCode;

        playLiveAdCalls(paras);
    }



}

function parseLiveAdCallsDataFromApi(data) {

    if(data && !data.divId) {
        var len = 0;
        if(Array.isArray(data)) {
            len = data.length;
        }

        livePlayerObjs.adCallsAPI = [];
        for(var i=0; i<len; i++){

            if(data[i].guid && data[i].clickUrl) {
                livePlayerObjs.adCallsAPI[i] = {};
                livePlayerObjs.adCallsAPI[i].guid = data[i].guid;
                livePlayerObjs.adCallsAPI[i].clickUrl = data[i].clickUrl;
            }
        }

    } else if(Array.isArray(livePlayerObjs.adCallsAPI)){
        livePlayerObjs.adCallsPlayingNum = 0;
        getLiveAdCallsDataFromVdn(data, livePlayerObjs.adCallsPlayingNum);

        //如果在广告预期的2倍时间内广告没播完，就直接播视频
        livePlayerObjs[data.divId].adCallsTimer = setTimeout(function () {
            if(!livePlayerObjs[data.divId].adCallsIsPlayed) {
                playLiveVideo(data);
            }
        }, livePlayerObjs.adCallsAPI.length*2*15000);
    } else{
        playLiveVideo(data);
    }
}

function parseLiveAdCallsDataFromApiWhenError(paras) {
    playLiveVideo(paras);


}


function playNextLiveAdCalls(paras) {

    //兼容一进视频还没播就抛出error事件
    if(!livePlayerObjs[paras.divId].adCallsIsPlayed) {
        if(document.getElementById("h5player_" + paras.divId).currentTime<3 && event.type==="ended") {
            return;
        }

        if(isUseAliMonitor) {
            sendLiveAliAdCallsRequestData(paras, "play.1.43");
        }

        livePlayerObjs.adCallsPlayingNum += 1;
        getLiveAdCallsDataFromVdn(paras, livePlayerObjs.adCallsPlayingNum);



    }

}

function playLiveAdCalls(paras) {


    destroyH5LiveHls(paras);

    createAdCallsLiveHls(paras);
    livePlayerObjs.adCallsAPI[livePlayerObjs.adCallsPlayingNum].startLoad = Date.parse(new Date());

    if(livePlayerObjs.adCallsPlayingNum===0 && isUseConvivaMonitor) {
        if(livePlayerObjs[paras.divId].convivaSessionCreated) {

            liveConvivaClient.adStart(livePlayerObjs[paras.divId].convivaSessionKey, Conviva.Client.AdStream.SEPARATE, Conviva.Client.AdPlayer.SEPARATE, Conviva.Client.AdPosition.PREROLL);

        } else{
            setTimeout(function () {
                if(livePlayerObjs[paras.divId].convivaSessionCreated) {
                    liveConvivaClient.adStart(livePlayerObjs[paras.divId].convivaSessionKey, Conviva.Client.AdStream.SEPARATE, Conviva.Client.AdPlayer.SEPARATE, Conviva.Client.AdPosition.PREROLL);
                }
            }, 400);
        }

    }

    livePlayerObjs.adCallsAPI[livePlayerObjs.adCallsPlayingNum].loadTime = 0;
    if(isUseAliMonitor) {
        sendLiveAliAdCallsRequestData(paras, "play.1.41");
    }


}





function initLiveH5Player(paras) {

    livePlayerObjs[paras.divId].video.playing = false;
    livePlayerObjs[paras.divId].adCallsIsPlayed = false;
    var video = document.getElementById("h5player_" + paras.divId);
    if (Hls.isSupported() ) {
        var video = document.getElementById("h5player_" + paras.divId);


        if(livePlayerObjs[paras.divId].adCalls && livePlayerObjs[paras.divId].adCalls.length>3 && !isIPad()) {
            livePlayerObjs.adCallsPlayingNum = 0;
            video.addEventListener("ended", playNextLiveAdCalls.bind(null, paras), false);

            video.addEventListener("play", liveAdCallsStartPlay.bind(null, paras), false);

            loadLiveScript(livePlayerObjs[paras.divId].adCalls, parseLiveAdCallsDataFromApi, paras, parseLiveAdCallsDataFromApiWhenError, 100);



        } else{
            playLiveVideo(paras);
        }

    }


}


function getRandom(){
    var time = new Date();
    return time.getTime();
}

function parseLiveDataFromVdnWhenError(paras, errStr) {


    if(livePlayerObjs[paras.divId].isErrorDone) {
        return;
    }


    livePlayerObjs[paras.divId].isErrorDone = true;

    if(isUseConvivaMonitor && (typeof livePlayerObjs[paras.divId].video.url !=="string" || livePlayerObjs[paras.divId].video.url.length<10)) {

        livePlayerObjs[paras.divId].video.url = "";


        if(!errStr) {
            setLiveConvivaMetadata(paras, "VDN_REQUEST_FAILED");
        }


        if(paras.t !== "cctv1") {
            showLivePlayerMsg(paras, "该视频暂时无法观看，请稍后再试。");
        }


    }

    if(paras.t === "cctv1") {

        var randowmNum = Math.floor(Math.random()*100);
        var videoUrl = "";
        var cdnName = "";

        if(randowmNum<17) {
            videoUrl = "http://cctvalih5c.v.myalicdn.com/live/cdrmcctv1_1/index.m3u8";
            cdnName = "LIVE-HLS-CDN-ALI";
        } else if(randowmNum>=17 && randowmNum<32) {
            videoUrl = "http://cctvbsh5c.v.live.baishancdnx.cn/live/cdrmcctv1_1/index.m3u8";
            cdnName = "LIVE-HLS-CDN-BS";
        } else if(randowmNum>=32 && randowmNum<53) {
            videoUrl = "http://cctvtxyh5c.liveplay.myqcloud.com/live/cdrmcctv1_1/index.m3u8";
            cdnName = "LIVE-HLS-CDN-TXY";
        } else if(randowmNum>=53 && randowmNum<74) {
            videoUrl = "http://cctvcnch5c.v.wscdns.com/live/cdrmcctv1_1/index.m3u8";
            cdnName = "LIVE-HLS-CDN-CNC2";
        } else if(randowmNum>=74 && randowmNum<98) {
            videoUrl = "http://cctvksh5c.v.kcdnvip.com/live/cdrmcctv1_1/index.m3u8";
            cdnName = "LIVE-HLS-CDN-KS";
        } else{
            videoUrl = "http://cctvdnh5c.v.dwion.com/live/cdrmcctv1_1/index.m3u8";
            cdnName = "LIVE-HLS-CDN-DN2";
        }


        if(isIPad()) {
            videoUrl += "?BR=hd";
        }

        var obj = {};
        obj.ack = "yes";
        obj.public = "1";
        obj.default_stream = "";
        obj.client_sid = "";
        obj.hls_url = {};
        obj.hls_url.hls2 = videoUrl;
        obj.hls_cdn_info = {};
        obj.hls_cdn_info.cdn_code = cdnName;
        obj.lc = {};
        obj.lc.ip = "";
        obj.lc.country_code = "";
        obj.lc.provice_code = "";
        obj.lc.city_code = "";
        obj.lc.isp_code = "";


        html5VideoData = JSON.stringify(obj);

        parseLiveDataFromVdn(paras);


    }
}


function parseLiveDataFromVdn(paras) {

    var obj = null;
    var videoUrl = "";
    var errStr = "";

    livePlayerObjs[paras.divId].isErrorDone = true;

    var playerUrl = "http://js.player.cntv.cn/creator/liveplayer_controls.js";
    //var playerUrl = "http://jstest.v.cntv.cn/page/drm/liveplayer_controls.js";

    if(paras.isHttps === "true") {
        playerUrl = "https://js.player.cntv.cn/creator/liveplayer_controls.js";
        //playerUrl = "https://jstest.v.cntv.cn/page/drm/liveplayer_controls.js";
    }

    //playerUrl = "liveplayer_controls.js?1132";

    try{
        var obj = eval('(' + html5VideoData + ')');

        if(obj.ack.toLowerCase() !== "yes") {
            errStr = "该视频暂时无法观看，请刷新页面或稍后再试。";
            setLiveConvivaMetadata(paras, "VDN_RESPONSE_EMPTY");

            if(typeof goldlog!="undefined" && goldlog["h5player_"+paras.divId] && typeof heartbeatStarted!=="undefined") {
                heartbeatStarted = false;
            }

            setCntvLiveMetadata(paras, "690003", "VDN_RESPONSE_EMPTY");


        } else {

            livePlayerObjs[paras.divId].vdn.public = obj.public;

            livePlayerObjs[paras.divId].vdn.cdnName = obj.hls_cdn_info.cdn_code;


            livePlayerObjs[paras.divId].vdn.sid = obj.client_sid;
            livePlayerObjs[paras.divId].vdn.vdnIP = obj.lc.ip;
            livePlayerObjs[paras.divId].vdn.vdnCountryCode = obj.lc.country_code;
            livePlayerObjs[paras.divId].vdn.vdnProvinceCode = obj.lc.provice_code;
            livePlayerObjs[paras.divId].vdn.vdnCityCode = obj.lc.city_code;
            livePlayerObjs[paras.divId].vdn.vdnISPCode = obj.lc.isp_code;
            videoUrl = obj.hls_url.hls2;
            //livePlayerObjs[paras.divId].video.url = "http://cctvtxyh5c.liveplay.myqcloud.com/live/cdrmcctv1_1/index.m3u8?BR=hd";
            livePlayerObjs[paras.divId].video.url = videoUrl;
            //alert(videoUrl)

            if(obj.public === "0") {
                errStr = "视频由于版权原因，您所在的地区暂时无法观看，请选择观看其他精彩视频。";
                if(isUseConvivaMonitor) {
                    createFlvHtml5ConvivaEvent(paras);
                }



                if(typeof LiveControlsBar === "undefined") {
                    LazyLoad.js(playerUrl, function(){
                        createH5LivePlayerElement(paras.divId);

                    });
                } else{
                    createH5LivePlayerElement(paras.divId);
                }

            }


            livePlayerObjs[paras.divId].video.defaultStream = obj["default_stream"];

            //livePlayerObjs[paras.divId].video.url = "http://39.96.9.37/cdrmlive/cdrm_cctv15_1800_dw/index.m3u8";

        }

    } catch(e){
        errStr = "该视频暂时无法观看，请稍后再试。";
        setLiveConvivaMetadata(paras, "VDN_RESPONSE_PARSE_ERROR");
        setCntvLiveMetadata(paras, "690003", "VDN_RESPONSE_PARSE_ERROR");

        if(typeof goldlog!="undefined" && goldlog["h5player_"+paras.divId] && typeof heartbeatStarted!=="undefined") {
            heartbeatStarted = false;
        }

    }


    if(errStr.length > 1) {
        if(paras.t==="cctv1" && errStr.indexOf("版权")==-1) {
            livePlayerObjs[paras.divId].isErrorDone = false;
            parseLiveDataFromVdnWhenError(paras, errStr);
        } else{
            showLivePlayerMsg(paras, errStr);
        }

        return;
    }



    if(isLiveHlsJsSupported()) {

        createH5LivePlayerElement(paras.divId);


        if(!livePlayerObjs.isLoadLiveJs) {
            livePlayerObjs.isLoadLiveJs = true;
            loadLiveScript(playerUrl, initLiveH5Player, paras);
        } else{
            if(typeof LiveControlsBar !== "undefined") {
                clearInterval(livePlayerObjs[paras.divId].loadLiveTimer);
                initLiveH5Player(paras);
            } else{
                var checkCount = 0;
                livePlayerObjs[paras.divId].loadLiveTimer = setInterval(function () {
                    checkCount++;
                    if(checkCount > 50) {
                        clearInterval(livePlayerObjs[paras.divId].loadLiveTimer);
                    }
                    if(typeof LiveControlsBar !== "undefined") {
                        clearInterval(livePlayerObjs[paras.divId].loadLiveTimer);
                        initLiveH5Player(paras);
                    }
                }, 200);
            }

        }


    } else{

        LazyLoad.js("./39/js-ios/common.js");
        LazyLoad.js("./39/js-ios/ios-player.js?"+getRandom());
        LazyLoad.js("liveplayer_controls.js",function(){
            initCanvas(paras);
            new LiveControlsBar(paras);

        });
    }


    if(isUseAliMonitor) {
        setCntvLiveMetadata(paras, "init");
    }



}





function createH5LivePlayerElement(divId) {
    var container = document.getElementById(divId);

    if(document.getElementById("h5player_"+divId)) {
        return;
    }
    var player = document.createElement("video");

    if(isMobleUseBrowserUi) {
        player.controls = true;
    } else{
        player.controls = false;
    }
    player.setAttribute("class", "videoNoTimeline videoNoTimeline1 videoNoTimeline2");

    //player.muted = true;
    player.autoplay = true;
    player.setAttribute("webkit-playsinline", "webkit-playsinline");
    player.setAttribute("playsinline", "");
    player.setAttribute("controlslist", "nodownload");

    player.setAttribute("x-webkit-airplay", "allow");

    //player.setAttribute("x5-video-player-type", "h5");

    //player.setAttribute("x5-video-orientation", "portrait");
    //player.setAttribute("x5-video-player-fullscreen", "true");



    player.setAttribute("x5-playsinline", "");
    player.preload = true;
    player.setAttribute("id", "h5player_" + divId);

    player.style.width = "100%";
    player.style.height = "100%";
    player.style.left = "0px";
    player.style.top = "0px";
    player.style.backgroundColor = "#000";

    var errorMsgDiv = document.getElementById("error_msg_"+divId);

    //是否用canvas
    if(isIPad()) {

        var container = document.getElementById(divId);
        if(!document.getElementById("h5canvas_"+divId)) {
            var canvas = document.createElement("canvas");
            canvas.id = "h5canvas_" + divId;

            /*
            canvas.style.width = container.clientWidth + "px";
            canvas.style.height = (container.clientWidth / 640)*360 + "px";
            canvas.width = (container.clientWidth)*window.devicePixelRatio;
            canvas.height = ((container.clientWidth / 640)*360)*window.devicePixelRatio;
            */

            //canvas.style.position = "absolute";
            //canvas.style.left = "0px";
            //canvas.style.top = "0px";
            canvas.style.width = "100%";
            canvas.style.height = "100%";
            canvas.style.display = "none";
            canvas.width = container.clientWidth*window.devicePixelRatio;
            canvas.height = container.clientHeight*window.devicePixelRatio;
            document.getElementById(divId).appendChild(canvas);

        }
        var canvas = document.getElementById("h5canvas_"+divId);
        if(isCanvasSupported(divId)) {

            if(errorMsgDiv && errorMsgDiv.style.display!=="none") {
                canvas.style.display = "none";
            } else{
                canvas.style.display = "block";
            }

            player.style.display = "none";
            document.body.appendChild(player);


        } else{
            container.removeChild(canvas);
            if(errorMsgDiv && errorMsgDiv.style.display!=="none") {
                player.style.display = "none";
            } else{

                player.style.display = "block";
            }


            container.appendChild(player);
        }
    } else{
        if(errorMsgDiv && errorMsgDiv.style.display!=="none") {
            player.style.display = "none";
        } else{

            player.style.display = "block";
        }
        container.appendChild(player);
    }



    if(!isMobleUseBrowserUi) {
        initH5LivePlayerEvents(divId);
    }




}


function initH5LivePlayerEvents(divId) {
    var player = document.getElementById("h5player_" + divId);
    var live_events = ["play", "playing", "canplay", "canplaythrough", "durationchange", "emptied", "abort", "ended", "pause", "seeked", "seeking", "stalled", "waiting", "error", "timeupdate", "contextmenu"];

    /*
    events.forEach(function (v) {
        player.addEventListener(v, function (evt) {
            if(document.getElementById("play_or_pause_play_"+divId)) {
                LivePlayOrPauseBtn.prototype.playOrPauseMouseout(divId);
            }
        }, false);
    });
    */

    live_events.forEach(function (v) {
        liveAddListener(player,v,captureLive);
    });

    if(isIPad()) {
        document.addEventListener('visibilitychange', function() {
            var isHidden = document.hidden;
            var player = document.getElementById("h5player_" + divId);

            if(isHidden) {
                if(player) {

                    player.pause();


                    livePlayerObjs[divId].LiveCanplaythroughTime = Date.parse(new Date())/1000;

                    if(isCanvasSupported(divId)) {
                        /*
                        var pageFullBtn = document.getElementById("player_pagefullscreen_"+divId);
                        if(pageFullBtn && pageFullBtn.getAttribute("isPageFullscreen")==="true") {

                            LivePageFullscreenBtn.pageFullscreenClick(divId, "yes");
                        }
                        */
                        clearInterval(livePlayerObjs[divId].canvasDrawTimer);
                    }


                    if(liveConvivaClient && liveConvivaClient.cleanupSession && livePlayerObjs[divId].convivaSessionKey!==undefined) {
                        try {
                            liveConvivaClient.cleanupSession(livePlayerObjs[divId].convivaSessionKey);
                            livePlayerObjs[divId].convivaSessionKey = undefined;
                        } catch (e) {

                        }

                    }


                    if(typeof goldlog!="undefined" && goldlog["h5player_"+divId] && typeof heartbeatStarted!=="undefined") {
                        heartbeatStarted = false;
                    }
                }
            } else{

                if(player) {


                    if(livePlayerObjs[divId].isLive && livePlayerObjs[divId].LiveCanplaythroughTime && (Date.parse(new Date())/1000-livePlayerObjs[divId].LiveCanplaythroughTime>livePlayerObjs.liveRetryTimeout)) {

                        if(document.getElementById("loading_"+divId)) {
                            document.getElementById("loading_"+divId).style.display = "block";
                        }
                        createLiveHls(livePlayerObjs[divId]);
                        livePlayerObjs[divId].LiveCanplaythroughTime = Date.parse(new Date())/1000;


                    } else{
                        if(isUseConvivaMonitor) {

                            setLiveConvivaMetadata(livePlayerObjs[divId]);
                        }

                        if(typeof goldlog!="undefined" && goldlog["h5player_"+divId] && typeof heartbeatStarted!=="undefined") {
                            heartbeatStarted = true;
                        }



                        player.play();

                        if(isCanvasSupported(divId) && typeof canvasLive!=="undefined") {
                            canvasLive(divId);
                        }



                    }



                }
            }
        }, false);


        //屏幕旋转时候的处理
        window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", function() {
            if (window.orientation === 180 || window.orientation === 0) {
                //console.log("竖屏");
                var canvases = document.getElementsByTagName("canvas");
                var videos = document.getElementsByTagName("video");
                var len = canvases.length;
                var canvas = null;
                var container = null;
                var divId = "";
                var fullTag = null;
                var isPageFullscreen = "false";

                for(var i=0; i<videos.length; i++) {
                    if(videos[i].getAttribute("id").indexOf("h5player_")!==-1) {
                        divId = videos[i].getAttribute("id").replace("h5player_", "");
                        var obj = document.getElementById("player_pagefullscreen_"+divId);
                        obj.setAttribute("isByClick", "true");

                        setTimeout(function () {
                            obj.setAttribute("isByClick", "false");
                        }, 500);
                    }
                }



                setTimeout(function () {

                    var _player_width = document.body.clientWidth|| window.innerWidth;
                    var _player_height = document.documentElement.clientHeight|| window.innerHeight;
                    _player_width = parseInt(_player_width);
                    _player_height = parseInt(_player_height);
                    if(_player_width/_player_height<1) {
                        _player_height = _player_width*9/16;
                    } else{
                        _player_width = _player_height*16/9;

                    }



                    for(var i=0; i<len; i++) {

                        if(canvases[i].getAttribute("id").indexOf("h5canvas_")!==-1) {
                            canvas = canvases[i];
                            divId = canvases[i].getAttribute("id").replace("h5canvas_", "");

                            var controlsBar = document.getElementById("control_bar_"+divId);


                            //canvas.width = _player_width*window.devicePixelRatio;
                            //canvas.height = _player_height*window.devicePixelRatio;
                            fullTag = document.getElementById("player_pagefullscreen_"+divId);
                            if(fullTag) {
                                isPageFullscreen = fullTag.getAttribute("isPageFullscreen");
                            }

                            container = document.getElementById(divId);

                            if(isPageFullscreen === "true") {
                                LivePageFullscreenBtn.prototype.pageFullsreenToCanvas(canvas, divId);

                                //调整控制条位置，防止被底部导航栏挡住
                                if((document.body.clientWidth|| window.innerWidth)/(document.documentElement.clientHeight|| window.innerHeight) < 1) {
                                    controlsBar.style.bottom = "80px";

                                } else{
                                    controlsBar.style.bottom = "0px";
                                }




                            } else{

                                container.style.width = _player_width + "px";
                                container.style.height = _player_height + "px";
                                LivePageFullscreenBtn.prototype.pageFullsreenToCanvas(canvas, divId, "nofull");

                                controlsBar.style.bottom = "0px";

                            }





                        }

                    }
                }, 380);



            }
            if (window.orientation === 90 || window.orientation === -90 ){
                //console.log("横屏");

                var canvases = document.getElementsByTagName("canvas");
                var videos = document.getElementsByTagName("video");
                var len = canvases.length;
                var canvas = null;
                var container = null;
                var divId = "";
                var fullTag = null;
                var isPageFullscreen = "false";

                for(var i=0; i<videos.length; i++) {
                    if(videos[i].getAttribute("id").indexOf("h5player_")!==-1) {
                        divId = videos[i].getAttribute("id").replace("h5player_", "");
                        var obj = document.getElementById("player_pagefullscreen_"+divId);
                        obj.setAttribute("isByClick", "true");

                        setTimeout(function () {
                            obj.setAttribute("isByClick", "false");
                        }, 500);
                    }
                }


                setTimeout(function () {

                    var _player_width = document.body.clientWidth|| window.innerWidth;
                    var _player_height = document.documentElement.clientHeight|| window.innerHeight;
                    _player_width = parseInt(_player_width);
                    _player_height = parseInt(_player_height);
                    if(_player_width/_player_height<1) {
                        _player_height = _player_width*9/16;
                    } else{
                        _player_width = _player_height*16/9;
                    }

                    for(var i=0; i<len; i++) {

                        if(canvases[i].getAttribute("id").indexOf("h5canvas_")!==-1) {
                            canvas = canvases[i];
                            divId = canvases[i].getAttribute("id").replace("h5canvas_", "");
                            var controlsBar = document.getElementById("control_bar_"+divId);

                            //canvas.width = _player_width*window.devicePixelRatio;
                            //canvas.height = _player_height*window.devicePixelRatio;


                            fullTag = document.getElementById("player_pagefullscreen_"+divId);
                            if(fullTag) {
                                isPageFullscreen = fullTag.getAttribute("isPageFullscreen");
                            }

                            if(isPageFullscreen === "true") {

                                LivePageFullscreenBtn.prototype.pageFullsreenToCanvas(canvas, divId);

                                //调整控制条位置，防止被底部导航栏挡住
                                if((document.body.clientWidth|| window.innerWidth)/(document.documentElement.clientHeight|| window.innerHeight) < 1) {
                                    controlsBar.style.bottom = "80px";
                                } else{
                                    controlsBar.style.bottom = "0px";
                                }

                            } else{
                                container = document.getElementById(divId);
                                container.style.width = _player_width + "px";
                                container.style.height = _player_height + "px";
                                LivePageFullscreenBtn.prototype.pageFullsreenToCanvas(canvas, divId, "nofull");

                                controlsBar.style.bottom = "0px";

                            }



                        }

                    }
                }, 380);

            }
        }, false);
    }

}


function removeH5LivePlayerEvents(divId) {
    var player = document.getElementById("h5player_" + divId);
    var live_events = ["play", "playing", "canplay", "canplaythrough", "durationchange", "emptied", "abort", "ended", "pause", "seeked", "seeking", "stalled", "waiting", "error", "timeupdate", "contextmenu"];

    live_events.forEach(function (v) {
        player.removeEventListener(v, captureLive, false);
    });
}




function captureLive(event) {
    if(event.target && event.target.id) {
        var divId = event.target.id.replace("h5player_", "");



        if(event.type=="canplaythrough") {
            livePlayerObjs[divId].LiveCanplaythroughTime = Date.parse(new Date())/1000;

            if(document.getElementById("loading_"+divId)) {
                document.getElementById("loading_"+divId).style.display = "none";
            }

            if(document.getElementById("h5canvas_"+divId)) {
                canvasLive(divId);
            }


        }

        if(event.type=="play" || event.type=="playing" || event.type=="seeked" && navigator.userAgent.toLowerCase().indexOf("micromessenger")>0 || (event.type == "timeupdate" && navigator.userAgent.toLowerCase().indexOf("edge")>0)) {

            livePlayerObjs[divId].video.playing = true;
            if(typeof LivePlayOrPauseBtn !== "undefined") {
                LivePlayOrPauseBtn.prototype.switchPlayOrPauseBtn(divId, "play");
            }

            if(document.getElementById("loading_"+divId)) {
                document.getElementById("loading_"+divId).style.display = "none";
            }


        }




        if(event.type=="waiting" || event.type == "pause" || event.type=="ended" || event.type == "error" || event.type=="seeking" && navigator.userAgent.toLowerCase().indexOf("micromessenger")>0) {
            livePlayerObjs[divId].video.playing = false;

            if(typeof LivePlayOrPauseBtn !== "undefined") {
                LivePlayOrPauseBtn.prototype.switchPlayOrPauseBtn(divId, "pause");

            }

            if(event.type=="waiting" || event.type=="seeking" && navigator.userAgent.toLowerCase().indexOf("micromessenger")>0) {
                if(document.getElementById("loading_"+divId)) {
                    document.getElementById("loading_"+divId).style.display = "block";
                }
            }



            if(event.type=="ended" && document.getElementById("player_progress_cached_"+divId)) {
                document.getElementById("player_progress_cached_"+divId).style.width = "0%";
            }



            if(event.type == "ended") {
                livePlayerObjs[divId].isEnd = true;
                if(liveConvivaClient && liveConvivaClient.cleanupSession && livePlayerObjs[divId].convivaSessionKey!==undefined) {

                    liveConvivaClient.cleanupSession(livePlayerObjs[divId].convivaSessionKey);
                    livePlayerObjs[divId].convivaSessionKey = undefined;

                }

                if(typeof goldlog!="undefined" && goldlog["h5player_"+divId] && typeof heartbeatStarted!=="undefined") {
                    heartbeatStarted = false;
                }



            }

        }


        if(event.type=="durationchange" && isIPad() && livePlayerObjs[divId].video.duration) {
            var player = document.getElementById("h5player_"+divId);
            if(player) {
                if(player.duration>0 && Math.abs(1-player.duration/livePlayerObjs[divId].video.duration)<0.1 && Math.ceil(player.duration)!=Math.ceil(livePlayerObjs[divId].video.duration)) {
                    livePlayerObjs[divId].video.duration = player.duration;
                    if(document.getElementById("played_time_total_"+divId)) {
                        document.getElementById("played_time_total_"+divId).innerHTML = LivePlayTimeShow.prototype.formatTimeToStr(livePlayerObjs[divId].video.duration)
                    }
                }
            }
        }



    }

    if(event && event.type === "contextmenu") {
        event.preventDefault?(event.preventDefault()):(event.returnValue = false);
    }



}



function liveAddListener(obj,type,handler) {

    if(obj.attachEvent) {

        obj.attachEvent('on'+type,handler);
    } else if(obj.addEventListener) {

        obj.addEventListener(type,handler,false);
    }
}


function loadLiveScript(src, cb, paras, errorCb, timeout) {
    var _doc = document.getElementsByTagName("head")[0];
    var jsLoader= document.createElement('script');
    jsLoader.type= 'text/javascript';

    jsLoader.onload = function() {
        if(typeof cb === "function") {
            if(timeout && timeout<1000) {
                setTimeout(function () {

                    cb(paras);
                }, timeout);
            } else{
                cb(paras);
            }

        }
    };

    jsLoader.onerror = function() {
        if(typeof errorCb === "function") {
            errorCb(paras);
        }
    };
    jsLoader.src = src;
    _doc.appendChild(jsLoader);

    if(errorCb && timeout && timeout>=1000) {
        setTimeout(function () {
            errorCb(paras);
        }, timeout);
    }


}



function liveChangeWindowToNormal(playerId) {

    var containerId = playerId.replace("flashplayer_", "");
    var containerObj = document.getElementById(containerId);
    var obj = document.getElementById(playerId);
    var originalStyle = "";

    if(!containerObj || !obj) {
        return "false";
    }


    if(obj.getAttribute("originalStyle") && obj.getAttribute("originalStyle").length>3) {
        originalStyle = obj.getAttribute("originalStyle");
    } else{
        originalStyle = containerObj.getAttribute("style");
        obj.setAttribute("originalStyle", originalStyle);
    }

    containerObj.style.cssText = originalStyle;

    obj.setAttribute("isPageFullsreen", "false");
    document.body.style.overflow = "visible";

    if(typeof tellPageWhenNomalScreen !== "undefined") {
        tellPageWhenNomalScreen(containerId);
    }

    return "true";
}

function liveChangeWindowToWebFullSceen(playerId) {

    var containerId = playerId.replace("flashplayer_", "");

    var containerObj = document.getElementById(containerId);
    var obj = document.getElementById(playerId);
    var originalStyle = "";

    if(!containerObj || !obj) {
        return "false";
    }

    if(obj.getAttribute("originalStyle") && obj.getAttribute("originalStyle").length>3) {

        originalStyle = obj.getAttribute("originalStyle");
        containerObj.style.cssText = "";
    } else{
        originalStyle = containerObj.getAttribute("style");
        obj.setAttribute("originalStyle", originalStyle);
    }

    containerObj.style.position = "fixed";
    containerObj.style.zIndex = "999";
    containerObj.style.top = "0px";
    containerObj.style.left = "0px";
    containerObj.style.bottom = "0px";
    containerObj.style.width = "100%";
    containerObj.style.height = "auto";
    containerObj.style.maxHeight = "100%";

    obj.setAttribute("isPageFullsreen", "true");
    document.body.style.overflow = "hidden";

    if(typeof tellPageWhenFullScreen !== "undefined") {
        tellPageWhenFullScreen(containerId);
    }

    return "true";
}


/*
conviva start
 */

function initLiveConviva(paras) {
    if(typeof Conviva === "undefined") {
        return;
    }

    var systemSettings = new Conviva.SystemSettings();

    var systemInterface = new Conviva.SystemInterface(
        new Conviva.Impl.Html5Time(),
        new Conviva.Impl.Html5Timer(),
        new Conviva.Impl.Html5Http(),
        new Conviva.Impl.Html5Storage(),
        new Conviva.Impl.Html5Metadata(),
        new Conviva.Impl.Html5Logging()
    );
    systemFactory = new Conviva.SystemFactory(systemInterface, systemSettings);

    //Customer integration CUSTOMER_KEY
    var CUSTOMER_KEY = "03798c7108aa9ad57f419fa2a1c7e155f38a6343";
    var clientSettings = new Conviva.ClientSettings(CUSTOMER_KEY);
    clientSettings.gatewayUrl = "https://cws-cctv.conviva.com";
    liveConvivaClient = new Conviva.Client(clientSettings, systemFactory);
    liveConvivaPlayerStateManager = liveConvivaClient.getPlayerStateManager();
}


function createFlvHtml5ConvivaEvent(paras) {
    var voice = "no";
    var eventAttributes = {
        "assetName": paras.t,
        "device": "[WEB.HTML5].[HTML5].[2019.09.23.01]",
        "client": "[" + livePlayerObjs[paras.divId].vdn.vdnISPCode + "].[" + livePlayerObjs[paras.divId].vdn.vdnCityCode + "].[" + livePlayerObjs[paras.divId].vdn.vdnProvinceCode + "].[" + livePlayerObjs[paras.divId].vdn.vdnCountryCode + "].[" + livePlayerObjs[paras.divId].vdn.vdnIP + "]",
        "voice": voice
    };
    var checkTimer = setInterval(function (){
        if(liveConvivaClient && typeof(Conviva)!="undefined") {
            clearInterval(checkTimer);
            liveConvivaClient.sendCustomEvent(Conviva.Client.NO_SESSION_KEY, "NO_COPYRIGHT_EVENT", eventAttributes);
        }
    }, 50);

}



function createLiveConvivaSession(paras, errorMsg) {
    if(liveConvivaClient && liveConvivaPlayerStateManager) {

        if(liveConvivaClient && liveConvivaClient.cleanupSession && livePlayerObjs[paras.divId].convivaSessionKey!==undefined) {

            try {
                liveConvivaClient.cleanupSession(livePlayerObjs[paras.divId].convivaSessionKey);
                livePlayerObjs[paras.divId].convivaSessionKey = undefined;

            } catch (e) {

            }

        }

        //Create metadata
        var contentMetadata = new Conviva.ContentMetadata();

        contentMetadata.streamUrl = livePlayerObjs[paras.divId].video.url;

        if(!livePlayerObjs[paras.divId].video.url) {
            contentMetadata.streamUrl = livePlayerObjs[paras.divId].vdn.vdnUrl;
        }

        contentMetadata.streamType = Conviva.ContentMetadata.StreamType.LIVE;

        var tags = {};



        contentMetadata.assetName = paras.t;


        if(isIPad()) {
            liveConvivaPlayerStateManager.setBitrateKbps(900);
            contentMetadata.defaultBitrateKbps = Math.floor(900); // in Kbps
            tags.playAMR = "F";
        } else{
            liveConvivaPlayerStateManager.setBitrateKbps(1780);
            contentMetadata.defaultBitrateKbps = Math.floor(1780); // in Kbps
            tags.playAMR = "T";
        }

        if(livePlayerObjs[paras.divId].vdn.public === "2") {

            tags.streamProtocol = "hls6";
            contentMetadata.applicationName = "HTML5_LIVE_AUDIO_PLAYER";
        } else{

            tags.streamProtocol = "HLS";
            if(paras.playerType === "liveback") {
                contentMetadata.applicationName = "HTML5_LIVEBACK_DRM_PLAYER";
            } else{
                contentMetadata.applicationName = "HTML5_CDN_LIVE_DRM_PLAYER";
            }

        }




        contentMetadata.defaultResource = livePlayerObjs[paras.divId].vdn.cdnName;

        if(typeof(userid) != "undefined" && typeof(userid) == "string") {
            contentMetadata.viewerId = userid;
        } else{
            contentMetadata.viewerId = getCookie_vdn("Fingerprint") ? getCookie_vdn("Fingerprint"):"";
        }



        tags.cdnCode = livePlayerObjs[paras.divId].vdn.cdnName;
        if(isIPad()) {
            tags.playScene = "HTML5.PHD";
        } else{
            tags.playScene = "HTML5.PC";
        }

        tags.appName = "WEB.HTML5";

        tags.channel = paras.t;
        tags.contentId = paras.t;

        var urlSplit = location.href.split("/");
        if(urlSplit.length > 1) {
            tags.site = urlSplit[2];
        }



        tags.playerVersion = "2019.09.23.01";
        tags.referURL = location.href.substr(0, 127);
        tags.videoProfileType = "VDN";
        tags.P2PStyle = "F";


        tags.streamMBR = "1";
        tags.streamReload = "F";



        tags.cdncip = "0";
        tags.cdnsip = "0";
        tags.crbPath = "";




        if(/(iphone|ipad)/i.test(navigator.userAgent)) {
            tags.convivaPrefix = "HTML5.IOS";
        } else if(/(Android)/i.test(navigator.userAgent)) {
            tags.convivaPrefix = "HTML5.AND";
        } else if(/windows|win32/i.test(navigator.userAgent)) {
            tags.convivaPrefix = "HTML5.WIN";
        } else if(/macintosh|mac os x/i.test(navigator.userAgent)) {
            tags.convivaPrefix = "HTML5.MAC";
        } else {
            tags.convivaPrefix = "";
        }



        tags.vdnSID = livePlayerObjs[paras.divId].vdn.sid;
        tags.vdnIP = livePlayerObjs[paras.divId].vdn.vdnIP;
        tags.vdnCountryCode = livePlayerObjs[paras.divId].vdn.vdnCountryCode;
        tags.vdnProvinceCode = livePlayerObjs[paras.divId].vdn.vdnProvinceCode;
        tags.vdnCityCode = livePlayerObjs[paras.divId].vdn.vdnCityCode;
        tags.vdnISPCode = livePlayerObjs[paras.divId].vdn.vdnISPCode;

        if(Array.isArray(livePlayerObjs.adCallsAPI) && livePlayerObjs.adCallsAPI.length>0) {
            tags.hasAds = "T";
        } else{
            tags.hasAds = "F";
        }

        tags.playerAlterName = "live_html5";
        tags.playerType = paras.playerType;
        if(isLiveHlsJsSupported()) {
            tags.playerFrame = "video";
        } else{
            tags.playerFrame = "canvas";
        }

        contentMetadata.custom = tags;

        var videoElement = document.getElementById("h5player_" + paras.divId);

        // Create a Conviva monitoring session.



        livePlayerObjs[paras.divId].convivaSessionKey = liveConvivaClient.createSession(contentMetadata);
        livePlayerObjs[paras.divId].convivaSessionCreated = true;



        //vdn请求失败后的报错
        if(!livePlayerObjs[paras.divId].video.url || errorMsg) {
            liveConvivaClient.reportError(
                livePlayerObjs[paras.divId].convivaSessionKey,
                errorMsg?errorMsg:"VDN_REQUEST_FAILED",
                Conviva.Client.ErrorSeverity.FATAL
            );

            liveConvivaClient.cleanupSession(livePlayerObjs[paras.divId].convivaSessionKey);
            livePlayerObjs[paras.divId].convivaSessionKey = undefined;
            return;
        } else {
            // var html5PlayerInterface = new Html5PlayerInterface(liveConvivaPlayerStateManager, videoElement);
            var html5PlayerInterface = new Conviva.Impl.Html5PlayerInterface (liveConvivaPlayerStateManager, videoElement, systemFactory);

        }


        // sessionKey was obtained as shown above
        liveConvivaClient.attachPlayer(livePlayerObjs[paras.divId].convivaSessionKey, liveConvivaPlayerStateManager);

        videoElement.addEventListener('error', function() {
            if(livePlayerObjs[paras.divId].adCallsIsPlayed) {
                cleanupSession();
            }

        });
        videoElement.addEventListener('ended', function() {
            if(livePlayerObjs[paras.divId].adCallsIsPlayed && document.getElementById("control_bar_"+paras.divId)) {
                cleanupSession();
            }
        });

        window.addEventListener('beforeunload', function(){
            cleanupSession();
        });

        function cleanupSession() {
            liveConvivaClient.cleanupSession(livePlayerObjs[paras.divId].convivaSessionKey);
            livePlayerObjs[paras.divId].convivaSessionKey = undefined;
        }
    }

}

function setLiveConvivaMetadata(paras, errorMsg) {

    if(livePlayerObjs.convivaJsLoaded && document.getElementById("h5player_"+paras.divId)) {
        createLiveConvivaSession(paras, errorMsg);
    } else {
        var checkTimeout = 0;
        var checkSessionTimer = setInterval(function() {
            checkTimeout++;

            if(liveConvivaClient && liveConvivaPlayerStateManager && checkTimeout<32 && document.getElementById("h5player_"+paras.divId)) {
                clearInterval(checkSessionTimer);
                createLiveConvivaSession(paras, errorMsg);

                if (checkTimeout > 30) {
                    clearInterval(checkSessionTimer);
                }
            }

        }, 300);
    }



}


/*
conviva end
 */


/*
data collect start
 */

function liveAdCallsStartPlay(paras) {
    if(!livePlayerObjs[paras.divId].adCallsIsPlayed) {
        if(!livePlayerObjs.adCallsAPI[livePlayerObjs.adCallsPlayingNum].endLoad && livePlayerObjs.adCallsAPI[livePlayerObjs.adCallsPlayingNum].startLoad) {
            livePlayerObjs.adCallsAPI[livePlayerObjs.adCallsPlayingNum].endLoad = Date.parse(new Date());
            livePlayerObjs.adCallsAPI[livePlayerObjs.adCallsPlayingNum].loadTime = livePlayerObjs.adCallsAPI[livePlayerObjs.adCallsPlayingNum].endLoad - livePlayerObjs.adCallsAPI[livePlayerObjs.adCallsPlayingNum].startLoad;

            if(isUseAliMonitor) {
                sendLiveAliAdCallsRequestData(paras, "play.1.42");
            }
        }

    }
}



function sendLiveAdCallsDataByAliApi(paras, type) {

    var para = "";
    var playerId = "h5player_" + paras.divId;
    var loadStart = 0;

    var videoData = {
        type: "LIVE",
        ad_url: livePlayerObjs.adCallsAPI[livePlayerObjs.adCallsPlayingNum].hlsUrl,
        ad_v_id: livePlayerObjs.adCallsAPI[livePlayerObjs.adCallsPlayingNum].guid,
        ad_sum: livePlayerObjs.adCallsAPI.length,
        ad_num: livePlayerObjs.adCallsPlayingNum+1,
        ad_len: livePlayerObjs.adCallsAPI.length*15,
        v_id: paras.t,
        channel: paras.t,
        playerversion: "2019.09.19.01",
        bit: "900",
        streamProtocol: "HLS",
        referURL: encodeURIComponent(location.href.substr(0, 127)),
        cdnCode: livePlayerObjs.adCallsAPI[livePlayerObjs.adCallsPlayingNum].cdnCode,
        videoProfile: "vdn"

    };

    if(goldlog[playerId] && goldlog[playerId].createTime) {
        loadStart = goldlog[playerId].createTime;

    } else{
        loadStart = Date.parse(new Date())/1000;
        goldlog[playerId] = {};
        goldlog[playerId].createTime = loadStart;
    }

    videoData.createTime = loadStart;
    videoData.loadTime = livePlayerObjs.adCallsAPI[livePlayerObjs.adCallsPlayingNum].loadTime;


    if(document.referrer) {
        videoData.referer = encodeURIComponent(document.referrer.substr(0, 127));
    }

    var paraKeys = Object.keys(videoData);

    paraKeys.forEach(function(item) {
        para += "&" + item + "=" + videoData[item];

    });

    goldlog.record("/"+type,"","playScene=H5"+para,"");

}

function sendLiveAliAdCallsRequestData(paras, type) {

    if(typeof goldlog !== "undefined" && document.getElementById("h5player_"+paras.divId)) {
        sendLiveAdCallsDataByAliApi(paras, type);
        return;
    }

    var checkTimeout = 0;
    var checkTimer = setInterval(function () {
        checkTimeout++;

        if(checkTimeout > 50){
            clearInterval(checkTimer);
            return;
        }

        if(typeof goldlog !== "undefined" && document.getElementById("h5player_"+paras.divId)) {
            clearInterval(checkTimer);
            sendLiveAdCallsDataByAliApi(paras, type);
        }
    }, 150);
}

function setCntvLiveMetadata(paras, msgType, errorMsg) {


    var videoId = "h5player_" + paras.divId;
    var videoData = null;
    var urlSplit = "";

    if(msgType=="690003") {
        videoData = {
            playScene: "H5",
            type: "LIVE",
            column: paras.t,
            v_id: paras.t,
            channel: paras.t,
            column: paras.t,
            ver: "2019.09.19.01",
            applicationName: "CNTV_HTML5_PLAYER",
            playerName: isIPad()?"h5_m":"h5_pc",
            streamType: livePlayerObjs[paras.divId].isLive?"live":"liveback",
            assetName: paras.t,
            streamUrl: "",
            playAMR: "F",
            streamMBR: "1",
            bit: "900",
            streamProtocol: "HLS",
            videoProfile: "vdn",
            error_code: msgType,
            error_info: errorMsg
        };

        urlSplit = location.href.split("/");
        if(urlSplit.length > 1 && typeof(goldlog) != "undefined" && typeof(goldlog.initSession) != "undefined") {
            videoData.site = encodeURIComponent(urlSplit[2]);
        }
        if(typeof(goldlog) != "undefined" && typeof(goldlog.initSession) != "undefined") {
            goldlog.initSession(videoId, videoData);
        }

    } else{
        var checkTimeout = 0;
        var checkSessionTimer = setInterval(function (){
            checkTimeout++;

            if(checkTimeout > 50){
                clearInterval(checkSessionTimer);
                return;
            }

            if(typeof(goldlog) != "undefined" && typeof(goldlog.startSession) != "undefined") {
                clearInterval(checkSessionTimer);

                videoData = {
                    playScene: "H5",
                    column: paras.t,
                    v_id: paras.t,
                    channel: paras.t,
                    ver: "2019.09.19.01",
                    applicationName: "CNTV_HTML5_PLAYER",
                    playerName: isIPad()?"h5_m":"h5_pc",
                    streamType: livePlayerObjs[paras.divId].isLive?"live":"liveback",
                    assetName: paras.t,
                    streamUrl: encodeURIComponent(livePlayerObjs[paras.divId].video.url),
                    playAMR: "F",
                    streamMBR: "1",
                    bit: "900",
                    streamProtocol: "HLS",
                    cdnCode: livePlayerObjs[paras.divId].vdn.cdnName,
                    videoProfile: "vdn",
                    vdnSID: livePlayerObjs[paras.divId].vdn.convivaVdnSid,
                    vdnIP: livePlayerObjs[paras.divId].vdn.vdnIP,
                    vdnCountryCode: livePlayerObjs[paras.divId].vdn.vdnCountryCode,
                    vdnProvinceCode: livePlayerObjs[paras.divId].vdn.vdnProvinceCode,
                    vdnCityCode: livePlayerObjs[paras.divId].vdn.vdnCityCode,
                    vdnISPCode: livePlayerObjs[paras.divId].vdn.vdnISPCode,
                    public: livePlayerObjs[paras.divId].vdn.public

                };


                var urlSplit = location.href.split("/");
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

/*
data collect end
 */



function doLoadLiveAliAnalyticsJs(paras) {

    var jsLoader = createElementByType("script","convivaJs237","absolute","0px","0px","0px","0px");
    if(paras.isHttps==="true") {

        jsLoader.src = "https://js.data.cctv.com/__aplus_plugin_cctv.js,aplus_plugin_aplus_u.js";
    } else{
        jsLoader.src = "http://js.data.cctv.com/__aplus_plugin_cctv.js,aplus_plugin_aplus_u.js";
    }


    var _doc = document.getElementsByTagName('head')[0];
    _doc.appendChild(jsLoader);
}


function isLiveHlsJsSupported() {
    var mediaSource = window.MediaSource || window.WebKitMediaSource;
    if (!mediaSource) {
        return false;
    }

    if(/(iphone|ipad)/i.test(navigator.userAgent)) {
        return false;
    }

    // var isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    // if(isSafari){
    //     return false;
    // }
    var sourceBuffer = SourceBuffer || window.WebKitSourceBuffer;
    var isTypeSupported = mediaSource && typeof mediaSource.isTypeSupported === 'function' && mediaSource.isTypeSupported('video/mp4; codecs="avc1.42E01E,mp4a.40.2"'); // if SourceBuffer is exposed ensure its API is valid
    // safari and old version of Chrome doe not expose SourceBuffer globally so checking SourceBuffer.prototype is impossible
    var sourceBufferValidAPI = !sourceBuffer || sourceBuffer.prototype && typeof sourceBuffer.prototype.appendBuffer === 'function' && typeof sourceBuffer.prototype.remove === 'function';
    return !!isTypeSupported && !!sourceBufferValidAPI;
}


function isWasmSupported() {
    try {
        if (typeof WebAssembly === "object"
            && typeof WebAssembly.instantiate === "function") {
            var module = new WebAssembly.Module(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
            if (module instanceof WebAssembly.Module)
                return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
        }
    } catch (e) {
    }
    return false;
}



function getFlashVer(){//获得flashplayer的版本 google
    var fls=flashChecker();
    var s="";
    if(fls.f&&(fls.v>=10)) isFlashPlayer = true;
    else isFlashPlayer = false;
}


function flashChecker(){
    var hasFlash=0;         //是否安装了flash
    var flashVersion=0; //flash版本
    var isIE=/*@cc_on!@*/0;      //是否IE浏览器

    if(isIE) {
        try{
            var swf = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
            if(swf) {
                hasFlash=1;
                VSwf=swf.GetVariable("$version");
                flashVersion=parseInt(VSwf.split(" ")[1].split(",")[0]);
            }
        }catch(e)
        {
            //alert(e);
        }
    }else{
        if (navigator.plugins && navigator.plugins.length > 0)
        {
            try{
                var swf=navigator.plugins["Shockwave Flash"];
                if (swf)
                {
                    hasFlash=1;
                    var words = swf.description.split(" ");
                    for (var i = 0; i < words.length; ++i)
                    {
                        if (isNaN(parseInt(words[i]))) continue;
                        flashVersion = parseInt(words[i]);

                        if(!isIPad() && getChromeVersion()>=55 && flashVersion>=23 && swf.filename==="internal-not-yet-present"){
                            flashVersion = 22;
                        }
                    }
                }
            }catch(e){
                //alert(e);
            }
        }
    }
    return {
        f:hasFlash,
        v:flashVersion
    };
}


function showLivePlayerPosterImg(paras) {
    var container = document.getElementById(paras.divId);
    var htmls = "";
    if(paras.posterImg && paras.posterImg.length>3) {

        htmls = '<div id="poster_' + paras.divId + '" style="position:absolute;top:0px;left:0px;margin:0 auto;text-align:center;width:100%;height:100%;cursor:pointer;z-index:20;">';
        htmls += '<img src="' + paras.posterImg + '" style="width:100%;height:100%;">';
        htmls += '</div>';

        document.getElementById(paras.divId).insertAdjacentHTML("afterBegin", htmls);
    }


    htmls = '<div id="poster_playbtn_' + paras.divId + '" style="position:absolute;bottom:0px;left:9px;width:48px;height:48px;cursor:pointer;z-index:23;">';
    htmls += '<img src="//player.cntv.cn/html5Player/images/20190905/play.png" style="width:30px;height:30px;padding:9px;">';
    htmls += '</div>';

    document.getElementById(paras.divId).insertAdjacentHTML("afterBegin", htmls);


    document.getElementById("poster_playbtn_"+paras.divId).addEventListener("click", function (ev) {
        container.removeChild(this);
        if(document.getElementById("poster_"+paras.divId)) {
            container.removeChild(document.getElementById("poster_"+paras.divId));
        }
        paras.posterImg = "";
        paras.isAutoPlay = "true";
        createLivePlayer(paras);
    }, false);
}

function showLivePlayerMsg(paras, errorMsg) {
    destroyH5LiveHls(paras);

    var container = document.getElementById(paras.divId);
    if(document.getElementById("h5player_"+paras.divId)) {
        document.getElementById("h5player_"+paras.divId).style.display = "none";
    }

    if(document.getElementById("h5canvas_"+paras.divId)) {
        document.getElementById("h5canvas_"+paras.divId).style.display = "none";
    }

    if(document.getElementById("control_bar_"+paras.divId)) {

        document.getElementById("control_bar_"+paras.divId).style.display = "none";
    }

    container.style.backgroundImage = "url('//t.live.cntv.cn/cntvwebplay/cntvplayer/images/plug-in_bg.gif')";
    container.style.backgroundRepeat = "no-repeat";
    container.style.backgroundPosition = "0px 0px";
    container.style.backgroundSize = "100% 100%";

    var msgDiv = document.getElementById("error_msg_"+paras.divId);
    if(!msgDiv) {
        msgDiv = createElementByType("div", "error_msg_"+paras.divId, "absolute", "100%", "100%", "0", "0");
        msgDiv.style.cssText = "position:absolute;width:100%;top:50%;color:#FFF;font-size:16px;word-break:break-all;font-family:PingFangSC-Regular,Helvetica,Arial,Microsoft Yahei,sans-serif;margin:0 auto;text-align:center;";
        container.appendChild(msgDiv);
    }

    msgDiv.innerHTML = errorMsg;


}


function  showInstallFlashPlayerMsg(playerId, w, h) {

    var msg = "请点此安装最新Flash";
    var str = "<div class=\"flash_install\"><a style='color:#cccccc;font-size:16px;text-decoration:underline;' href=\"http://www.adobe.com/go/getflashplayer_cn\" onfocus=\"this.blur()\"><img style=\"display:inline-block\" src=\"http://player.cntv.cn/flashplayer/logo/get_adobe_flash_player.png\"/><p style='margin-top:8px;color:#cccccc'>" + msg + "</p></a></div>";

    if(playerId=== "vplayer" && document.getElementById("myFlash") && !document.getElementById("vplayer"))
    {
        playerId = "myFlash";
    }
    var result_box = document.getElementById(playerId);

    var bg =  document.createElement("img");
    bg.position = "absolute";
    bg.src = "http://t.live.cntv.cn/cntvwebplay/cntvplayer/images/plug-in_bg.gif";
    var bgWidth = w;
    var bgHeight = h;
    bg.width = bgWidth;
    bg.height = bgHeight;
    result_box.style.lineHeight = "20px";
    result_box.appendChild(bg);

    var errorPanel = document.createElement("div");
    errorPanel.style.position = "relative";
    errorPanel.style.margin = "0 auto";
    errorPanel.style.left = "0";
    errorPanel.style.width = w + "px";
    errorPanel.style.textAlign = "center";
    errorPanel.style.top = -parseInt(2*bg.height/5) + "px";
    errorPanel.style.color = "#dddddd";
    errorPanel.style.fontSize = "16px";
    errorPanel.style.fontWeight = "bold";
    errorPanel.innerHTML = str;
    errorPanel.align = "center";
    result_box.appendChild(errorPanel);

    return;
}

function isDrmLegalDomainUrl() {
    var legalDomainArr = ["cctv.com", "cntv.cn"];
    var isLegal = false;
    var urlArr = window.location.href.split("/");
    domainUrl = urlArr[2];
    urlArr = domainUrl.split(".");
    domainUrl = urlArr[urlArr.length-2] + "." + urlArr[urlArr.length-1];

    for(var i=0; i<legalDomainArr.length; i++) {
        if(legalDomainArr[i] === domainUrl) {
            isLegal = true;
            break;
        }
    }

    try {

        if(window.top && window.top!=window.parent) {
            isLegal = false;
        }
    } catch (e) {
    }

    return isLegal;
}

function isIPad() {
    return /(iphone|ipad)/i.test(navigator.userAgent) || /(Android)/i.test(navigator.userAgent);
}

function isCanvasSupported(divId) {
    var isSupported = false;
    var canvas = document.getElementById("h5canvas_"+divId);
    if(canvas && canvas.getContext && isIPad()) {
        isSupported = true;
    }

    var ua = navigator.userAgent.toLowerCase();

    if(ua.indexOf("oppobrowser")>0 || ua.indexOf("firefox")>0 || ua.indexOf("liebao")>0) {
        isSupported = false;
    }
    return isSupported;
}


function createElementByType(type,_id,position,_w,_h,_l,_t) {
    var el = document.createElement(type);
    el.setAttribute("id",_id);
    el.style.position = position;
    el.style.width = _w;
    el.style.height = _h;
    el.style.left = _l;
    el.style.top = _t;
    return el;
}


function IsMaxthon() {
    try{
        window.external.max_invoke("GetHotKey");
        return true;
    }catch(ex){
        return false;
    }
}


//动态加载指纹js文件fingerprint2.js
function getfingerprint2(){

    var _doc = document.getElementsByTagName("head")[0];
    var jsLoader = createElementByType("script","jsFingerLoader","absolute","0px","0px","0px","0px");
    if(livePlayerObjs.isHttps === "true") {
        jsLoader.src = "https://js.player.cntv.cn/creator/fingerprint2.js";
    } else{
        jsLoader.src = "http://js.player.cntv.cn/creator/fingerprint2.js";
    }

    _doc.appendChild(jsLoader);
    if(typeof jsLoader.onload != "undefined"){

        jsLoader.onload = function() {
            getFingerprint();
        };
    }

    if(typeof jsLoader.onreadystatechange != "undefined"){
        jsLoader.onreadystatechange = function(){
            if (jsLoader.readyState == 'loaded' || jsLoader.readyState == 'complete'){
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
    } catch (e) {

    }

}
//删除cookie方法
function removeCookie_vdn(key) {
    setCookie_vdn(key,"",-1);
}
//获取cookie方法
function getCookie_vdn( key ) {

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
//定义指纹信息在cookie中的key值
function getFingerprint() {
    var fp = new Fingerprint2();
    fp.get(function(result) {
        setCookie_vdn("Fingerprint",result.toUpperCase(),7);
    });
}


function thisMovie(movieName) {
    if (navigator.appName.indexOf("Microsoft") != -1) {
        return window[movieName];
    } else {
        return document[movieName];
    }
}


var clientInfo={os:null,browser:null,broserVersion:null,osVersion:null};
(function() {

    var BrowserDetect = {
        init: function () {
            this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
            this.version = this.searchVersion(navigator.userAgent)
                || this.searchVersion(navigator.appVersion)
                || "an unknown version";
            this.OS = this.searchString(this.dataOS) || "an unknown OS";
        },
        searchString: function (data) {
            for (var i=0;i<data.length;i++)	{
                var dataString = data[i].string;
                var dataProp = data[i].prop;
                this.versionSearchString = data[i].versionSearch || data[i].identity;
                if (dataString) {
                    if (dataString.indexOf(data[i].subString) != -1)
                        return data[i].identity;
                }
                else if (dataProp)
                    return data[i].identity;
            }
        },
        searchVersion: function (dataString) {
            var index = dataString.indexOf(this.versionSearchString);
            if (index == -1) return;
            return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
        },
        dataBrowser: [
            {
                string: navigator.userAgent,
                subString: "Chrome",
                identity: "Chrome"
            },
            { 	string: navigator.userAgent,
                subString: "OmniWeb",
                versionSearch: "OmniWeb/",
                identity: "OmniWeb"
            },
            {
                string: navigator.vendor,
                subString: "Apple",
                identity: "Safari",
                versionSearch: "Version"
            },
            {
                prop: window.opera,
                identity: "Opera"
            },
            {
                string: navigator.vendor,
                subString: "iCab",
                identity: "iCab"
            },
            {
                string: navigator.vendor,
                subString: "KDE",
                identity: "Konqueror"
            },
            {
                string: navigator.userAgent,
                subString: "Firefox",
                identity: "Firefox"
            },
            {
                string: navigator.vendor,
                subString: "Camino",
                identity: "Camino"
            },
            {		// for newer Netscapes (6+)
                string: navigator.userAgent,
                subString: "Netscape",
                identity: "Netscape"
            },
            {
                string: navigator.userAgent,
                subString: "MSIE",
                identity: "Explorer",
                versionSearch: "MSIE"
            },
            {
                string: navigator.userAgent,
                subString: "Gecko",
                identity: "Mozilla",
                versionSearch: "rv"
            },
            { 		// for older Netscapes (4-)
                string: navigator.userAgent,
                subString: "Mozilla",
                identity: "Netscape",
                versionSearch: "Mozilla"
            }
        ],
        dataOS : [
            {
                string: navigator.platform,
                subString: "Win",
                identity: "Windows"
            },
            {
                string: navigator.platform,
                subString: "Mac",
                identity: "Mac"
            },
            {
                string: navigator.userAgent,
                subString: "iPhone",
                identity: "iPhone/iPod"
            },
            {
                string: navigator.userAgent,
                subString: "iPad",
                identity: "iPad"
            },
            {
                string: navigator.platform,
                subString: "Linux",
                identity: "Linux"
            }
        ]
    };
    BrowserDetect.init();
    clientInfo.os = BrowserDetect.OS;
    clientInfo.browser = BrowserDetect.browser;
    clientInfo.broserVersion  = BrowserDetect.version;
})();





!function(a){"use strict";function b(a,b){var c=(65535&a)+(65535&b),d=(a>>16)+(b>>16)+(c>>16);return d<<16|65535&c}function c(a,b){return a<<b|a>>>32-b}function d(a,d,e,f,g,h){return b(c(b(b(d,a),b(f,h)),g),e)}function e(a,b,c,e,f,g,h){return d(b&c|~b&e,a,b,f,g,h)}function f(a,b,c,e,f,g,h){return d(b&e|c&~e,a,b,f,g,h)}function g(a,b,c,e,f,g,h){return d(b^c^e,a,b,f,g,h)}function h(a,b,c,e,f,g,h){return d(c^(b|~e),a,b,f,g,h)}function i(a,c){a[c>>5]|=128<<c%32,a[(c+64>>>9<<4)+14]=c;var d,i,j,k,l,m=1732584193,n=-271733879,o=-1732584194,p=271733878;for(d=0;d<a.length;d+=16)i=m,j=n,k=o,l=p,m=e(m,n,o,p,a[d],7,-680876936),p=e(p,m,n,o,a[d+1],12,-389564586),o=e(o,p,m,n,a[d+2],17,606105819),n=e(n,o,p,m,a[d+3],22,-1044525330),m=e(m,n,o,p,a[d+4],7,-176418897),p=e(p,m,n,o,a[d+5],12,1200080426),o=e(o,p,m,n,a[d+6],17,-1473231341),n=e(n,o,p,m,a[d+7],22,-45705983),m=e(m,n,o,p,a[d+8],7,1770035416),p=e(p,m,n,o,a[d+9],12,-1958414417),o=e(o,p,m,n,a[d+10],17,-42063),n=e(n,o,p,m,a[d+11],22,-1990404162),m=e(m,n,o,p,a[d+12],7,1804603682),p=e(p,m,n,o,a[d+13],12,-40341101),o=e(o,p,m,n,a[d+14],17,-1502002290),n=e(n,o,p,m,a[d+15],22,1236535329),m=f(m,n,o,p,a[d+1],5,-165796510),p=f(p,m,n,o,a[d+6],9,-1069501632),o=f(o,p,m,n,a[d+11],14,643717713),n=f(n,o,p,m,a[d],20,-373897302),m=f(m,n,o,p,a[d+5],5,-701558691),p=f(p,m,n,o,a[d+10],9,38016083),o=f(o,p,m,n,a[d+15],14,-660478335),n=f(n,o,p,m,a[d+4],20,-405537848),m=f(m,n,o,p,a[d+9],5,568446438),p=f(p,m,n,o,a[d+14],9,-1019803690),o=f(o,p,m,n,a[d+3],14,-187363961),n=f(n,o,p,m,a[d+8],20,1163531501),m=f(m,n,o,p,a[d+13],5,-1444681467),p=f(p,m,n,o,a[d+2],9,-51403784),o=f(o,p,m,n,a[d+7],14,1735328473),n=f(n,o,p,m,a[d+12],20,-1926607734),m=g(m,n,o,p,a[d+5],4,-378558),p=g(p,m,n,o,a[d+8],11,-2022574463),o=g(o,p,m,n,a[d+11],16,1839030562),n=g(n,o,p,m,a[d+14],23,-35309556),m=g(m,n,o,p,a[d+1],4,-1530992060),p=g(p,m,n,o,a[d+4],11,1272893353),o=g(o,p,m,n,a[d+7],16,-155497632),n=g(n,o,p,m,a[d+10],23,-1094730640),m=g(m,n,o,p,a[d+13],4,681279174),p=g(p,m,n,o,a[d],11,-358537222),o=g(o,p,m,n,a[d+3],16,-722521979),n=g(n,o,p,m,a[d+6],23,76029189),m=g(m,n,o,p,a[d+9],4,-640364487),p=g(p,m,n,o,a[d+12],11,-421815835),o=g(o,p,m,n,a[d+15],16,530742520),n=g(n,o,p,m,a[d+2],23,-995338651),m=h(m,n,o,p,a[d],6,-198630844),p=h(p,m,n,o,a[d+7],10,1126891415),o=h(o,p,m,n,a[d+14],15,-1416354905),n=h(n,o,p,m,a[d+5],21,-57434055),m=h(m,n,o,p,a[d+12],6,1700485571),p=h(p,m,n,o,a[d+3],10,-1894986606),o=h(o,p,m,n,a[d+10],15,-1051523),n=h(n,o,p,m,a[d+1],21,-2054922799),m=h(m,n,o,p,a[d+8],6,1873313359),p=h(p,m,n,o,a[d+15],10,-30611744),o=h(o,p,m,n,a[d+6],15,-1560198380),n=h(n,o,p,m,a[d+13],21,1309151649),m=h(m,n,o,p,a[d+4],6,-145523070),p=h(p,m,n,o,a[d+11],10,-1120210379),o=h(o,p,m,n,a[d+2],15,718787259),n=h(n,o,p,m,a[d+9],21,-343485551),m=b(m,i),n=b(n,j),o=b(o,k),p=b(p,l);return[m,n,o,p]}function j(a){var b,c="";for(b=0;b<32*a.length;b+=8)c+=String.fromCharCode(a[b>>5]>>>b%32&255);return c}function k(a){var b,c=[];for(c[(a.length>>2)-1]=void 0,b=0;b<c.length;b+=1)c[b]=0;for(b=0;b<8*a.length;b+=8)c[b>>5]|=(255&a.charCodeAt(b/8))<<b%32;return c}function l(a){return j(i(k(a),8*a.length))}function m(a,b){var c,d,e=k(a),f=[],g=[];for(f[15]=g[15]=void 0,e.length>16&&(e=i(e,8*a.length)),c=0;16>c;c+=1)f[c]=909522486^e[c],g[c]=1549556828^e[c];return d=i(f.concat(k(b)),512+8*b.length),j(i(g.concat(d),640))}function n(a){var b,c,d="0123456789abcdef",e="";for(c=0;c<a.length;c+=1)b=a.charCodeAt(c),e+=d.charAt(b>>>4&15)+d.charAt(15&b);return e}function o(a){return unescape(encodeURIComponent(a))}function p(a){return l(o(a))}function q(a){return n(p(a))}function r(a,b){return m(o(a),o(b))}function s(a,b){return n(r(a,b))}function t(a,b,c){return b?c?r(b,a):s(b,a):c?p(a):q(a)}"function"==typeof define&&define.amd?define(function(){return t}):a.setH5Str=t}(this);



LazyLoad=(function(doc){var env,head,pending={},pollCount=0,queue={css:[],js:[]},styleSheets=doc.styleSheets;function createNode(name,attrs){var node=doc.createElement(name),attr;for(attr in attrs){if(attrs.hasOwnProperty(attr)){node.setAttribute(attr,attrs[attr])}}return node}function finish(type){var p=pending[type],callback,urls;if(p){callback=p.callback;urls=p.urls;urls.shift();pollCount=0;if(!urls.length){callback&&callback.call(p.context,p.obj);pending[type]=null;queue[type].length&&load(type)}}}function getEnv(){var ua=navigator.userAgent;env={async:doc.createElement('script').async===true};(env.webkit=/AppleWebKit\//.test(ua))||(env.ie=/MSIE|Trident/.test(ua))||(env.opera=/Opera/.test(ua))||(env.gecko=/Gecko\//.test(ua))||(env.unknown=true)}function load(type,urls,callback,obj,context){var _finish=function(){finish(type)},isCSS=type==='css',nodes=[],i,len,node,p,pendingUrls,url;env||getEnv();if(urls){urls=typeof urls==='string'?[urls]:urls.concat();if(isCSS||env.async||env.gecko||env.opera){queue[type].push({urls:urls,callback:callback,obj:obj,context:context})}else{for(i=0,len=urls.length;i<len;++i){queue[type].push({urls:[urls[i]],callback:i===len-1?callback:null,obj:obj,context:context})}}}if(pending[type]||!(p=pending[type]=queue[type].shift())){return}head||(head=doc.head||doc.getElementsByTagName('head')[0]);pendingUrls=p.urls.concat();for(i=0,len=pendingUrls.length;i<len;++i){url=pendingUrls[i];if(isCSS){node=env.gecko?createNode('style'):createNode('link',{href:url,rel:'stylesheet'})}else{node=createNode('script',{src:url});node.async=false}node.className='lazyload';node.setAttribute('charset','utf-8');if(env.ie&&!isCSS&&'onreadystatechange'in node&&!('draggable'in node)){node.onreadystatechange=function(){if(/loaded|complete/.test(node.readyState)){node.onreadystatechange=null;_finish()}}}else if(isCSS&&(env.gecko||env.webkit)){if(env.webkit){p.urls[i]=node.href;pollWebKit()}else{node.innerHTML='@import "'+url+'";';pollGecko(node)}}else{node.onload=node.onerror=_finish}nodes.push(node)}for(i=0,len=nodes.length;i<len;++i){head.appendChild(nodes[i])}}function pollGecko(node){var hasRules;try{hasRules=!!node.sheet.cssRules}catch(ex){pollCount+=1;if(pollCount<200){setTimeout(function(){pollGecko(node)},50)}else{hasRules&&finish('css')}return}finish('css')}function pollWebKit(){var css=pending.css,i;if(css){i=styleSheets.length;while(--i>=0){if(styleSheets[i].href===css.urls[0]){finish('css');break}}pollCount+=1;if(css){if(pollCount<200){setTimeout(pollWebKit,50)}else{finish('css')}}}}return{css:function(urls,callback,obj,context){load('css',urls,callback,obj,context)},js:function(urls,callback,obj,context){load('js',urls,callback,obj,context)}}})(this.document);