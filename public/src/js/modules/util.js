'use strict';
const ko = require('knockout');
const _ = require('lodash');
const moment = require('moment');

const util = {
    /**
     * URLクエリーパーサー
     *
     * @param query ?から始まるパースする文字列(e.g. window.location.search)
     * @returns {{}}
     */
    parseGetQuery: query => {
        const res = {};

        if (query.length > 1) {
            const params = query.substring(1).split('&');
            params.forEach(x => {
                const [key, val] = x.split('=');
                res[decodeURIComponent(key)] = decodeURIComponent(val);
            });
        }

        return res;
    },

    /**
     * 多次元配列の初期化
     *
     * @param dims [3, 2] = [[x,x], [x,x], [x,x]]
     * @param initValue
     * @returns {*[]}
     */
    initArray: (dims, initValue) => {
        if (dims.length) { return ko.unwrap(initValue); }

        const length = dims[0];
        const restDims = dims.slice(1);
        return _.times(length).map(() => util.initArray(restDims, initValue));
    },

    /**
     * 汎用比較関数
     * aとbが等しければ0を返す
     * bよりaのほうが小さければ-1を返す
     * bよりaのほうが大きければ1を返す
     * reverse == trueのとき、-1と1は反転する
     * @param a
     * @param b
     * @param reverse
     * @returns {number}
     */
    comp: (a, b, reverse = false) => {
        if (a === b) { return 0; }
        if (a < b) { return reverse ? 1 : -1; }
        return reverse ? -1 : 1;
    },

    /**
     * DOMイベントバブルを無効にする
     *
     * @param {Event} e イベントオブジェクト
     * @returns {boolean} falseを返してキャンセルする
     */
    cancelBubble: e => {
        e.preventDefault();
        e.stopPropagation();
        return false;
    },

    moveToBefore: (ary, target, beforeOf) => {
        const pos = ary.indexOf(target);
        if (pos === -1) { return; }

        const unwrappedArray = ko.unwrap(ary);
        const currentBeforeOf = pos + 1 < unwrappedArray.length ? unwrappedArray[pos + 1] : null;

        if (currentBeforeOf === beforeOf) { return; }
        if (!currentBeforeOf && !beforeOf) { return; }

        // remove
        ary.splice(ary.indexOf(target), 1);

        // insert
        if (beforeOf) {
            ary.splice(ary.indexOf(beforeOf), 0, target);
        } else {
            ary.push(target);
        }

        return ary;
    },

    dateFormatHM: time => {
        time = new Date(time);
        const hour = Math.floor(time / 60 / 60 / 1000);
        const minute = Math.floor((time - hour * 60 * 60 * 1000) / 60 / 1000);
        return hour ? (hour + '時間' + minute + '分') : minute + '分';
    },

    secondsFormatHM: seconds => {
        const hour = Math.floor(seconds / 60 / 60);
        const minute = Math.floor((seconds - hour * 60 * 60) / 60);
        return hour ? (hour + '時間' + minute + '分') : minute + '分';
    },

    minutesFormatHM: minutes => {
        const minute = Math.floor(minutes % 60);
        const hour = Math.floor(minutes / 60);
        return hour ? `${hour}h${minute}m` : `${minute}m`;
    },

    dateFormatYMDHM: time => {
        return (moment.isMoment(time) ? time : moment(new Date(time))).format('YYYY/MM/DD HH:mm:ss');
    },

    offset: ele => {
        const docEle = document.documentElement;
        const box = ele.getBoundingClientRect();
        return {
            top: box.top + window.pageYOffset - docEle.clientTop,
            left: box.left + window.pageXOffset - docEle.clientLeft
        };
    },

    position: ele => {
        const offsetParent = util.offsetParent(ele);

        const offset = util.offset(ele);
        const parentOffset = util.offset(offsetParent);

        return {
            top: parseInt(offset.top, 10) - parseInt(parentOffset.top, 10) - parseInt(ele.style.marginTop || 0, 10),
            left: parseInt(offset.left, 10) - parseInt(parentOffset.left, 10) - parseInt(ele.style.marginLeft || 0, 10)
        };
    },

    offsetParent: ele => {
        const docEle = document.documentElement;
        let offsetParent = ele.offsetParent || docEle;

        while (offsetParent && offsetParent !== document && (offsetParent.nodeName !== 'HTML' && offsetParent.style.position === 'static')) {
            offsetParent = offsetParent.offsetParent;
        }

        return offsetParent || docEle;
    }
};

module.exports = util;
