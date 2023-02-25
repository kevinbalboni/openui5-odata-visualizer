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
    const oComplexTypeFind = {
        name: "name",
        text: "text"
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

    function getComplexType(value, aComplexTypesMetadata2, sField) {
        let oComplexType;
        value = value.type || value;

        if (aComplexTypesMetadata2.find(x => x[sField] === value)) {
            oComplexType = aComplexTypesMetadata2.find(x => x[sField] === value);
        } else if (value.toLowerCase().includes("collection")) {
            let sType = value.split(".")[1];
            oComplexType = aComplexTypesMetadata2.find(x => x[sField] === sType.slice(0, -1));
        } else if (value.includes(".")) {
            let sType = value.split(".")[1];
            oComplexType = aComplexTypesMetadata2.find(x => x[sField] === sType);
        }

        return oComplexType;
    }

    function c(e, r, aComplexTypesList2) {
        var l = JSON.parse(JSON.stringify(e.property));
        l.forEach(function (aComplexTypesList, i) {
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

            i.toComplexType = getComplexType(i, aComplexTypesList2, oComplexTypeFind.name) ?
                getComplexType(i, aComplexTypesList2, oComplexTypeFind.name).name : null;

        }.bind(null, aComplexTypesList2));
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

    function getProperties(property, aComplexTypesMetadata2) {
        let oComplexType;
        if (property && Array.isArray(property)) {
            for (let bk = 0; bk < property.length; bk++) {
                oComplexType = getComplexType(property[bk], aComplexTypesMetadata2, oComplexTypeFind.name);
                if (oComplexType) {
                    property[bk].toComplexType = oComplexType.name;
                }
            }
        }
        return property;
    }

    function getEntities(e, aComplexTypesList) {
        var t = {};
        var i = e.dataServices.schema.find(e => Array.isArray(e.association)).association || [];
        e.dataServices.schema.find(e => Array.isArray(e.entityType) && e.entityType.length > 0).entityType.forEach(
            function (aComplexTypesList2, oEntity) {

                if (!t.hasOwnProperty(oEntity.name.toLowerCase())) {
                    t[oEntity.name.toLowerCase()] = c(oEntity, i, aComplexTypesList2);
                }
            }.bind(null, aComplexTypesList));
        return t;
    }

    function getFunctionImport(e, bArray, aComplexTypesList, aEntitiesList) {
        let aFunctionImport = [];
        let aFunctionImportMetadata = [];

        try {
            let oEntityContainer = e.dataServices.schema.find(e => Array.isArray(e.entityContainer) && e.entityContainer.length > 0).entityContainer;
            aFunctionImportMetadata = oEntityContainer.find(e => e.isDefaultEntityContainer).functionImport;
        } catch (e) {

        }
        if (aFunctionImportMetadata && Array.isArray(aFunctionImportMetadata)) {
            aFunctionImportMetadata.forEach(function (aComplexTypesList2, e) {

                let sToComplexType = getComplexType(e.returnType, aComplexTypesList2, oComplexTypeFind.name) ?
                    getComplexType(e.returnType, aComplexTypesList2, oComplexTypeFind.name).name : null;
                let sToEntity = getComplexType(e.returnType, aEntitiesList, oComplexTypeFind.text) ?
                    getComplexType(e.returnType, aEntitiesList, oComplexTypeFind.text).key : null;

                if (bArray) {
                    aFunctionImport.push({
                        name: e.name,
                        httpMethod: e.httpMethod,
                        returnType: e.returnType,
                        parameters: getProperties(e.parameter, aComplexTypesList2),
                        toComplexType: sToComplexType,
                        toEntity: sToEntity
                    });
                } else {
                    aFunctionImport[e.name] = {
                        name: e.name,
                        httpMethod: e.httpMethod,
                        returnType: e.returnType,
                        parameters: getProperties(e.parameter, aComplexTypesList2),
                        toComplexType: sToComplexType,
                        toEntity: sToEntity
                    };
                }
            }.bind(null, aComplexTypesList));
        }
        return aFunctionImport;
    }

    function getComplexTypes(e, bArray) {
        let aComplexTypes = [];
        let aComplexTypesMetadata = [];

        try {
            aComplexTypesMetadata = e.dataServices.schema.find(e => Array.isArray(e.complexType)).complexType || [];
        } catch (e) {

        }
        if (aComplexTypesMetadata && Array.isArray(aComplexTypesMetadata)) {
            aComplexTypesMetadata.forEach(function (aComplexTypesMetadata2, e) {
                if (bArray) {
                    aComplexTypes.push({
                        name: e.name,
                        property: getProperties(e.property, aComplexTypesMetadata2)
                    });
                } else {
                    aComplexTypes[e.name] = {
                        name: e.name,
                        property: getProperties(e.property, aComplexTypesMetadata2)
                    };
                }
            }.bind(null, aComplexTypesMetadata));
        }
        return aComplexTypes;
    }

    function getText(e, t) {
        var i = e.find(e => e.entityType.split(".")[1] === t);
        return i ? i.name : "";
    }

    function getEntitiesList(e) {
        let aEntityType = [];
        let aEntitySet = [];
        let aEntitiesList = [];

        try {
            aEntityType = e.dataServices.schema.find(e => Array.isArray(e.entityType) && e.entityType.length > 0).entityType;
            aEntitySet = e.dataServices.schema.find(e => Array.isArray(e.entityContainer) && e.entityContainer.length > 0).entityContainer.find(e => e.isDefaultEntityContainer).entitySet;
        } catch (error) {

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

    function getVersions(e) {
        return {
            serviceVersion: e.version,
            oDataVersion: e.dataServices.dataServiceVersion
        };
    }

    function getMetadataForDetails(e) {
        let oComplexTypes = getComplexTypes(e);
        let aComplexTypesList = getComplexTypes(e, true);
        let oEntities = getEntities(e, aComplexTypesList);
        let aEntitiesList = getEntitiesList(e);

        return {
            entities: oEntities,
            entitiesList: aEntitiesList,
            complexTypes: oComplexTypes,
            complexTypesList: aComplexTypesList,
            functions: getFunctionImport(e, false, aComplexTypesList, aEntitiesList),
            functionsList: getFunctionImport(e, true, aComplexTypesList, aEntitiesList),
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