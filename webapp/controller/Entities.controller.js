sap.ui.define([
	"openui5-odata-visualizer/controller/BaseController",
	"openui5-odata-visualizer/model/tableExport",
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
], function (BaseController, tableExport, JSONModel, Filter, FilterOperator, Device, Dialog, Button,
	Label, Text, MessageBox, Input, InputType, SimpleForm, Binding, Column, Sorter) {
	"use strict";

	return BaseController.extend("openui5-odata-visualizer.controller.Entities", {

		onInit: function () {
			this.getLogger(this.getControllerName()).info("onInit");
			BaseController.prototype.onInit.apply(this, arguments);

			let oViewModel = new JSONModel({
				isPhone: Device.system.phone
			});
			this.setModel(oViewModel, "ViewEntities");

			this.getRouter().getRoute("entities").attachMatched(function (oEvent) {

				let oModel = this.getModel("services");
				let bindingElementList = new Binding(oModel, "/", oModel.getContext("/selectedEntity"));
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
			let iCount = oEvent.getSource().getBinding("rows").getLength();
			let sEntityBinded = this.getModel("ViewEntities").getProperty("/entityBindedKey");
			let sTitle = this.getI18nText("EntitiesTableTitle", [sEntityBinded, iCount]);
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

				for (let bk = 0; bk < aFields.length; bk++) {
					oFilterAll.aFilters.push(
						new Filter({
							path: aFields[bk],
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

		onEntityExportToFile: function (oEvent) {
			let sKey = oEvent.getParameter("item").getKey();
			let sBindingPath = this.byId("EntitiesTable").getBinding().getPath();
			let aProperties = this.getModel("services").getProperty(sBindingPath);
			let sEntityBinded = this.getModel("ViewEntities").getProperty("/entityBindedKey");

			tableExport.export(sKey, aProperties, this.getI18nText("Entity"), sEntityBinded);
		},

		_clearFilters: function () {
			let oTable = this.byId("EntitiesTable");
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
			this.byId("SearchEntities").setValue("").fireLiveChange();
		}

	});
});