sap.ui.define([
	"openui5-odata-visualizer/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (BaseController, JSONModel, Device) {
	"use strict";

	return BaseController.extend("openui5-odata-visualizer.controller.Credits", {

		onInit: function () {
			this.getLogger(this.getControllerName()).info("onInit");
			BaseController.prototype.onInit.apply(this, arguments);

			var oViewModel = new JSONModel({
				isPhone: Device.system.phone
			});
			this.setModel(oViewModel, "CreditsView");

			this.getRouter().getRoute("credits").attachMatched(function (oEvent) {
				this._attachRouteMatched(oEvent);
			}.bind(this));

			Device.media.attachHandler(function (oDevice) {
				this.getModel("CreditsView").setProperty("/isPhone", oDevice.name === "Phone");
			}.bind(this));
		},

		_attachRouteMatched: function (oEvent) {

		}

	});
});