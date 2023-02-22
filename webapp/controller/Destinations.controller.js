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

	return BaseController.extend("openui5-odata-visualizer.controller.Destinations", {

		onInit: function () {
			this.getLogger(this.getControllerName()).info("onInit");
			BaseController.prototype.onInit.apply(this, arguments);

			var oViewModel = new JSONModel({
				isPhone: Device.system.phone
			});
			this.setModel(oViewModel, "ViewDestination");

			/* this.getRouter().getRoute("destinations").attachMatched(function (oEvent) {
				this._attachRouteMatched(oEvent);
			}.bind(this)); */

			Device.media.attachHandler(function (oDevice) {
				this.getModel("ViewDestination").setProperty("/isPhone", oDevice.name === "Phone");
			}.bind(this));
		},

		onDestinationUpdateFinished: function (oEvent) {
			this.getLogger(this.getControllerName()).info("onDestinationUpdateFinished");

			let sTitle,
				iTotalItems = oEvent.getParameter("total"),
				oItemsBinding = oEvent.getSource().getBinding("items");

			if (oItemsBinding.isLengthFinal()) {
				if (iTotalItems) {
					sTitle = this.getI18nText("DestinationListTitleCount", [iTotalItems]);
				} else {
					sTitle = this.getI18nText("Destinations");
				}
				this.getModel("ViewDestination").setProperty("/ListTitle", sTitle);
			}
		},

		onDestinationCreate: function () {

			var oDialogDestinationsCreate = new Dialog({
				title: this.getI18nText("DestinationsCreateTitle"),
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
								text: this.getI18nText("DestinationName")
							}),
							new Input({
								id: "NewDestinationName",
								maxLength: 40,
								value: "{NewDestination>/name}",
								liveChange: function (oEvent) {
									let sText = oEvent.getParameter("value").trim();
									this.getModel("NewDestination").setProperty("/name", sText);
									let oNewDestination = this.getModel("NewDestination").getData();
									let oInputName = sap.ui.getCore().byId("NewDestinationName");
									let oInputURL = sap.ui.getCore().byId("NewDestinationURL");
									this.checkData(oNewDestination, oDialogDestinationsCreate, oInputName, oInputURL);
								}.bind(this),
								submit: function () {
									sap.ui.getCore().byId("NewDestinationURL").focus();
								}.bind(this)
							}),
							new Label({
								required: true,
								text: this.getI18nText("DestinationURL")
							}),
							new Input({
								id: "NewDestinationURL",
								value: "{NewDestination>/url}",
								type: InputType.Url,
								liveChange: function (oEvent) {
									let sText = oEvent.getParameter("value").trim();
									this.getModel("NewDestination").setProperty("/url", sText);
									let oNewDestination = this.getModel("NewDestination").getData();
									let oInputName = sap.ui.getCore().byId("NewDestinationName");
									let oInputURL = sap.ui.getCore().byId("NewDestinationURL");
									this.checkData(oNewDestination, oDialogDestinationsCreate, oInputName, oInputURL);

								}.bind(this),
								submit: function () {
									if (oDialogDestinationsCreate.getBeginButton().getEnabled()) {
										oDialogDestinationsCreate.getBeginButton().firePress();
									}
								}
							}),
						]
					})],
				beginButton: new Button({
					text: this.getI18nText("DestinationsCreateConfirm"),
					type: "Accept",
					enabled: true,
					press: function () {
						let oNewDestionation = this.getModel("NewDestination").getData();
						let oDestinations = this.getModel("destinations").getProperty("/destinations");

						oDestinations.push(oNewDestionation);
						this.getModel("destinations").setProperty("/destinations", oDestinations);
						oDialogDestinationsCreate.close();
					}
				}),
				endButton: new Button({
					text: this.getI18nText("DestinationsCreateCancel"),
					type: "Reject",
					press: function () {
						oDialogDestinationsCreate.close();
					}
				}),
				afterClose: function () {
					oDialogDestinationsCreate.destroy();
				},
				beforeOpen: function () {

					var oNewDestination = new JSONModel({
						ID: self.crypto.randomUUID(),
						name: "",
						url: ""
					});
					this.setModel(oNewDestination, "NewDestination");

				}.bind(this)
			});

			this.getView().addDependent(oDialogDestinationsCreate);
			oDialogDestinationsCreate.open();

		},

		onDestinationDelete: function (oEvent) {
			let oDestinations = this.getModel("destinations").getProperty("/destinations");
			let oDestinationToDelete = oEvent.getParameter("listItem").getBindingContext("destinations").getObject();

			let n = oDestinations.indexOf(oDestinationToDelete);
			oDestinationToDelete = oDestinations.splice(n, 1);
			this.getModel("destinations").setProperty("/destinations", oDestinations);
		},

		onDestinationDetailPress: function (oEvent) {
			let oDestination = oEvent.getSource().getBindingContext("destinations").getObject();

			var oDestinationToEdit = jQuery.extend(true, {}, oDestination);
			this.setModel(new JSONModel(oDestinationToEdit), "EditDestination");

			var oDialogDestinationsEdit = new Dialog({
				title: this.getI18nText("DestinationsDetailTitle"),
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
								text: this.getI18nText("DestinationName")
							}),
							new Input({
								id: "EditDestinationName",
								maxLength: 40,
								value: "{EditDestination>/name}",
								liveChange: function (oEvent) {
									let sText = oEvent.getParameter("value").trim();
									this.getModel("EditDestination").setProperty("/name", sText);
									let oEditDestination = this.getModel("EditDestination").getData();
									let oInputName = sap.ui.getCore().byId("EditDestinationName");
									let oInputURL = sap.ui.getCore().byId("EditDestinationURL");
									this.checkData(oEditDestination, oDialogDestinationsEdit, oInputName, oInputURL);
								}.bind(this),
								submit: function () {
									sap.ui.getCore().byId("EditDestinationURL").focus();
								}.bind(this)
							}),
							new Label({
								required: true,
								text: this.getI18nText("DestinationURL")
							}),
							new Input({
								id: "EditDestinationURL",
								value: "{EditDestination>/url}",
								type: InputType.Url,
								liveChange: function (oEvent) {
									let sText = oEvent.getParameter("value").trim();
									this.getModel("EditDestination").setProperty("/url", sText);
									let oEditDestination = this.getModel("EditDestination").getData();
									let oInputName = sap.ui.getCore().byId("EditDestinationName");
									let oInputURL = sap.ui.getCore().byId("EditDestinationURL");
									this.checkData(oEditDestination, oDialogDestinationsEdit, oInputName, oInputURL);

								}.bind(this),
								submit: function () {
									if (oDialogDestinationsEdit.getBeginButton().getEnabled()) {
										oDialogDestinationsEdit.getBeginButton().firePress();
									}
								}
							}),
						]
					})],
				beginButton: new Button({
					text: this.getI18nText("DestinationsCreateConfirm"),
					type: "Accept",
					enabled: false,
					press: function () {
						let oEditDestionation = this.getModel("EditDestination").getData();
						let oDestinations = this.getModel("destinations").getProperty("/destinations");
						let oDestinationOriginal = oDestinations.find(x => x.ID === oEditDestionation.ID);
						let n = oDestinations.indexOf(oDestinationOriginal);
						oDestinations.splice(n, 1);
						oDestinations.push(oEditDestionation);
						this.getModel("destinations").setProperty("/destinations", oDestinations);
						oDialogDestinationsEdit.close();
					}
				}),
				endButton: new Button({
					text: this.getI18nText("DestinationsCreateCancel"),
					type: "Reject",
					press: function () {
						oDialogDestinationsEdit.close();
					}
				}),
				afterClose: function () {
					oDialogDestinationsEdit.destroy();
				}
			});

			this.getView().addDependent(oDialogDestinationsEdit);
			oDialogDestinationsEdit.open();

		},

		onDestinationSearch: function (oEvent) {
			let sSearchValue = oEvent.getSource().getValue();
			let oFilterAll = [];

			if (oEvent.getParameter("refreshButtonPressed")) {
				this.getModel("destinations").refresh();
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

			this.byId("DestinationsTable").getBinding("items").filter(oFilterAll);
		},

		checkData: function (oDestination, oDialogDestinations, oInputName, oInputURL) {
			let bError = false;

			if (oDestination.name === "") {
				oInputName.setValueState("Error");
				bError = true;
			} else {
				oInputName.setValueState("None");
			}

			if (oDestination.url === "" || !this.isValidURL(oDestination.url) /* || this.URLAlreadyExist(oNewDestionation.url) */) {
				oInputURL.setValueState("Error");
				oInputURL.setValueStateText(this.getI18nText("DestinationURLInvalid"));
				bError = true;
			} else {
				oInputURL.setValueState("None");
			}

			if (bError) {
				oDialogDestinations.getBeginButton().setEnabled(false);
			} else {
				oDialogDestinations.getBeginButton().setEnabled(true);
			}

		},

		isValidURL: function (sUrl) {
			var t = document.createElement("a");
			t.href = sUrl;
			return t.host && t.host != window.location.host
		}

		/* URLAlreadyExist: function (e) {
			var oDestinations = this.getModel("destinations").getProperty("/destinations");
			for (var i = 0; i < t.length; i++) {
				if (t[i].Address === e && i != this.iLastRowIndex) {
					return true
				}
			}
			return false
		} */

	});
});