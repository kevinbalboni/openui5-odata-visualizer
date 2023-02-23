sap.ui.define([
	"openui5-odata-visualizer/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/Device",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/MessageBox",
	"sap/m/Input",
	"sap/m/InputType",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/model/Binding",
	"sap/ui/table/Column",
	"sap/ui/model/Sorter"
], function (BaseController, JSONModel, Filter, FilterOperator, Device, Dialog, Button,
	Label, Text, MessageBox, Input, InputType, SimpleForm, Binding, Column, Sorter) {
	"use strict";

	return BaseController.extend("openui5-odata-visualizer.controller.Functions", {

		onInit: function () {
			this.getLogger(this.getControllerName()).info("onInit");
			BaseController.prototype.onInit.apply(this, arguments);

			var oViewModel = new JSONModel({
				isPhone: Device.system.phone
			});
			this.setModel(oViewModel, "ViewFunctions");

			this.getRouter().getRoute("functions").attachMatched(function (oEvent) {

				var oModel = this.getModel("services");
				var bindingElementList = new Binding(oModel, "/", oModel.getContext("/selectedFunction"));
				bindingElementList.attachChange(function (oEventChange) {
					this._bindRows();
				}.bind(this));

				this._bindRows();
			}.bind(this));

			Device.media.attachHandler(function (oDevice) {
				this.getModel("ViewFunctions").setProperty("/isPhone", oDevice.name === "Phone");
			}.bind(this));
		},

		_bindRows: function () {

			let sBindEntity = this.getModel("services").getProperty("/selectedFunction");
			let aEntities = this.getModel("services").getProperty("/selectedService/metadataForDetails/functionsList");

			if (!aEntities) {
				return;
			}

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

		onRowsUpdate: function (oEvent) {
			var iCount = oEvent.getSource().getBinding("rows").getLength();
			var sEntityBinded = this.getModel("ViewFunctions").getProperty("/functionBinded/name");
			var sTitle = this.getI18nText("FunctionsTableTitle", [sEntityBinded, iCount]);
			this.getModel("ViewFunctions").setProperty("/TableTitle", sTitle);
			this.autoResizeColumns("FunctionsTable");
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

		_clearFilters: function () {
			let oTable = this.byId("FunctionsTable");
			let oTableBinding = oTable.getBinding();
			let oTableColumns = oTable.getColumns();
			if (oTableBinding) {
				oTableBinding.aSorters = null;
				oTableBinding.aFilters = null;
			}
			for (let k = 0; k < oTableColumns.length; k++) {
				oTableColumns[k].setSorted(false);
				oTableColumns[k].setFilterValue("");
				oTableColumns[k].setFiltered(false);
			}
			this.byId("SearchFunctions").setValue("").fireLiveChange();
		}

	});
});