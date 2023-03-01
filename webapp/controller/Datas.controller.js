sap.ui.define([
	"openui5-odata-visualizer/controller/BaseController",
	"openui5-odata-visualizer/model/tableExport",
	"openui5-odata-visualizer/model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/Device",
	"sap/m/Dialog",
	"sap/m/MessageBox",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/CheckBox",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/model/Binding",
	"sap/ui/table/Column",
	"sap/ui/model/Sorter",
	"sap/ui/layout/GridData",
	"sap/ui/core/Title",
	"sap/ui/core/Icon",
	"sap/ui/core/CustomData"
], function (BaseController, tableExport, formatter, JSONModel, Filter, FilterOperator, Device, Dialog, MessageBox,
	Label, Text, CheckBox, SegmentedButton, SegmentedButtonItem, SimpleForm, Binding, Column, Sorter, GridData, Title, Icon, CustomData) {
	"use strict";

	return BaseController.extend("openui5-odata-visualizer.controller.Datas", {
		formatter: formatter,

		onInit: function () {
			this.getLogger(this.getControllerName()).info("onInit");
			BaseController.prototype.onInit.apply(this, arguments);

			let oViewModel = new JSONModel({
				isPhone: Device.system.phone,
				selectedEntity: null,
				url: "",
				displayDataType: "table",
				wherePropertiesEditable: true,
				selectedCallType: "topSkip"
			});
			this.setModel(oViewModel, "ViewDatas");

			this.getRouter().getRoute("datas").attachMatched(function (oEvent) {
				this._attachRouteMatched(oEvent);
			}.bind(this));

			Device.media.attachHandler(function (oDevice) {
				this.getModel("ViewDatas").setProperty("/isPhone", oDevice.name === "Phone");
			}.bind(this));

			let int = (Device.resize.height - 400) / 45;
			this.byId("DatasTable").setVisibleRowCount(Math.trunc(int));

			setTimeout(function () {

				this.clearAll();
				this.createUrl();

				let bindingElementList2 = new Binding(this.getModel("services"), "/");
				bindingElementList2.attachChange(function () {
					this.clearAll();
					this.onChangeSelectedEntity();
				}.bind(this));

				let oCallOdataBinding = new Binding(this.getModel("CallOdata"), "/");
				oCallOdataBinding.attachChange(function () {
					this.createUrl();
				}.bind(this));

			}.bind(this), 500);
		},

		_attachRouteMatched: function () {
			//Translate Call Types using i18n
			let aCallTypes = this.getModel("services").getProperty("/callTypes");
			for (let bk = 0; bk < aCallTypes.length; bk++) {
				aCallTypes[bk].value = this.getI18nText(aCallTypes[bk].key);
			}
			this.getModel("ViewDatas").setProperty("/callTypes", aCallTypes);

			//Translate FilterOperator using i18n
			let aFilterOperator = this.getModel("services").getProperty("/FilterOperator");
			for (let bk = 0; bk < aFilterOperator.length; bk++) {
				aFilterOperator[bk].value = this.getI18nText(aFilterOperator[bk].key);
			}
			this.getModel("ViewDatas").setProperty("/FilterOperator", aFilterOperator);
		},

		onChangeSelectedEntity: function (oEvent) {
			let sCallType = this.getModel("ViewDatas").getProperty("/selectedCallType");

			if (sCallType === "key") {
				let aProperties = this.getModel("ViewDatas").getProperty("/aProperties");
				let aWhere = [];

				for (let bk = 0; bk < aProperties.length; bk++) {
					if (!aProperties[bk].isKey) { continue; }
					aWhere.push({
						text: aProperties[bk].name,
						filter: "eq",
						value: ""
					});
				}
				this.getModel("CallOdata").setProperty("/where", aWhere);
				this.byId("panelWhere").setExpanded(true);
			}

			this.createUrl();
		},

		clearAll: function () { //TODO segmentare funzione
			this.getModel("ViewDatas").setProperty("/aProperties", this.getPropertyOfEntity());
			this.getModel("ViewDatas").setProperty("/TableTitle", "");

			this.byId("DatasTable").destroyColumns();

			let oCallOdata = {
				top: 20,
				skip: 0,
				expands: this.getExpandsSelectSorters().expands,
				selects_sorters: this.getExpandsSelectSorters().select_sorter,
				where: [],
				callResultString: null
			};

			let oSimpleForm = this.byId("simpleFormColumns");
			oSimpleForm.destroyContent();

			oSimpleForm.addContent(new Title({
				text: ""
			}));

			for (let bk = 0; bk < oCallOdata.selects_sorters.length; bk++) {

				if (bk === Math.trunc(oCallOdata.selects_sorters.length / 2)) {
					oSimpleForm.addContent(new Title({
						text: ""
					}));
				}

				let oLabel = new Label({
					text: oCallOdata.selects_sorters[bk].name,
					layoutData: new GridData({
						span: "XL7 L7 M7 S7"
					})
				});

				let oIcon = new Icon({
					src: oCallOdata.selects_sorters[bk].icon,
					color: "Critical",
					layoutData: new GridData({
						span: "XL1 L1 M1 S1"
					})
				});

				let oCheckBox = new CheckBox({
					selected: oCallOdata.selects_sorters[bk].selected,
					select: function (oEvent) {
						let aCustomData = oEvent.getSource().getCustomData();
						let aSelects_sorters = this.getModel("CallOdata").getProperty("/selects_sorters");
						let oSelect = aSelects_sorters.find(x => x.name === aCustomData[0].getValue());
						let index = aSelects_sorters.indexOf(oSelect);

						aSelects_sorters[index].selected = oEvent.getParameter("selected");
						this.getModel("CallOdata").setProperty("/selects_sorters", aSelects_sorters);
					}.bind(this),
					width: "2rem",
					layoutData: new GridData({
						span: "XL1 L1 M1 S1"
					}),
					customData: [new CustomData({
						key: "name",
						value: oCallOdata.selects_sorters[bk].name
					})]
				});

				let oSegButton = new SegmentedButton({
					enabled: "{ViewDatas>/wherePropertiesEditable}",
					selectedKey: oCallOdata.selects_sorters[bk].sort,
					selectionChange: function (oEvent) {
						let aCustomData = oEvent.getSource().getCustomData();
						let aSelects_sorters = this.getModel("CallOdata").getProperty("/selects_sorters");
						let oSelect = aSelects_sorters.find(x => x.name === aCustomData[0].getValue());
						let index = aSelects_sorters.indexOf(oSelect);

						aSelects_sorters[index].sort = oEvent.getParameter("item").getKey();
						this.getModel("CallOdata").setProperty("/selects_sorters", aSelects_sorters);
					}.bind(this),
					customData: [new CustomData({
						key: "name",
						value: oCallOdata.selects_sorters[bk].name
					})],
					layoutData: new GridData({
						span: "XL2 L3 M3 S3"
					}),
					items: [
						new SegmentedButtonItem({
							icon: "sap-icon://decline",
							key: "none"
						}),
						new SegmentedButtonItem({
							icon: "sap-icon://sort-ascending",
							key: "ascending"
						}),
						new SegmentedButtonItem({
							icon: "sap-icon://sort-descending",
							key: "descending"
						})

					]
				});

				oSimpleForm.addContent(oLabel);
				oSimpleForm.addContent(oCheckBox);
				oSimpleForm.addContent(oIcon);
				oSimpleForm.addContent(oSegButton);
			}

			if (this.getModel("CallOdata")) {
				this.getModel("CallOdata").setData(oCallOdata);
			} else {
				this.setModel(new JSONModel(oCallOdata), "CallOdata");
			}
		},

		getExpandsSelectSorters: function () {
			let aExpands = [];
			let aSelect_Sorter = [];
			let oSelectedServiceProperties = this.getPropertyOfEntity();

			if (oSelectedServiceProperties && Array.isArray(oSelectedServiceProperties)) {
				let aNavigations = oSelectedServiceProperties.filter(x => x.isNav === true);
				for (let bk = 0; bk < aNavigations.length; bk++) {
					let aNavigationCopy = jQuery.extend(true, {}, aNavigations[bk]);
					aNavigationCopy.selected = false;
					aExpands.push(aNavigationCopy);
				}
				for (let bk = 0; bk < oSelectedServiceProperties.length; bk++) {
					if (oSelectedServiceProperties[bk].isNav) {
						continue;
					}

					let oSelect_Sorter = jQuery.extend(true, {}, oSelectedServiceProperties[bk]);
					oSelect_Sorter.selected = false;
					oSelect_Sorter.sort = "none";
					aSelect_Sorter.push(oSelect_Sorter);
				}
			}

			return {
				expands: aExpands,
				select_sorter: aSelect_Sorter
			};
		},

		onWhereDelete: function (oEvent) {
			let aWhere = this.getModel("CallOdata").getProperty("/where");
			let oWhereToDelete = oEvent.getParameter("listItem").getBindingContext("CallOdata").getObject();
			let n = aWhere.indexOf(oWhereToDelete);
			oWhereToDelete = aWhere.splice(n, 1);
			this.getModel("CallOdata").setProperty("/where", aWhere);
		},

		onBtnOpenURL: function () {
			let sURL = this.getModel("ViewDatas").getProperty("/url");
			window.open(sURL, "_blank");
		},

		onAddWhere: function () {
			this.byId("panelWhere").setExpanded(true);
			let aWhere = this.getModel("CallOdata").getProperty("/where");
			aWhere.push({
				text: "",
				filter: "",
				value: ""
			});
			this.getModel("CallOdata").setProperty("/where", aWhere);
		},

		createUrl: function () {
			let sURL = this.getModel("services").getProperty("/selectedService/url");
			let oCallOdata = this.getModel("CallOdata").getData();
			let sCallType = this.getModel("ViewDatas").getProperty("/selectedCallType");

			this.getModel("ViewDatas").setProperty("/wherePropertiesEditable", true);

			if (sURL.slice(-1) !== "/") {
				sURL += "/";
			}
			sURL += this.getModel("services").getProperty("/selectedEntityDatas");

			switch (sCallType) {
				case "topSkip":
					sURL = sURL + "?$top=" + oCallOdata.top + "&$skip=" + oCallOdata.skip;
					sURL = this.getURLExpand(oCallOdata, sURL);
					sURL = this.getURLSelect(oCallOdata, sURL);
					sURL = this.getURLSorters(oCallOdata, sURL);

					let sFilters = this.getURLFilters(oCallOdata);
					if (sFilters !== "") {
						sURL += "&" + sFilters;
					}
					break;

				case "key":
					this.getModel("ViewDatas").setProperty("/wherePropertiesEditable", false);
					sURL = this.getURLExpand(oCallOdata, sURL);
					sURL = this.getURLSelect(oCallOdata, sURL);
					sURL += "(";
					for (let bk = 0; bk < oCallOdata.where.length; bk++) {
						if (bk > 0) {
							sURL += ",";
						}
						sURL += oCallOdata.where[bk].text + "='" + oCallOdata.where[bk].value + "'";
					}
					sURL += ")";
					break;

				case "count":
					sURL += "/$count";
					let sFilters2 = this.getURLFilters(oCallOdata);
					if (sFilters2 !== "") {
						sURL += "?" + sFilters2;
					}
					break;
			}
			this.getModel("ViewDatas").setProperty("/url", sURL);
		},

		getURLSorters: function (oCallOdata, sURL) {
			let aSorters = oCallOdata.selects_sorters.filter(x => x.sort !== "none");
			if (Array.isArray(aSorters) && aSorters.length > 0) {
				sURL += "&$orderby=";
				for (let bk = 0; bk < aSorters.length; bk++) {
					if (bk > 0) {
						sURL += ",";
					}
					sURL += aSorters[bk].name;
					if (aSorters[bk].sort === "descending") {
						sURL += " desc";
					}
				}
			}
			return sURL;
		},

		getURLExpand: function (oCallOdata, sURL) {
			let aExpands = oCallOdata.expands.filter(x => x.selected === true);
			if (Array.isArray(aExpands) && aExpands.length > 0) {
				sURL += "&$expand=";
				for (let bk = 0; bk < aExpands.length; bk++) {
					if (bk > 0) {
						sURL += ",";
					}
					sURL += aExpands[bk].name;
				}
			}
			return sURL;
		},

		getURLSelect: function (oCallOdata, sURL) {
			let aSelected = oCallOdata.selects_sorters.filter(x => x.selected === true);
			if (Array.isArray(aSelected) && aSelected.length > 0) {
				sURL += "&$select=";
				for (let bk = 0; bk < aSelected.length; bk++) {
					if (bk > 0) {
						sURL += ",";
					}
					sURL += aSelected[bk].name;
				}
			}
			return sURL;
		},

		getURLFilters: function (oCallOdata) {
			let sFilter;
			if (oCallOdata.where.length === 0) {
				return "";
			}

			for (let bk = 0; bk < oCallOdata.where.length; bk++) {
				if (bk === 0) {
					sFilter = "$filter=";
				}
				if (bk > 0) {
					sFilter += " and ";
				}
				switch (oCallOdata.where[bk].filter) {
					case "eq":
					case "ne":
					case "gt":
					case "ge":
					case "lt":
					case "le":
						sFilter += oCallOdata.where[bk].text + " " + oCallOdata.where[bk].filter + " '" + oCallOdata.where[bk].value + "' ";
						break;

					case "startswith":
					case "endswith":
						sFilter += oCallOdata.where[bk].filter + "(" + oCallOdata.where[bk].text + ",'" + oCallOdata.where[bk].value + "')";
						break;

					case "substringof":
						sFilter += oCallOdata.where[bk].filter + "('" + oCallOdata.where[bk].value + "'," + oCallOdata.where[bk].text + ")";
						break;

					case "not_startswith":
					case "not_endswith":
						sFilter += oCallOdata.where[bk].filter.replace("_", " ") + "(" + oCallOdata.where[bk].text + ",'" + oCallOdata.where[bk].value + "')";
						break;

					case "not_substringof":
						sFilter += oCallOdata.where[bk].filter.replace("_", " ") + "('" + oCallOdata.where[bk].value + "'," + oCallOdata.where[bk].text + ")";
						break;

				}
			}

			return sFilter;
		},

		getPropertyOfEntity: function () {
			let sSelectedEntity = this.getModel("services").getProperty("/selectedEntityDatas");
			let aEntityList = this.getModel("services").getProperty("/selectedService/metadataForDetails/entitiesList");

			if (!aEntityList) {
				return;
			}

			let sSelectedEntity2 = aEntityList.find(x => x.setText === sSelectedEntity);
			if (!sSelectedEntity2) {
				return;
			}
			let oSelectedServiceProperties = this.getModel("services").getProperty("/selectedService/metadataForDetails/entities/" + sSelectedEntity2.key.toLowerCase());
			return oSelectedServiceProperties;
		},

		onMadeCall: function () {
			let sURL = this.getModel("ViewDatas").getProperty("/url");

			sURL += "&$format=json"; //TODO rimuovere, solo per test

			this.getView().setBusy(true);
			$.ajax({
				type: "GET",
				contentType: "application/json",
				//crossDomain: true,
				url: sURL,
				beforeSend: function (req) {
					let oSelectedService2 = this.getModel("services").getProperty("/selectedService");
					if (oSelectedService2.username !== "" && oSelectedService2.password !== "") {
						req.setRequestHeader("Authorization", "Basic " + window.btoa(oSelectedService2.username + ":" + oSelectedService2.password));
					}
					req.setRequestHeader("Access-Control-Allow-Origin", "*");
				}.bind(this),
				/*  headers: { //TODO custom header
					"Authorization": "Basic " + btoa("admin" + ":" + "W1sp1nAdM!"),
					"Access-Control-Allow-Origin": "*"
				}, */
				async: false,
				success: function (oData, textStatus, jqXHR) {
					this.getView().setBusy(false);

					//TODO $count arriva strano
					let sResponseJSON;
					try {
						if (jqXHR.responseJSON) {
							sResponseJSON = JSON.stringify(jqXHR.responseJSON, null, "\t");
						} else {
							sResponseJSON = jqXHR.responseText;
						}

					} catch (error) {

					}

					this.getModel("CallOdata").setProperty("/callResultString", sResponseJSON);

					if (oData === "Unauthorized") {
						MessageBox.error(oData, {
							actions: MessageBox.Action.OK,
							emphasizedAction: MessageBox.Action.OK
						});
					} else {
						if (!oData.d) {
							/* let result1 = convertitore(jQuery.parseXML(jqXHR.responseText));
							debugger; */
							alert("XML to JSON TODO"); //TODO
						}
						this.createTable(oData);
					}

				}.bind(this),
				error: function (jqXhr, textStatus, errorMessage) {
					this.getView().setBusy(false);

					let sResponseJSON;
					let sError = this.fnParseError(jqXhr.responseText ? jqXhr.responseText : jqXhr.statusText);

					try {
						if (jqXhr.responseJSON) {
							sResponseJSON = JSON.stringify(jqXhr.responseJSON, null, "\t");
						} else {
							sResponseJSON = jqXhr.responseText;
						}
					} catch (error) {

					}

					if (sError === "") {
						MessageBox.error(jqXhr.statusText, {
							actions: MessageBox.Action.OK,
							emphasizedAction: MessageBox.Action.OK
						});
					} else {
						MessageBox.error(sError, {
							title: jqXhr.statusText ? jqXhr.statusText : sError,
							actions: MessageBox.Action.OK,
							emphasizedAction: MessageBox.Action.OK
						});
					}

					this.getModel("CallOdata").setProperty("/callResultString", sResponseJSON ? sResponseJSON : sError);
				}.bind(this)

			});
		},

		fnParseError: function (oParameter) {
			let sMessage = "";
			if (jQuery.sap.startsWith(oParameter || "", "{\"error\":")) {
				let oErrModel = new JSONModel();
				oErrModel.setJSON(oParameter);
				let message = oErrModel.getProperty("/error/innererror/errordetails/0/message");
				if (message instanceof Object && message.value) {
					sMessage = message.value;
				}
			}
			return sMessage;
		},

		createTable: function (oData) {
			let oTable = this.byId("DatasTable");
			this._createColumns(oData, oTable);
			this._bindRows(oTable);
		},

		getKeys: function (aDatas) {
			let keys = [];
			for (let bk = 0; bk < aDatas.length; bk++) {
				for (let key in aDatas[bk]) {
					!keys.find(x => x === key) ? keys.push(key) : null;
				}
			}
			return keys;
		},

		_createColumns: function (oDataFromCall, oTable) {
			let oData = oDataFromCall.d.results;
			let aKey = this.getKeys(oData);
			let aEntityProperties = this.getPropertyOfEntity();
			let dataTemp = {};
			let aResultsData = [];

			for (let i = 0; i < oData.length; i++) {
				for (let bk = 0; bk < aEntityProperties.length; bk++) {
					dataTemp[aEntityProperties[bk].name] = oData[i][aEntityProperties[bk].name];
					if ((aEntityProperties[bk].type === "Edm.DateTimeOffset" || aEntityProperties[bk].type === "Edm.DateTime") &&
						dataTemp[aEntityProperties[bk].name] && dataTemp[aEntityProperties[bk].name].includes("Date")) {
						dataTemp[aEntityProperties[bk].name] = dataTemp[aEntityProperties[bk].name].split("(");
						dataTemp[aEntityProperties[bk].name] = dataTemp[aEntityProperties[bk].name][1].split(")");
						dataTemp[aEntityProperties[bk].name] = new Date(parseInt(dataTemp[aEntityProperties[bk].name][0])).toJSON();
					}
				}
				aResultsData.push(jQuery.extend(true, {}, dataTemp));
			}
			this.getModel("CallOdata").setProperty("/dataResults", aResultsData);

			oTable.destroyColumns();
			for (let bk = 0; bk < aKey.length; bk++) {
				let oProperty = aEntityProperties.find(x => x.name === aKey[bk]);

				if (!oProperty || oProperty.isNav === true) {
					continue;
				}

				oTable.addColumn(new Column({
					label: oProperty.name,
					template: this._cellTemplate(oProperty),
					autoResizable: true,
					filterProperty: oProperty.name,
					sortProperty: oProperty.name,
					tooltip: oProperty.name
				}));
			}
		},

		_cellTemplate: function (oProperty) {
			//TODO Complex types Collection(WispinService.it_conse_wispin_formula_UIFormulaParameters)

			switch (oProperty.type) {
				case "Edm.DateTime":
				case "Edm.DateTimeOffset":
					return new Text({
						text: {
							path: "CallOdata>" + oProperty.name + "",
							type: "sap.ui.model.type.DateTime",
							formatOptions: {
								style: "long",
								source: {
									pattern: "yyyy-MM-ddTHH:mm:ss.SSSZ"
								}
							}
						}
					});

				case "Edm.Time":
					return new Text({
						text: {
							path: "CallOdata>" + oProperty.name + "",
							type: "sap.ui.model.type.Time",
							formatOptions: {
								style: "medium",
								source: {
									pattern: "\'PT\'HH\'H\'mm\'M\'ss\'S\'"
								}
							}
						}
					});

				case "Edm.Boolean":
					return new Text({
						text: "{CallOdata>" + oProperty.name + "}"
					});

				default:
					return new Text({
						text: "{CallOdata>" + oProperty.name + "}"
					});
			}
		},

		_bindRows: function (oTable) {
			oTable.bindRows({
				path: "CallOdata>/dataResults",
				parameters: {
					operationMode: "Client"
				}
			});
		},

		onDataRowsUpdate: function (oEvent) {
			let iCount = oEvent.getSource().getBinding("rows").getLength();
			let sTableTitle = this.getModel("services").getProperty("/selectedEntityDatas");
			this.getModel("ViewDatas").setProperty("/TableTitle", sTableTitle + " (" + iCount + ")");
			this.autoResizeColumns("DatasTable");
		},

		onDataExportToFile: function (oEvent) {
			let sKey = oEvent.getParameter("item").getKey();
			let sBindingPath = this.byId("DatasTable").getBinding().getPath();
			let aProperties = this.getModel("CallOdata").getProperty(sBindingPath);
			let sSelectedEntity = this.getModel("services").getProperty("/selectedEntityDatas");

			tableExport.export(sKey, aProperties, sSelectedEntity);
		},

		onDatasSearch: function (oEvent) {
			let aEntityProperties = this.getPropertyOfEntity();
			let sSearchValue = oEvent.getSource().getValue();
			let oFilterAll = [];
			let oFilterOperator;

			if (sSearchValue && sSearchValue.length > 0) {

				oFilterAll = new Filter({
					filters: [],
					and: false
				});

				for (let bk = 0; bk < aEntityProperties.length; bk++) {
					if (aEntityProperties[bk].toComplexType || aEntityProperties[bk].isNav === true) {
						continue;
					}

					if (aEntityProperties[bk].type === "Edm.Boolean" ||
						aEntityProperties[bk].type === "Edm.DateTimeOffset" ||
						aEntityProperties[bk].type === "Edm.DateTime" ||
						aEntityProperties[bk].type === "Edm.Time" ||
						aEntityProperties[bk].type === "Edm.Int32" ||
						aEntityProperties[bk].type === "Edm.Int64") {
						oFilterOperator = FilterOperator.EQ;
						continue; //TODO migliorabile la gestione filtri
					}
					oFilterOperator = FilterOperator.Contains;

					oFilterAll.aFilters.push(
						new Filter({
							path: aEntityProperties[bk].name,
							operator: oFilterOperator,
							value1: sSearchValue,
							caseSensitive: false
						}));
				}
			}

			this.byId("DatasTable").getBinding("rows").filter(oFilterAll);
			jQuery.sap.delayedCall(200, this, function () {
				this.byId("DatasSearchField").focus();
			});
		}

	});
});