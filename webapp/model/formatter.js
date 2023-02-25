sap.ui.define([], function () {
	"use strict";

	return {

		titlePage: function (count, title) {
			if (count && Array.isArray(count) && !isNaN(count.length)) {
				return title.concat(" (" + count.length + ")");
			}
			return title.concat(" (0)");
		}

	};
});