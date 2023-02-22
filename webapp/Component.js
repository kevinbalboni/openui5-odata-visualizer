sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
], function (UIComponent, JSONModel) {
    "use strict";

    return UIComponent.extend("openui5-odata-visualizer.Component", {

        metadata: {
            manifest: "json"
        },

        init: function () {

            UIComponent.prototype.init.apply(this, arguments);
            this.getRouter().initialize();

            var sTheme = localStorage.getItem("OdataVisualizer_UI5_Theme");
            if (sTheme) {
                sap.ui.getCore().applyTheme(sTheme);
            }

            // this.getModel("menu_navigations").dataLoaded().then(function () {
            let aNavigations = {
                navigations: this.getModel("menu_navigations").getProperty("/navigations"),
                fixedNavigations: this.getModel("menu_navigations").getProperty("/fixedNavigations")
            };

            for (let i = 0; i < aNavigations.navigations.length; i++) {
                switch (aNavigations.navigations[i].key) {
                    case "home":
                        aNavigations.navigations[i].title = this.getModel("i18n").getResourceBundle().getText("Home");
                        break;
                    case "services":
                        aNavigations.navigations[i].title = this.getModel("i18n").getResourceBundle().getText("Services");
                        break;
                    case "entities":
                        aNavigations.navigations[i].title = this.getModel("i18n").getResourceBundle().getText("Entities");
                        break;
                    case "metadata":
                        aNavigations.navigations[i].title = this.getModel("i18n").getResourceBundle().getText("Metadata");
                        break;
                }
            }

            for (let i = 0; i < aNavigations.fixedNavigations.length; i++) {
                switch (aNavigations.fixedNavigations[i].key) {
                    case "credits":
                        aNavigations.fixedNavigations[i].title = this.getModel("i18n").getResourceBundle().getText("Credits");
                        break;
                }
            }

            this.setModel(new JSONModel(aNavigations), "menuNavigations");

        }

    });
});