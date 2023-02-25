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

	return BaseController.extend("openui5-odata-visualizer.controller.Functions", {
		formatter: formatter,

		onInit: function () {
			this.getLogger(this.getControllerName()).info("onInit");
			BaseController.prototype.onInit.apply(this, arguments);

			let oViewModel = new JSONModel({
				isPhone: Device.system.phone
			});
			this.setModel(oViewModel, "ViewFunctions");

			this.getRouter().getRoute("functions").attachMatched(function (oEvent) {

				let oModel = this.getModel("services");
				let bindingElementList = new Binding(oModel, "/", oModel.getContext("/selectedFunction"));
				bindingElementList.attachChange(function (oEventChange) {
					this._clearFilters();
					this._bindRows();
				}.bind(this));

				this._bindRows();
			}.bind(this));

			Device.media.attachHandler(function (oDevice) {
				this.getModel("ViewFunctions").setProperty("/isPhone", oDevice.name === "Phone");
			}.bind(this));

			let int = (Device.resize.height - 310) / 45;
			this.byId("FunctionsTable").setVisibleRowCount(Math.trunc(int));
		},

		_bindRows: function () {

			let sBindEntity = this.getModel("services").getProperty("/selectedFunction");
			let aEntities = this.getModel("services").getProperty("/selectedService/metadataForDetails/functionsList");

			if (!aEntities) {
				return;
			}

			this.getModel("ViewFunctions").setProperty("/functionBinded", null);

			let oEntity = aEntities.find(x => x.name === sBindEntity);
			if (!oEntity) {
				return;
			}

			this.getModel("ViewFunctions").setProperty("/functionBinded", oEntity);

			this.byId("FunctionsTable").bindRows({
				path: "services>/selectedService/metadataForDetails/functions/" + sBindEntity + "/parameters",
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

		onNavToComplexTypeParam: function (oEvent) {
			let oLineSelected = oEvent.getSource().getBindingContext("services").getObject();
			this.getModel("services").setProperty("/selectedComplexType", oLineSelected.toComplexType);
			this.getRouter().navTo("complexTypes");
		},

		onRowsUpdate: function (oEvent) {
			let iCount = oEvent.getSource().getBinding("rows").getLength();
			let sFunctionBinded = this.getModel("ViewFunctions").getProperty("/functionBinded/name");
			let sTitle = this.getI18nText("FunctionsTableTitle", [sFunctionBinded ? sFunctionBinded : "", iCount]);
			this.getModel("ViewFunctions").setProperty("/TableTitle", sTitle);
			this.autoResizeColumns("FunctionsTable");
		},

		onNavToComplexType: function () {
			let sComplexType = this.getModel("ViewFunctions").getProperty("/functionBinded/toComplexType");
			this.getModel("services").setProperty("/selectedComplexType", sComplexType);
			this.getRouter().navTo("complexTypes");
		},

		onNavToEntity: function () {
			let sEntity = this.getModel("ViewFunctions").getProperty("/functionBinded/toEntity");
			this.getModel("services").setProperty("/selectedEntity", sEntity);
			this.getRouter().navTo("entities");
		},

		onChangeFunction: function () {
			this._clearFilters();
			this._bindRows();
		},

		onFunctionSearch: function (oEvent) {
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

			this.byId("FunctionsTable").getBinding("rows").filter(oFilterAll);
			jQuery.sap.delayedCall(200, this, function () {
				this.byId("SearchFunctions").focus();
			});
		},

		onFunctionExportToFile: function (oEvent) {
			let sKey = oEvent.getParameter("item").getKey();
			let sBindingPath = this.byId("FunctionsTable").getBinding().getPath();
			let aProperties = this.getModel("services").getProperty(sBindingPath);
			let sFunctionBinded = this.getModel("ViewFunctions").getProperty("/functionBinded/name");

			tableExport.export(sKey, aProperties, this.getI18nText("Function"), sFunctionBinded);
		},

		_clearFilters: function () {
			let oTable = this.byId("FunctionsTable");
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
			this.byId("SearchFunctions").setValue("").fireLiveChange();
		}

	});
});