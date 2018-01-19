/*
 * Copyright (c) 2013, 2017 Oracle and/or its affiliates. All rights reserved.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Distribution License v. 1.0, which is available at
 * http://www.eclipse.org/org/documents/edl-v10.php.
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

var output;
var debug = false;
var websocket;
var separator = ":";
var id = 0;
var name = "";

var endpointPath = "/auction";
var wsUri = getRootUri() + endpointPath;

/**
 * Get application root uri with ws/wss protocol.
 *
 * @returns {string}
 */
function getRootUri() {
    var uri = "ws://" + (document.location.hostname == "" ? "localhost" : document.location.hostname) + ":" +
        (document.location.port == "" ? "8080" : document.location.port);

    var pathname = window.location.pathname;

    if (endsWith(pathname, "/select.html")) {
        uri = uri + pathname.substring(0, pathname.length - 12);
    } else if (endsWith(pathname, "/")) {
        uri = uri + pathname.substring(0, pathname.length - 1);
    }

    return uri;
}

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function init() {
    output = document.getElementById("output");
    name = getParam("name");

    writeToScreen("init name: " + name);
    websocket = new WebSocket(wsUri);
    websocket.onopen = function (evt) {
        getData();
    };
    websocket.onmessage = function (evt) {
        handleResponse(evt)
    };
    websocket.onerror = function (evt) {
        onError(evt)
    };
}

function getData() {
    var myStr = "xreq" + separator + id + separator + "selectList";
    websocket.send(myStr);
}

function handleResponse(evt) {
    var mString = evt.data.toString();
    writeToScreen(evt.data);
    if (mString.search("xres") == 0) {
        var message = mString.substring(4, mString.length);
        var messageList = message.split('-'); // split on hyphen
        var i = 0;

        for (i = 1; i < messageList.length - 1; i += 2) {
            var val = messageList[i];
            var text = messageList[i + 1];
            document.getElementById("comboID").add(new Option(text, val), null);
        }
    }

    writeToScreen('<span style="color: blue;">RESPONSE: ' + evt.data + '</span>');
}

function selected() {
    writeToScreen("Select");
    var myselect = document.getElementById("comboID");
    for (var i = 0; i < myselect.options.length; i++) {
        if (myselect.options[i].selected == true) {
            var link = "auction.html" + "?id=" + myselect.options[i].value + "&name=" + name;
            break
        }
    }
    window.location = link;
}

function onError(evt) {
    writeToScreen('<span style="color: red;">ERROR:</span> ' + evt.data);
}

function writeToScreen(message) {
    if (debug) {
        var pre = document.createElement("p");
        pre.style.wordWrap = "break-word";
        pre.innerHTML = message;
        output.appendChild(pre);
    }
}

function getParam(sname) {
    var params = location.search.substr(location.search.indexOf("?") + 1);
    var sval = "";
    params = params.split("&");
    // split param and value into individual pieces
    for (var i = 0; i < params.length; i++) {
        var temp = params[i].split("=");
        if (temp[0] === sname) {
            sval = temp[1];
        }
    }
    return sval;
}

window.addEventListener("load", init, false);
