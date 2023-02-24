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

	return BaseController.extend("openui5-odata-visualizer.controller.Datas", {

		onInit: function () {
			this.getLogger(this.getControllerName()).info("onInit");
			BaseController.prototype.onInit.apply(this, arguments);

			var oViewModel = new JSONModel({
				isPhone: Device.system.phone,
				selectedEntity: null
			});
			this.setModel(oViewModel, "ViewDatas");

			/* this.getRouter().getRoute("entities").attachMatched(function (oEvent) {
				this._attachRouteMatched(oEvent);
			}.bind(this)); */

			Device.media.attachHandler(function (oDevice) {
				this.getModel("ViewDatas").setProperty("/isPhone", oDevice.name === "Phone");
			}.bind(this));

			setTimeout(function () {

				var oModel = this.getOwnerComponent().getModel("services");
				var bindingElementList = new Binding(oModel, "/", oModel.getContext("/selectedService"));
				bindingElementList.attachChange(function (oEvent) {
					this.getLogger(this.getControllerName()).info("attachChange");
					this._refresh(oEvent.getSource().getModel());
				}.bind(this));

				this._refresh(oModel);

			}.bind(this), 1000);
		},

		_refresh: function (oModel) {
			let oService = oModel.getProperty("/selectedService");
			let oTable = this.byId("EntitiesTable");
			this._createColumns(oService, oTable);
			this._bindRows(oService, oTable);
		},

		_createColumns: function (oService, oTable) {

			let oSelectedEntity = this.getModel("ViewDatas").getProperty("/selectedEntity");
			let oEntity = oService.metadataForServices.Entitites.find(x => x.Name === oSelectedEntity);
			let aColumns = [];

			for (let bk = 0; bk < oEntity.Childs.length; bk++) {
				if (oEntity.Childs[bk].Name === "properties") {
					for (let zz = 0; zz < oEntity.Childs[bk].Childs.length; zz++) {

						oTable.addColumn(new Column({
							label: oEntity.Childs[bk].Childs[zz].Name,
							template: this._cellTemplate(oEntity.Childs[bk].Childs[zz].Name),
							autoResizable: true,
							filterProperty: oEntity.Childs[bk].Childs[zz].Name,
							sortProperty: oEntity.Childs[bk].Childs[zz].Name
							/* tooltip: o["sap:label"] ? o["sap:label"] : o.name,
							label: o.name,
							template: this._cellTemplate(o),
							filterProperty: o.name,
							sortProperty: o.name,
							autoResizable: true,
							showFilterMenuEntry: o.type !== "Edm.String" ? false : true */
						}));

					}
				}
			}

		},

		_cellTemplate: function (name) {
			return new sap.m.Text({
				text: "{user>" + name + "}"
			});
		},

		_bindRows: function (oService, oTable) {

			let oSelectedEntity = this.getModel("ViewDatas").getProperty("/selectedEntity");


			oTable.bindRows({
				path: "services>/selectedEntity/metadataForDetails/entities/" + oSelectedEntity.toLowerCase(),
				parameters: {
					operationMode: "Client"
				},
				sorter: [new Sorter({
					path: "Name",
					descending: true
				})]
			});

		}

	});
});