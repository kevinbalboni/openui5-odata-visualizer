sap.ui.define([
	"openui5-odata-visualizer/controller/BaseController",
	"openui5-odata-visualizer/model/tableExport",
	"openui5-odata-visualizer/model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/Device",
	"sap/ui/model/Binding",
	"sap/ui/model/Sorter"
], function (BaseController, tableExport, formatter, JSONModel, Filter, FilterOperator, Device, Binding, Sorter) {
	"use strict";

	return BaseController.extend("openui5-odata-visualizer.controller.ComplexTypes", {
		formatter: formatter,

		onInit: function () {
			this.getLogger(this.getControllerName()).info("onInit");
			BaseController.prototype.onInit.apply(this, arguments);

			let oViewModel = new JSONModel({
				isPhone: Device.system.phone
			});
			this.setModel(oViewModel, "ViewComplexTypes");

			this.getRouter().getRoute("complexTypes").attachMatched(function (oEvent) {

				/* let oModel = this.getModel("services"); //TODO spostare altrimenti scatta ad ogni navigazione
				let bindingElementList = new Binding(oModel, "/", oModel.getContext("/selectedComplexType"));
				bindingElementList.attachChange(function (oEventChange) {
					this._clearFilters();
					this._bindRows();
				}.bind(this));

				this._bindRows(); *///TODO spostare altrimenti scatta ad ogni navigazione
				this.autoResizeColumns("ComplexTypesTable");
			}.bind(this));

			Device.media.attachHandler(function (oDevice) {
				this.getModel("ViewComplexTypes").setProperty("/isPhone", oDevice.name === "Phone");
			}.bind(this));

			let int = (Device.resize.height - 310) / 45; //TODO put in function base.controller
			this.byId("ComplexTypesTable").setVisibleRowCount(Math.trunc(int));

			setTimeout(function () {
				let oModel = this.getModel("services"); //TODO spostare altrimenti scatta ad ogni navigazione
				let bindingElementList = new Binding(oModel, "/", oModel.getContext("/selectedComplexType"));
				bindingElementList.attachChange(function (oEventChange) {
					this._clearFilters();
					this._bindRows();
				}.bind(this));

				this._bindRows();//TODO spostare altrimenti scatta ad ogni navigazione
			}.bind(this), 500);
		},

		_bindRows: function () {

			let sBindEntity = this.getModel("services").getProperty("/selectedComplexType");
			let aEntities = this.getModel("services").getProperty("/selectedService/metadataForDetails/complexTypesList");

			if (!aEntities) {
				return;
			}

			this.getModel("ViewComplexTypes").setProperty("/complexTypeBinded", null);

			let oEntity = aEntities.find(x => x.name === sBindEntity);
			if (!oEntity) {
				return;
			}

			this.getModel("ViewComplexTypes").setProperty("/complexTypeBinded", oEntity);

			this.byId("ComplexTypesTable").bindRows({
				path: "services>/selectedService/metadataForDetails/complexTypes/" + sBindEntity + "/property",
				parameters: {
					operationMode: "Client"
				},
				sorter: [new Sorter({
					path: "mode",
					descending: false
				}), new Sorter({
					path: "name",
					descending: true
				})]
			});
		},

		onNavToComplexType: function (oEvent) {
			let oLineSelected = oEvent.getSource().getBindingContext("services").getObject();
			this.getModel("services").setProperty("/selectedComplexType", oLineSelected.toComplexType);
		},

		onRowsUpdate: function (oEvent) {
			let iCount = oEvent.getSource().getBinding("rows").getLength();
			let sComplexTypeBinded = this.getModel("ViewComplexTypes").getProperty("/complexTypeBinded/name");
			let sTitle = this.getI18nText("ComplexTypesTableTitle", [sComplexTypeBinded ? sComplexTypeBinded : "", iCount]);
			this.getModel("ViewComplexTypes").setProperty("/TableTitle", sTitle);
			this.autoResizeColumns("ComplexTypesTable");
		},

		onChangeComplexType: function () {
			//this._clearFilters();
			//this._bindRows();
		},

		onComplexTypesSearch: function (oEvent) {
			let aFields = ["name", "type", "nullable", "maxLength", "precision", "scale"];
			let sSearchValue = oEvent.getSource().getValue();
			let oFilterAll = [];

			if (oEvent.getParameter("refreshButtonPressed")) {
				this.getModel("services").refresh();
			}

			if (sSearchValue && sSearchValue.length > 0) {

				oFilterAll = new Filter({
					filters: [],
					and: false
				});

				for (let xx = 0; xx < aFields.length; xx++) {
					oFilterAll.aFilters.push(
						new Filter({
							path: aFields[xx],
							operator: FilterOperator.Contains,
							value1: sSearchValue,
							caseSensitive: false
						}));
				}
			}

			this.byId("ComplexTypesTable").getBinding("rows").filter(oFilterAll);
			jQuery.sap.delayedCall(200, this, function () {
				this.byId("SerachComplexTypes").focus();
			});
		},

		onComplexTypeExportToFile: function (oEvent) { //TODO se non ci sono dati non fare export altrimenti errore in console
			let sKey = oEvent.getParameter("item").getKey();
			let sBindingPath = this.byId("ComplexTypesTable").getBinding().getPath();
			let aProperties = this.getModel("services").getProperty(sBindingPath);
			let scomplexTypeBinded = this.getModel("ViewComplexTypes").getProperty("/complexTypeBinded/name");

			tableExport.export(sKey, aProperties, this.getI18nText("ComplexType"), scomplexTypeBinded);
		},

		_clearFilters: function () {
			let oTable = this.byId("ComplexTypesTable");
			let oTableBinding = oTable.getBinding();
			let oTableColumns = oTable.getColumns();
			if (oTableBinding) {
				oTableBinding.aSorters = null;
				oTableBinding.aFilters = null;
			}
			for (let bk = 0; bk < oTableColumns.length; bk++) {
				oTableColumns[bk].setSorted(false);
				oTableColumns[bk].setFilterValue("");
				oTableColumns[bk].setFiltered(false);
			}
			this.byId("SerachComplexTypes").setValue("").fireLiveChange();
		}

	});
});