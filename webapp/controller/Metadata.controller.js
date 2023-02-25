sap.ui.define([
	"openui5-odata-visualizer/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (BaseController, JSONModel, Device) {
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