//TODO rifare il file e gestire function import

sap.ui.define([], function () {
    "use strict";
    let t = "sap-icon://key";
    let i = "sap-icon://begin";
    let n = {
        icon: "icon",
        toEntity: "toEntity",
        isKey: "isKey",
        isNav: "isNav",
        navigationDetails: "navigationDetails"
    };

    function a(e, i) {
        if (e.icon !== i.icon) {
            if (e.icon === t) {
                return -1;
            }
            if (i.icon === t) {
                return 1;
            }
        }
        if (e.name > i.name) {
            return 1;
        }
        if (e.name < i.name) {
            return -1;
        }
        return 0;
    }

    function getTechnicalProp(e) {
        return !!n[e];
    }

    function o(e, t) {
        var i = t.find(t => t.name === e ? true : false);
        return !!i;
    }

    function s(e, t) {
        function i(e, t) {
            return t.find(t => t.role === e ? true : false);
        }
        var n = t.find(t => t.name === e.relationship.split(".").pop() ? true : false);
        return {
            toEntity: i(e.toRole, n.end).type.split(".").pop().toLocaleLowerCase() || undefined,
            multiplicity: n.end[0].multiplicity + "  ...  " + n.end[1].multiplicity
        };
    }

    function getRelations(e) {
        let t = [];
        let i = e.dataServices.schema.find(e => Array.isArray(e.association)).association || [];
        i.forEach(e => {
            t.push({
                fromEntity: e.end[0].type.split(".").pop().toLocaleLowerCase(),
                toEntity: e.end[1].type.split(".").pop().toLocaleLowerCase(),
                begin: e.end[0].multiplicity,
                end: e.end[1].multiplicity
            });
        });
        return t;
    }

    function c(e, r) {
        var l = JSON.parse(JSON.stringify(e.property));
        l.forEach(i => {
            i.order = 3;
            if (o(i.name, e.key.propertyRef)) {
                i[n.icon] = t;
                i[n.isKey] = true;
                i.order = 1;
            }
            if (i.extensions) {
                i.extensions.forEach(function (e) {
                    i["sap:" + e.name] = e.value;
                });
                delete i.extensions;
            }
        });
        if (e.navigationProperty) {
            e.navigationProperty.forEach(e => {
                let t = {};
                t.name = e.name;
                t.type = s(e, r).multiplicity || "";
                t[n.toEntity] = s(e, r).toEntity || "";
                t[n.icon] = i;
                t[n.isNav] = true;
                t.order = 2;
                l.push(t);
            });
        }
        l.sort(a);
        return l;
    }

    function getEntities(e) {
        var t = {};
        var i = e.dataServices.schema.find(e => Array.isArray(e.association)).association || [];
        e.dataServices.schema.find(e => Array.isArray(e.entityType) && e.entityType.length > 0).entityType.forEach(e => {
            if (!t.hasOwnProperty(e.name.toLowerCase())) {
                t[e.name.toLowerCase()] = c(e, i);
            }
        });
        return t;
    }

    function getFunctionImport(e, bArray) {
        let aFunctionImport = [];
        let aFunctionImportMetadata = [];

        try {
            let oEntityContainer = e.dataServices.schema.find(e => Array.isArray(e.entityContainer) && e.entityContainer.length > 0).entityContainer;
            aFunctionImportMetadata = oEntityContainer.find(e => e.isDefaultEntityContainer).functionImport;
        } catch (e) {

        }
        if (aFunctionImportMetadata && Array.isArray(aFunctionImportMetadata)) {
            aFunctionImportMetadata.forEach(e => {
                if (bArray) {
                    aFunctionImport.push({
                        name: e.name,
                        httpMethod: e.httpMethod,
                        returnType: e.returnType,
                        parameters: e.parameter
                    });
                } else {
                    aFunctionImport[e.name] = {
                        name: e.name,
                        httpMethod: e.httpMethod,
                        returnType: e.returnType,
                        parameters: e.parameter
                    };
                }
            });
        }
        return aFunctionImport;
    }

    function getEntitiesList(e) {
        let aEntityType = [];
        let aEntitySet = [];
        let aEntitiesList = [];

        try {
            aEntityType = e.dataServices.schema.find(e => Array.isArray(e.entityType) && e.entityType.length > 0).entityType;
            aEntitySet = e.dataServices.schema.find(e => Array.isArray(e.entityContainer) && e.entityContainer.length > 0).entityContainer.find(e => e.isDefaultEntityContainer).entitySet;
        } catch (e) {

        }

        aEntityType.forEach(e => {
            aEntitiesList.push({
                key: e.name.toLowerCase(),
                text: e.name,
                setText: getText(aEntitySet, e.name)
            });
        });
        return aEntitiesList;
    }

    function getText(e, t) {
        var i = e.find(e => e.entityType.split(".")[1] === t);
        return i ? i.name : "";
    }

    function getVersions(e) {
        return {
            serviceVersion: e.version,
            oDataVersion: e.dataServices.dataServiceVersion
        };
    }

    function getMetadataForDetails(e) {
        return {
            entities: getEntities(e),
            entitiesList: getEntitiesList(e),
            functions: getFunctionImport(e),
            functionsList: getFunctionImport(e, true),
            versions: getVersions(e)
        };
    }

    function getMetadataForServices(t) {
        var i = {
            Entitites: []
        };
        t.dataServices.schema.find(e => Array.isArray(e.entityType) && e.entityType.length > 0).entityType.forEach(t => {
            var n = {
                Name: t.name,
                Childs: []
            };
            if (t.property) {
                let i = {
                    Name: "properties", //i18n
                    Childs: []
                };
                t.property.forEach(e => {
                    i.Childs.push({
                        Name: e.name,
                        Type: e.type
                    });
                });
                n.Childs.push(i);
            }
            if (t.navigationProperty) {
                let i = {
                    Name: "navigations", //i18n
                    Childs: []
                };
                t.navigationProperty.forEach(e => {
                    i.Childs.push({
                        Name: e.name
                    });
                });
                n.Childs.push(i);
            }
            i.Entitites.push(n);
        });
        return i;
    }

    function getFormatXml(e) {
        var t = "";
        var i = /(>)(<)(\/*)/g;
        e = e.replace(i, "$1\r\n$2$3");
        var n = 0;
        e.split("\r\n").forEach((e, i) => {
            var a = 0;
            if (e.match(/.+<\/\w[^>]*>$/)) {
                a = 0;
            } else if (e.match(/^<\/\w/)) {
                if (n != 0) {
                    n -= 1;
                }
            } else if (e.match(/^<\w[^>]*[^\/]>.*$/)) {
                a = 1;
            } else {
                a = 0;
            }
            var r = "";
            for (var o = 0; o < n; o++) {
                r += "  ";
            }
            t += r + e + "\r\n";
            n += a;
        });
        return t;
    }

    function getMetadataForDiagram(e) {
        let t = getMetadataForDetails(e);
        t.relations = getRelations(e);
        return t;
    }

    return {
        getParsedMetadataForDetails: getMetadataForDetails,
        getParsedMetadataForServices: getMetadataForServices,
        getParsedMetadataForDiagram: getMetadataForDiagram,
        formatXml: getFormatXml,
        isTechnicalProp: getTechnicalProp
    };
});