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

	return BaseController.extend("openui5-odata-visualizer.controller.Metadata", {

		onInit: function () {
			this.getLogger(this.getControllerName()).info("onInit");
			BaseController.prototype.onInit.apply(this, arguments);

			var oViewModel = new JSONModel({
				isPhone: Device.system.phone,
				metadata_formatted: ""
			});
			this.setModel(oViewModel, "ViewMetadata");

			/* this.getRouter().getRoute("metadata").attachMatched(function (oEvent) {
				this._attachRouteMatched(oEvent);
			}.bind(this)); */

			Device.media.attachHandler(function (oDevice) {
				this.getModel("ViewMetadata").setProperty("/isPhone", oDevice.name === "Phone");
			}.bind(this));
		},

		/* _attachRouteMatched: function (oEvent) {
			let sSelectedID = this.getModel("services").getProperty("/selectedServiceID");
			let aServices = this.getModel("services").getProperty("/services");
			let oService = aServices.find(x => x.ID === sSelectedID);

			if (metadata_formatted === "") {
				//this
				return;
			}

			this.getModel("services").setProperty("/selectedService", oService.metadata_formatted);
		} */

		onSaveMetadata: function () {
			let oSelectedService = this.getModel("services").getProperty("/selectedService");
			let encodedUri = encodeURI("data:Application/octet-stream;charset=utf-8," + oSelectedService.metadata);
			let link = document.createElement("a");
			link.setAttribute("href", encodedUri);
			link.setAttribute("download", oSelectedService.name + ".xml");
			document.body.appendChild(link);
			link.click();
		}

	});
});