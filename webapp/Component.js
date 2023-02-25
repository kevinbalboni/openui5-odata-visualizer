sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "openui5-odata-visualizer/model/formatter"
], function (UIComponent, JSONModel, formatter) {
    "use strict";

    return UIComponent.extend("openui5-odata-visualizer.Component", {

        metadata: {
            manifest: "json"
        },

        init: function () {

            UIComponent.prototype.init.apply(this, arguments);
            this.getRouter().initialize();

            var sTheme = localStorage.getItem("ODataVisualizer_UI5_Theme");
            if (sTheme) {
                sap.ui.getCore().applyTheme(sTheme);
            }

            // this.getModel("menu_navigations").dataLoaded().then(function () {
            let aNavigations = {
                navigations: this.getModel("menu_navigations").getProperty("/navigations"),
                fixedNavigations: this.getModel("menu_navigations").getProperty("/fixedNavigations")
            };

            for (let bk = 0; bk < aNavigations.navigations.length; bk++) {
                switch (aNavigations.navigations[bk].key) {
                    case "home":
                        aNavigations.navigations[bk].title = this.getModel("i18n").getResourceBundle().getText("Home");
                        break;
                    case "services":
                        aNavigations.navigations[bk].title = this.getModel("i18n").getResourceBundle().getText("Services");
                        break;
                    case "entities":
                        aNavigations.navigations[bk].title = this.getModel("i18n").getResourceBundle().getText("Entities");
                        break;
                    case "functions":
                        aNavigations.navigations[bk].title = this.getModel("i18n").getResourceBundle().getText("Functions");
                        break;
                    case "complexTypes":
                        aNavigations.navigations[bk].title = this.getModel("i18n").getResourceBundle().getText("ComplexTypes");
                        break;
                    case "datas":
                        aNavigations.navigations[bk].title = this.getModel("i18n").getResourceBundle().getText("Datas");
                        break;
                    case "metadata":
                        aNavigations.navigations[bk].title = this.getModel("i18n").getResourceBundle().getText("Metadata");
                        break;
                }
            }

            for (let bk = 0; bk < aNavigations.fixedNavigations.length; bk++) {
                switch (aNavigations.fixedNavigations[bk].key) {
                    case "credits":
                        aNavigations.fixedNavigations[bk].title = this.getModel("i18n").getResourceBundle().getText("Credits");
                        break;
                }
            }

            this.setModel(new JSONModel(aNavigations), "menuNavigations");

        }

    });
});