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

	return BaseController.extend("openui5-odata-visualizer.controller.Services", {

		onInit: function () {
			this.getLogger(this.getControllerName()).info("onInit");
			BaseController.prototype.onInit.apply(this, arguments);

			var oViewModel = new JSONModel({
				isPhone: Device.system.phone
			});
			this.setModel(oViewModel, "ViewService");

			/* this.getRouter().getRoute("services").attachMatched(function (oEvent) {
				this._attachRouteMatched(oEvent);
			}.bind(this)); */

			Device.media.attachHandler(function (oDevice) {
				this.getModel("ViewService").setProperty("/isPhone", oDevice.name === "Phone");
			}.bind(this));
		},

		onServiceUpdateFinished: function (oEvent) {
			this.getLogger(this.getControllerName()).info("onServiceUpdateFinished");

			let sTitle,
				iTotalItems = oEvent.getParameter("total"),
				oItemsBinding = oEvent.getSource().getBinding("items");

			if (oItemsBinding.isLengthFinal()) {
				if (iTotalItems) {
					sTitle = this.getI18nText("ServiceListTitleCount", [iTotalItems]);
				} else {
					sTitle = this.getI18nText("Services");
				}
				this.getModel("ViewService").setProperty("/ListTitle", sTitle);
			}
		},

		onServiceCreate: function () {

			var oDialogServicesCreate = new Dialog({
				title: this.getI18nText("ServicesCreateTitle"),
				contentWidth: "500px",
				stretchOnPhone: true,
				content: [
					new SimpleForm({
						editable: true,
						layout: "ResponsiveGridLayout",
						labelSpanXL: 2,
						labelSpanL: 2,
						labelSpanM: 2,
						labelSpanS: 12,
						emptySpanXL: 3,
						emptySpanL: 2,
						emptySpanM: 1,
						emptySpanS: 0,
						columnsXL: 1,
						columnsL: 1,
						columnsM: 1,
						backgroundDesign: "Solid",
						content: [
							new Label({
								required: true,
								text: this.getI18nText("ServiceName")
							}),
							new Input({
								id: "NewServiceName",
								maxLength: 40,
								value: "{NewService>/name}",
								liveChange: function (oEvent) {
									let sText = oEvent.getParameter("value").trim();
									this.getModel("NewService").setProperty("/name", sText);
									let oNewService = this.getModel("NewService").getData();
									let oInputName = sap.ui.getCore().byId("NewServiceName");
									let oInputURL = sap.ui.getCore().byId("NewServiceURL");
									this.checkData(oNewService, oDialogServicesCreate, oInputName, oInputURL);
								}.bind(this),
								submit: function () {
									sap.ui.getCore().byId("NewServiceURL").focus();
								}
							}),
							new Label({
								required: true,
								text: this.getI18nText("ServiceURL")
							}),
							new Input({
								id: "NewServiceURL",
								value: "{NewService>/url}",
								type: InputType.Url,
								liveChange: function (oEvent) {
									let sText = oEvent.getParameter("value").trim();
									this.getModel("NewService").setProperty("/url", sText);
									let oNewService = this.getModel("NewService").getData();
									let oInputName = sap.ui.getCore().byId("NewServiceName");
									let oInputURL = sap.ui.getCore().byId("NewServiceURL");
									this.checkData(oNewService, oDialogServicesCreate, oInputName, oInputURL);

								}.bind(this),
								submit: function () {
									if (oDialogServicesCreate.getBeginButton().getEnabled()) {
										oDialogServicesCreate.getBeginButton().firePress();
									}
								}
							})
						]
					})],
				beginButton: new Button({
					text: this.getI18nText("ServicesCreateConfirm"),
					type: "Accept",
					enabled: true,
					press: function () {
						let oNewDestionation = this.getModel("NewService").getData();
						let oServices = this.getModel("services").getProperty("/services");

						oServices.push(oNewDestionation);
						this.getModel("services").setProperty("/services", oServices);
						oDialogServicesCreate.close();
					}
				}),
				endButton: new Button({
					text: this.getI18nText("ServicesCreateCancel"),
					type: "Reject",
					press: function () {
						oDialogServicesCreate.close();
					}
				}),
				afterClose: function () {
					oDialogServicesCreate.destroy();
				},
				beforeOpen: function () {

					var oNewService = new JSONModel({
						ID: self.crypto.randomUUID(),
						name: "",
						url: ""
					});
					this.setModel(oNewService, "NewService");

				}.bind(this)
			});

			this.getView().addDependent(oDialogServicesCreate);
			oDialogServicesCreate.open();

		},

		onServiceDelete: function (oEvent) {
			let oServices = this.getModel("services").getProperty("/services");
			let oServiceToDelete = oEvent.getParameter("listItem").getBindingContext("services").getObject();

			let n = oServices.indexOf(oServiceToDelete);
			oServiceToDelete = oServices.splice(n, 1);
			this.getModel("services").setProperty("/services", oServices);
		},

		onServiceDetailPress: function (oEvent) {
			let oService = oEvent.getSource().getBindingContext("services").getObject();

			var oServiceToEdit = jQuery.extend(true, {}, oService);
			this.setModel(new JSONModel(oServiceToEdit), "EditService");

			var oDialogServicesEdit = new Dialog({
				title: this.getI18nText("ServicesDetailTitle"),
				contentWidth: "500px",
				stretchOnPhone: true,
				content: [
					new SimpleForm({
						editable: true,
						layout: "ResponsiveGridLayout",
						labelSpanXL: 2,
						labelSpanL: 2,
						labelSpanM: 2,
						labelSpanS: 12,
						emptySpanXL: 3,
						emptySpanL: 2,
						emptySpanM: 1,
						emptySpanS: 0,
						columnsXL: 1,
						columnsL: 1,
						columnsM: 1,
						backgroundDesign: "Solid",
						content: [
							new Label({
								required: true,
								text: this.getI18nText("ServiceName")
							}),
							new Input({
								id: "EditServiceName",
								maxLength: 40,
								value: "{EditService>/name}",
								liveChange: function (oEventLiveChange) {
									let sText = oEventLiveChange.getParameter("value").trim();
									this.getModel("EditService").setProperty("/name", sText);
									let oEditService = this.getModel("EditService").getData();
									let oInputName = sap.ui.getCore().byId("EditServiceName");
									let oInputURL = sap.ui.getCore().byId("EditServiceURL");
									this.checkData(oEditService, oDialogServicesEdit, oInputName, oInputURL);
								}.bind(this),
								submit: function () {
									sap.ui.getCore().byId("EditServiceURL").focus();
								}
							}),
							new Label({
								required: true,
								text: this.getI18nText("ServiceURL")
							}),
							new Input({
								id: "EditServiceURL",
								value: "{EditService>/url}",
								type: InputType.Url,
								liveChange: function (oEventLiveChange) {
									let sText = oEventLiveChange.getParameter("value").trim();
									this.getModel("EditService").setProperty("/url", sText);
									let oEditService = this.getModel("EditService").getData();
									let oInputName = sap.ui.getCore().byId("EditServiceName");
									let oInputURL = sap.ui.getCore().byId("EditServiceURL");
									this.checkData(oEditService, oDialogServicesEdit, oInputName, oInputURL);

								}.bind(this),
								submit: function () {
									if (oDialogServicesEdit.getBeginButton().getEnabled()) {
										oDialogServicesEdit.getBeginButton().firePress();
									}
								}
							})
						]
					})],
				beginButton: new Button({
					text: this.getI18nText("ServicesCreateConfirm"),
					type: "Accept",
					enabled: false,
					press: function () {
						let oEditDestionation = this.getModel("EditService").getData();
						let oServices = this.getModel("services").getProperty("/services");
						let oServiceOriginal = oServices.find(x => x.ID === oEditDestionation.ID);
						let n = oServices.indexOf(oServiceOriginal);
						oServices.splice(n, 1);
						oServices.push(oEditDestionation);
						this.getModel("services").setProperty("/services", oServices);
						oDialogServicesEdit.close();
					}
				}),
				endButton: new Button({
					text: this.getI18nText("ServicesCreateCancel"),
					type: "Reject",
					press: function () {
						oDialogServicesEdit.close();
					}
				}),
				afterClose: function () {
					oDialogServicesEdit.destroy();
				}
			});

			this.getView().addDependent(oDialogServicesEdit);
			oDialogServicesEdit.open();

		},

		onServiceSearch: function (oEvent) {
			let sSearchValue = oEvent.getSource().getValue();
			let oFilterAll = [];

			if (oEvent.getParameter("refreshButtonPressed")) {
				this.getModel("services").refresh();
			}

			if (sSearchValue && sSearchValue.length > 0) {
				var oFilter0 = new Filter({
					path: "name",
					operator: FilterOperator.Contains,
					value1: sSearchValue,
					caseSensitive: false
				});

				var oFilter1 = new Filter({
					path: "url",
					operator: FilterOperator.Contains,
					value1: sSearchValue,
					caseSensitive: false
				});

				oFilterAll = new Filter({
					filters: [
						oFilter0, oFilter1
					],
					and: false
				});
			}

			this.byId("ServicesTable").getBinding("items").filter(oFilterAll);
		},

		checkData: function (oService, oDialogServices, oInputName, oInputURL) {
			let bError = false;

			if (oService.name === "") {
				oInputName.setValueState("Error");
				bError = true;
			} else {
				oInputName.setValueState("None");
			}

			if (oService.url === "" || !this.isValidURL(oService.url) /* || this.URLAlreadyExist(oNewDestionation.url) */) {
				oInputURL.setValueState("Error");
				oInputURL.setValueStateText(this.getI18nText("ServiceURLInvalid"));
				bError = true;
			} else {
				oInputURL.setValueState("None");
			}

			if (bError) {
				oDialogServices.getBeginButton().setEnabled(false);
			} else {
				oDialogServices.getBeginButton().setEnabled(true);
			}

		},

		isValidURL: function (sUrl) {
			var t = document.createElement("a");
			t.href = sUrl;
			return t.host && t.host !== window.location.host;
		}

		/* URLAlreadyExist: function (e) {
			var oServices = this.getModel("services").getProperty("/services");
			for (let bk = 0; bk < t.length; bk++) {
				if (t[bk].Address === e && bk != this.iLastRowIndex) {
					return true
				}
			}
			return false
		} */

	});
});