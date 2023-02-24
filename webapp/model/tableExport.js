/* global XLSX:true */
sap.ui.define([
    "./xlsx.full.min"
], function (XLSX_fake) {

    "use strict";

    function getKeys(aDatas) {
        let keys = [];
        for (let bk = 0; bk < aDatas.length; bk++) {
            for (let key in aDatas[bk]) {
                !keys.find(x => x === key) ? keys.push(key) : null;
            }
        }
        return keys;
    }

    function parseData(aDatas) {
        let aKeys = getKeys(aDatas);
        let rows = aDatas.map(function (aKeys2, a) {
            let array = [];
            for (let bk = 0; bk < aKeys2.length; bk++) {
                array.push(a[aKeys2[bk]]);
            }
            return array;
        }.bind(null, aKeys));

        rows.unshift(aKeys);
        return rows;
    }

    function onExcelExport(aDatas, sFileName) {
        let rows = parseData(aDatas);
        let wb = XLSX.utils.book_new();
        wb.Props = {
            Title: sFileName + " Export",
            Author: "ODataVisualizer",
            CreatedDate: new Date()
        };
        wb.SheetNames.push(sFileName.length > 31 ? sFileName.slice(0, 31) : sFileName);

        let ws = XLSX.utils.aoa_to_sheet(rows);
        wb.Sheets[sFileName.length > 31 ? sFileName.slice(0, 31) : sFileName] = ws;
        XLSX.writeFile(wb, sFileName + ".xlsx");
    }

    function onCSVExport(aDatas, sFileName) {
        let rows = parseData(aDatas);
        let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(";")).join("\n");
        let encodedUri = encodeURI(csvContent);
        let link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", sFileName + ".csv");
        document.body.appendChild(link);
        link.click();
    }

    function getFileName(sFileName, sFileName2) {
        return sFileName2 ? [sFileName, sFileName2].join(" ") : sFileName;
    }

    function StartExport(sKey, aDatas, sFileName, sFileName2) {
        if (!aDatas || !Array.isArray(aDatas)) {
            //TODO Error message
            return;
        }
        aDatas.sort((a, b) => a.order - b.order);

        let sFileNameComplete = getFileName(sFileName, sFileName2);
        if (sKey === "EXCEL") {
            onExcelExport(aDatas, sFileNameComplete);
        } else {
            onCSVExport(aDatas, sFileNameComplete);
        }
    }

    return {
        export: StartExport
    };

});