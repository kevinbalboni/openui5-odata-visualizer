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
	"sap/ui/layout/form/SimpleForm"
], function (BaseController, JSONModel, Filter, FilterOperator, Device, Dialog, Button,
	Label, Text, MessageBox, Input, InputType, SimpleForm) {
	"use strict";

	return BaseController.extend("openui5-odata-visualizer.controller.Entities", {

		onInit: function () {
			this.getLogger(this.getControllerName()).info("onInit");
			BaseController.prototype.onInit.apply(this, arguments);

			var oViewModel = new JSONModel({
				isPhone: Device.system.phone
			});
			this.setModel(oViewModel, "ViewEntities");

			/* this.getRouter().getRoute("services").attachMatched(function (oEvent) {
				this._attachRouteMatched(oEvent);
			}.bind(this)); */

			Device.media.attachHandler(function (oDevice) {
				this.getModel("ViewEntities").setProperty("/isPhone", oDevice.name === "Phone");
			}.bind(this));
		}

	});
});