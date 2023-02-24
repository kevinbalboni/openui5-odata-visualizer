sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/base/Log"
], function (Controller, History, Log) {
	"use strict";

	return Controller.extend("openui5-odata-visualizer.controller.BaseController", {
		_oLogger: null,

		onInit: function () {

		},
		/*onExit: function () {
			//this.getRouter().detachRouteMatched(this._attachRouteMatched, this);
		},*/
		getLogger: function (sController) {
			this._oLogger = Log.getLogger(sController);
			//this._oLogger.setLevel(Log.Level.INFO);
			return this._oLogger;
		},
		getControllerName: function () {
			return this.getView().getControllerName();
		},
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		getI18nText: function (sText, a) {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sText, a);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},
		/**
		 * Event handler for navigating back.
		 * We navigate back in the browser historz
		 * @public
		 */
		onNavBack: function (oEvent) {
			var oHistory,
				sPreviousHash;
			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("home", {}, true /*no history*/);
			}
		},

		autoResizeColumns: function (sTableID) {
			let oTable = this.byId(sTableID) ? this.byId(sTableID) : sap.ui.getCore().byId(sTableID);
			if (oTable) {
				let aColumns = oTable.getColumns();
				if (aColumns && Array.isArray(aColumns)) {
					for (let bk = aColumns.length - 1; bk >= 0; bk--) {
						oTable.autoResizeColumn(bk);
					}
				}
			}
		}
	});

});