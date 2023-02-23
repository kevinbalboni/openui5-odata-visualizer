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

	return BaseController.extend("openui5-odata-visualizer.controller.Entities", {

		onInit: function () {
			this.getLogger(this.getControllerName()).info("onInit");
			BaseController.prototype.onInit.apply(this, arguments);

			var oViewModel = new JSONModel({
				isPhone: Device.system.phone
			});
			this.setModel(oViewModel, "ViewEntities");

			this.getRouter().getRoute("entities").attachMatched(function (oEvent) {

				var oModel = this.getModel("services");
				var bindingElementList = new Binding(oModel, "/", oModel.getContext("/selectedEntity"));
				bindingElementList.attachChange(function (oEventChange) {
					this._bindEntitiesRows();
				}.bind(this));

				this._bindEntitiesRows();
			}.bind(this));

			Device.media.attachHandler(function (oDevice) {
				this.getModel("ViewEntities").setProperty("/isPhone", oDevice.name === "Phone");
			}.bind(this));
		},

		_bindEntitiesRows: function () {

			let sBindEntity = this.getModel("services").getProperty("/selectedEntity");
			let aEntities = this.getModel("services").getProperty("/selectedService/metadataForDetails/entitiesList");

			if (!aEntities) {
				return;
			}

			let oEntity = aEntities.find(x => x.key === sBindEntity);
			if (!oEntity) {
				return;
			}

			this.getModel("ViewEntities").setProperty("/entityBindedKey", oEntity.text);

			this.byId("EntitiesTable").bindRows({
				path: "services>/selectedService/metadataForDetails/entities/" + sBindEntity,
				parameters: {
					operationMode: "Client"
				},
				sorter: [new Sorter({
					path: "order",
					descending: false
				}), new Sorter({
					path: "Name",
					descending: true
				})]
			});
		},

		onNavToEntity: function (oEvent) {
			let oLineSelected = oEvent.getSource().getBindingContext("services").getObject();
			this.getModel("services").setProperty("/selectedEntity", oLineSelected.toEntity);
		},

		onEntitiesRowsUpdate: function (oEvent) {
			var iCount = oEvent.getSource().getBinding("rows").getLength();
			var sEntityBinded = this.getModel("ViewEntities").getProperty("/entityBindedKey");
			var sTitle = this.getI18nText("EntitiesTableTitle", [sEntityBinded, iCount]);
			this.getModel("ViewEntities").setProperty("/TableTitle", sTitle);
			this.autoResizeColumns("EntitiesTable");
		},

		onChangeEntity: function () {
			this._clearFilters();
			this._bindEntitiesRows();
		},

		onEntitySearch: function (oEvent) {
			let aFields = ["name", "type", "nullable", "maxLength", "precision", "scale", "toEntity"];
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

			this.byId("EntitiesTable").getBinding("rows").filter(oFilterAll);
			jQuery.sap.delayedCall(200, this, function () {
				this.byId("SearchEntities").focus();
			});
		},

		_clearFilters: function () {
			let oTable = this.byId("EntitiesTable");
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
			this.byId("SearchEntities").setValue("").fireLiveChange();
		}

	});
});