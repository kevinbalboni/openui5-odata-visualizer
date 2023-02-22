sap.ui.define([
	"openui5-odata-visualizer/controller/BaseController",
	"jquery.sap.global",
	"sap/ui/model/json/JSONModel",
	"sap/m/ResponsivePopover",
	"sap/m/MessagePopover",
	"sap/m/ActionSheet",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/Input",
	"sap/m/Link",
	"sap/ui/layout/form/SimpleForm",
	"sap/m/NotificationListItem",
	"sap/m/MessageItem",
	"sap/ui/core/CustomData",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/m/MessageStrip",
	"sap/m/Dialog",
	"sap/ui/Device",
	"sap/ui/core/routing/HashChanger",
	"sap/m/library",
	"sap/m/ButtonType",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/m/Image",
	"sap/m/FlexBox",
	"sap/m/CheckBox",
	"sap/m/Select",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"sap/ui/core/Item"
], function (BaseController, jQuery, JSONModel, ResponsivePopover, MessagePopover, ActionSheet, Button, Label, Text,
	Input, Link, SimpleForm, NotificationListItem, MessageItem, CustomData, MessageToast, MessageBox, MessageStrip,
	Dialog, Device, HashChanger, library, ButtonType, ODataModelV2, Image, FlexBox, CheckBox,
	Select, Filter, FilterOperator, Sorter, Item) {

	"use strict";

	return BaseController.extend("openui5-odata-visualizer.controller.App", {

		_bExpanded: true,

		onInit: function () {
			BaseController.prototype.onInit.apply(this, arguments);
			this.getLogger(this.getControllerName()).info("onInit");

			var oViewModel = new JSONModel({
				isPhone: Device.system.phone
			});

			this.setModel(oViewModel, "appView");

			// if the app starts on desktop devices with small or meduim screen size, collaps the sid navigation
			if (Device.resize.width <= 1024) {
				this.onSideNavButtonPress();
			}
			Device.media.attachHandler(function (oDevice) {
				this.getModel("appView").setProperty("/isPhone", oDevice.name === "Phone");
				if ((oDevice.name === "Tablet" && this._bExpanded) || oDevice.name === "Desktop") {
					this.onSideNavButtonPress();
					// set the _bExpanded to false on tablet devices
					// extending and collapsing of side navigation should be done when resizing from
					// desktop to tablet screen sizes)
					this._bExpanded = (oDevice.name === "Desktop");
				}
			}.bind(this));

		},

		onItemSelect: function (oEvent) {
			var oItem = oEvent.getParameter("item");
			var sKey = oItem.getKey();
			// if you click on home, settings or statistics button, call the navTo function

			if (oItem.getCustomData().length > 0 && oItem.getCustomData()[0].getValue()) {
				oItem.setExpanded(!oItem.getExpanded());
			} else {

				// if the device is phone, collaps the navigation side of the app to give more space
				if (Device.system.phone) {
					this.onSideNavButtonPress();
				}
				this.getRouter().navTo(sKey);
			}
		},

		onHomeIconPressed: function (oEvent) {
			this.getRouter().navTo("home");
		},

		onUserNamePress: function (oEvent) {
			var oLogger = this.getLogger(this.getControllerName());
			oLogger.info("onUserNamePress");


			// close message popover
			var oMessagePopover = this.byId("errorMessagePopover");
			if (oMessagePopover && oMessagePopover.isOpen()) {
				oMessagePopover.destroy();
			}

			var fnHandleUserMenuItemPress = function (oEventPress) {

				switch (oEventPress.getSource().getCustomData()[0].getKey()) {

					case "Theme":
						this._onChangeTheme();
						break;
				}

			}.bind(this);

			var oActionSheet = new ActionSheet({
				title: "test",
				showCancelButton: this.getModel("appView").getProperty("/isPhone"),
				buttons: [
					new Button({
						text: this.getI18nText("userHeaderTheme"),
						type: ButtonType.Transparent,
						press: fnHandleUserMenuItemPress,
						icon: "sap-icon://palette",
						iconFirst: true,
						customData: [
							new CustomData({
								key: "Theme"
							})
						]
					})
				],
				afterClose: function () {
					oActionSheet.destroy();
				}
			});


			oActionSheet.openBy(oEvent.getSource());
		},

		onSideNavButtonPress: function () {
			var oToolPage = this.byId("app");
			var bSideExpanded = oToolPage.getSideExpanded();
			this._setToggleButtonTooltip(bSideExpanded);
			oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
		},

		_setToggleButtonTooltip: function (bSideExpanded) {
			var oToggleButton = this.byId("sideNavigationToggleButton");
			if (bSideExpanded) {
				oToggleButton.setTooltip("Large Size Navigation");
			} else {
				oToggleButton.setTooltip("Small Size Navigation");
			}
		},

		_onChangeTheme: function () {

			var oDialog = new Dialog({
				title: this.getI18nText("ThemeTitle"),
				draggable: true,
				content: [new SimpleForm({
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
					content: [new Select({
						width: "100%",
						editable: true,
						selectedKey: "{appView>/themeSelected}",
						change: function (oEvent) {
							var sTheme = oEvent.getParameter("selectedItem").getKey();
							sap.ui.getCore().applyTheme(sTheme);
						},
						items: {
							path: "themes>/themes",
							template: new Item({
								key: "{themes>name}",
								text: "{themes>name}"
							}),
							templateShareable: false
						}
					})]
				})],
				beginButton: new Button({
					text: this.getI18nText("ThemeConfirm"),
					type: "Accept",
					press: function (oEvent) {
						var sTheme = this.getModel("appView").getProperty("/themeSelected");
						localStorage.setItem("Wispin_UI5_Theme", sTheme);
						oDialog.close();
					}.bind(this)
				}),
				endButton: new Button({
					text: this.getI18nText("ThemeClose"),
					type: "Reject",
					press: function (oEvent) {
						var sTheme = localStorage.getItem("Wispin_UI5_Theme");
						if (!sTheme) {
							sTheme = sap.ui.getCore().getConfiguration().getTheme();
						}
						sap.ui.getCore().applyTheme(sTheme);
						oDialog.close();
					}
				}),
				beforeOpen: function () {
					var sTheme = localStorage.getItem("Wispin_UI5_Theme");
					if (!sTheme) {
						sTheme = sap.ui.getCore().getConfiguration().getTheme();
					}
					this.getModel("appView").setProperty("/themeSelected", sTheme);
				}.bind(this),
				afterClose: function () {
					this.getView().removeDependent(oDialog);
					oDialog.destroy();
				}.bind(this)
			});

			this.getView().addDependent(oDialog);
			oDialog.open();
		}

	});
});

