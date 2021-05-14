sap.ui.define([], function () {
	"use strict";
	return {
		localeDate: function (sDate) {
			var date = new Date(sDate);

			if (sDate == "TimeUnavailable") {
				return "";
			} else {
				return sDate ? date.toLocaleDateString() + " " + date.toLocaleTimeString() : "";
			}

		},

		numberSeparator: function (number) {

			if (number == '---') {
				return ''
			}

			if (number == 0) {
				return number
			} else {
				return number ? number.toLocaleString() : "";
			}

		},

		formatterSN: function (sValue) {

			if (sValue == '---') {
				return ''
			}

			if (sValue == 1) {
				return "Sim";
			} else {
				return "Não";
			}

		},

		operationType: function (type) {

			if (type && type !== "---") {
				return type == "1" ? "Controle" : "Limpeza";
			} else {
				return "Automação"
			}

		},

		status: function (status) {

			if (status == "0") {
				return "sap-icon://decline"
			} else if (status == "1") {
				return "sap-icon://accept"
			} else {
				return null
			}

		},

		statusReturn: function (status) {

			return status == "100" ? "Erro" : "Sucesso";

		},

		color: function (color) {

            if(color){
                return color === 0 ? "Error" : "Success";
            }
			return "Error"
		},

		colorReturn: function (color) {
			return color == "100" ? "Error" : "Success";
		},

		yesNo: function (yesno) {

			return yesno == 1 ? true : false;
		}
	};
});