// @ts-ignore
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    'sap/ui/model/Filter',
    "../util/formatter",
    "sap/ui/model/resource/ResourceModel",
    'sap/ui/core/util/Export',
    'sap/ui/core/util/ExportTypeCSV'
    // @ts-ignore
// @ts-ignore
], function (Controller, JSONModel, MessageToast, MessageBox, Filter, formatter, ResourceModel, Export, ExportTypeCSV) {
    "use strict";

    return Controller.extend("konitech.Liquidos.controller.Main", {

        formatter: formatter,

        i18n: new ResourceModel({
            bundleName: "konitech.Liquidos.i18n.i18n"
        }),

        onInit: function () {
            var oView = this.getView(),
                // @ts-ignore
                tablet = sap.ui.Device.system.tablet,
                // @ts-ignore
                phone = sap.ui.Device.system.phone;

            if (tablet || phone) {
                oView.byId("table_liquidos").setVisibleRowCountMode("Interactive");
            }

        },
        // @ts-ignore
        onSearch: function () {

            this.onSetBusy("table_liquidos", true);


            if (this.oModel.getProperty("/Liquidos").length > 0) {
                this.getPage().setShowFooter(true);
                this.oModel.setProperty("/enableExport", true)
            } else {
                this.getPage().setShowFooter(false);
                this.oModel.setProperty("/enableExport", false);
                MessageToast.show("Nenhum dado encontrado");
            }

            // this.oModel.setProperty("/Liquidos", tableModel);

            this.onSetBusy("table_liquidos", false);

        },

        onBeforeRendering: function () {

            this.onInitiateModel();
            this.onLoadPlants();
            this.onButtonState();

            document.title = this.i18n.getResourceBundle().getText("appTitle");

        },

        onSetBusy: function (id, state) {

            var object = this.getView().byId(id);

            object.setBusyIndicatorDelay(0);
            object.setBusy(state);

        },

        onInitiateModel: function () {
            this.oModel = new JSONModel();
            // @ts-ignore
            this.getView().setModel(this.oModel);
            this.oModel.setProperty("/isNewEnable", false);
            this.oModel.setProperty("/Liquidos", "");
        },

        onLoadPlants: function () {
            var plants = [{ "CD_PLANT": "0001", "DS_PLANT": "0001 - Planta 1" },
            { "CD_PLANT": "0002", "DS_PLANT": "0002 - Planta 2" },
            { "CD_PLANT": "0003", "DS_PLANT": "0003 - Planta 3" }]

            this.oModel.setProperty("/Plants", plants);

        },

        onButtonState: function () {
            this.oModel.setProperty("/newEnabled", false);
            this.oModel.setProperty("/enableExport", false);
            this.oModel.setProperty("/formVisible", true);
            this.oModel.setProperty("/isClear", false);
            this.oModel.setProperty("/isTypeRegister", false);
        },

        onNew: function () {
            this.onCreateEditDialog();
        },

        getPage: function () {
            return this.getView().byId("mainPage");
        },

        onEdit: function (oEvent) {
            // @ts-ignore
            // @ts-ignore
            var that = this,
                sPath = oEvent.getSource().getBindingContext().getPath(),
                oModel = oEvent.getSource().getModel(),
                // @ts-ignore
                // @ts-ignore
                bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length,
                oContext = oModel.getProperty(sPath);


            this.onCreateEditDialog(oContext);
        },

        onChangeSwitch: function (oEvent) {
            var oModelDialog = this.oDialog.getModel("line"),
                oSource = oEvent.getSource(),
                newProp = {},
                prop = oSource.getName(),
                value = oSource.getState() ? 1 : 0;

            newProp[prop] = value;

            oModelDialog.setData(newProp, true);

        },

        onCreateEditDialog: function (data) {

            // @ts-ignore
            var oModelDialog = new sap.ui.model.json.JSONModel(),
                // @ts-ignore
                // @ts-ignore
                lineDialog = {},
                // @ts-ignore
                // @ts-ignore
                date = new Date(),
                // @ts-ignore
                oView = this.getView(),
                // @ts-ignore
                getCore = sap.ui.getCore(),
                reator_fab = data ? data.REATOR_FAB.split(",") : "",
                tq_aux = data ? data.TANQUE_AUX.split(",") : "",
                sel_plant = oView.byId("combo_plant").getSelectedKey();

            // @ts-ignore
            this.oDialog = new sap.ui.xmlfragment("konitech.Liquidos.fragments.Item", this);

            oView.addDependent(this.oDialog);

            if (data) {
                // @ts-ignore
                this.oModel.setProperty("/dialogTitle", this.i18n.getResourceBundle().getText("fragEditTitle"));
                // @ts-ignore
                this.oModel.setProperty("/isEditView", false);
                // @ts-ignore
                this.oModel.setProperty("/newCollect", false);
                oModelDialog.setData(data);

                /**
                 * Set checkbox true
                 */
                reator_fab.forEach(item => {
                    switch (item) {
                        case "TANQ06":
                            getCore.byId("reat_fab_tq06").setSelected(true);
                            break;
                        case "TANQ07":
                            getCore.byId("reat_fab_tq07").setSelected(true);
                            break;
                    }
                });

                tq_aux.forEach(item => {
                    switch (item) {
                        case "TANQ01":
                            getCore.byId("tq_aux_tq01").setSelected(true);
                            break;
                        case "TANQ31":
                            getCore.byId("tq_aux_tq31").setSelected(true);
                            break;
                    }
                });

            } else {
                // @ts-ignore
                this.oModel.setProperty("/dialogTitle", this.i18n.getResourceBundle().getText("fragNewTitle"));
                // @ts-ignore
                this.oModel.setProperty("/isEditView", true);
                // @ts-ignore
                this.oModel.setProperty("/newCollect", true);

            }

            getCore.byId("combo_plant").setSelectedKey(sel_plant);

            this.oDialog.setModel(oModelDialog, "line");

            this.oDialog.open();

        },

        onCancel: function () {

            var that = this,
                bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length,
                editDialog = this.oModel.getProperty("/editDialog");

            MessageBox.warning(
                that.getView().getModel("i18n").getResourceBundle().getText("msgLostData"), {
                // @ts-ignore
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                styleClass: bCompact ? "sapUiSizeCompact" : "",
                onClose: function (sAction) {
                    if (sAction === "YES") {

                        if (editDialog) {
                            that.onSearch();
                        }
                        that.oDialog.close();
                    }
                }
            }
            );


        },

        onSave: function () {

            var that = this,
                newRegister = this.oModel.getProperty("/newCollect"),
                newValidateInputs = ["combo_plant", "LOTE_OP", "COD_PROD"],
                // @ts-ignore
                getCore = sap.ui.getCore(),
                // @ts-ignore
                oView = this.getView(),
                bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length,
                errInput = this.i18n.getResourceBundle().getText("errMsgInvalidInput"),
                // @ts-ignore
                CD_PLANT = getCore.byId("combo_plant").getSelectedKey(),
                oModelDialog = this.oDialog.getModel("line").getData(),
                tzoffset = (new Date()).getTimezoneOffset() * 60000, //offset in milliseconds
                localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1),
                form = getCore.byId("form_equip_rel"),
                reat_fab = form.getContent().filter(item => item.sId.includes("reat_fab")),
                reat_fab_items = "",
                tq_aux = form.getContent().filter(item => item.sId.includes("tq_aux")),
                tq_aux_items = "";


            if (newRegister) {

                if (this.onValidateInputs(newValidateInputs)) {

                    MessageBox.warning(
                        that.getView().getModel("i18n").getResourceBundle().getText("msgSave"), {
                        icon: MessageBox.Icon.WARNING,
                        title: that.getView().getModel("i18n").getResourceBundle().getText("Attention"),
                        // @ts-ignore
                        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                        styleClass: bCompact ? "sapUiSizeCompact" : "",
                        initialFocus: MessageBox.Action.CANCEL,
                        onClose: function (sButton) {
                            if (sButton === MessageBox.Action.OK) {

                                reat_fab.forEach(item => {
                                    item.getSelected() ? reat_fab_items += item.getText() + "," : "";
                                });

                                tq_aux.forEach(item => {
                                    item.getSelected() ? tq_aux_items += item.getText() + "," : "";
                                });

                                var tableModel = {
                                    "LOTE_OP": oModelDialog.LOTE_OP,
                                    // @ts-ignore
                                    "CD_PLANT": sap.ui.getCore().byId("combo_plant").getSelectedKey(),
                                    // @ts-ignore
                                    "DS_PLANT": sap.ui.getCore().byId("combo_plant")._getSelectedItemText(),
                                    "COD_PROD": oModelDialog.COD_PROD,
                                    "DESC_PROD": oModelDialog.DESC_PROD,
                                    "FAB_DATA": oModelDialog.FAB_DATA,
                                    "VAL_DATA": oModelDialog.VAL_DATA,
                                    "LIB_AREA_DATA": localISOTime,
                                    "EXEC_POR": "Usuario",
                                    "DT_EXEC": localISOTime,
                                    "VER_POR": "",
                                    "DT_VER": "",
                                    "IDENT_AREA": oModelDialog.IDENT_AREA,
                                    "LIMP_EQUIP": oModelDialog.LIMP_EQUIP,
                                    "MANIP_UNI": oModelDialog.MANIP_UNI,
                                    "LIM_AMB": oModelDialog.LIM_AMB,
                                    "SOBRA_MAT": oModelDialog.SOBRA_MAT,
                                    "REATOR_FAB": reat_fab_items.substr(0, reat_fab_items.length - 1),
                                    "TANQUE_AUX": tq_aux_items.substr(0, tq_aux_items.length - 1),
                                },
                                    arr = [];


                                arr.push(tableModel);

                                that.oModel.getProperty("/Liquidos").length > 0 ? that.oModel.getProperty("/Liquidos").push(tableModel) : that.oModel.setProperty("/Liquidos", arr);

                                that.oModel.refresh();
                                that.oDialog.close();
                                that.onSearch();
                                MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("msgSuccessSave"));
                            }
                        }
                    }
                    );

                } else {
                    MessageBox.error(
                        errInput, {
                        icon: MessageBox.Icon.ERROR,
                        title: that.getView().getModel("i18n").getResourceBundle().getText("Attention"),
                        // @ts-ignore
                        actions: [sap.m.MessageBox.Action.OK],
                        styleClass: bCompact ? "sapUiSizeCompact" : "",
                        initialFocus: MessageBox.Action.OK
                    }
                    );
                }

            } else {


                if (this.onValidateInputs(["COD_PROD"])) {

                    MessageBox.warning(
                        that.getView().getModel("i18n").getResourceBundle().getText("msgSave"), {
                        icon: MessageBox.Icon.WARNING,
                        title: that.getView().getModel("i18n").getResourceBundle().getText("Attention"),
                        // @ts-ignore
                        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                        styleClass: bCompact ? "sapUiSizeCompact" : "",
                        initialFocus: MessageBox.Action.CANCEL,
                        onClose: function (sButton) {
                            if (sButton === MessageBox.Action.OK) {

                                reat_fab.forEach(item => {
                                    item.getSelected() ? reat_fab_items += item.getText() + "," : "";
                                });

                                tq_aux.forEach(item => {
                                    item.getSelected() ? tq_aux_items += item.getText() + "," : "";
                                });

                                that.oModel.getProperty("/Liquidos").forEach(item => {
                                    if (item.LOTE_OP == oModelDialog.LOTE_OP && item.CD_PLANT == oModelDialog.CD_PLANT) {
                                        item.COD_PROD = oModelDialog.COD_PROD;
                                        item.DESC_PROD = oModelDialog.DESC_PROD;
                                        item.FAB_DATA = oModelDialog.FAB_DATA;
                                        item.VAL_DATA = oModelDialog.VAL_DATA;
                                        item.COD_PROD = oModelDialog.COD_PROD;
                                        item.IDENT_AREA = oModelDialog.IDENT_AREA;
                                        item.LIMP_EQUIP = oModelDialog.LIMP_EQUIP;
                                        item.MANIP_UNI = oModelDialog.MANIP_UNI;
                                        item.LIM_AMB = oModelDialog.LIM_AMB;
                                        item.SOBRA_MAT = oModelDialog.SOBRA_MAT;
                                        item.REATOR_FAB = reat_fab_items.substr(0, reat_fab_items.length - 1);
                                        item.TANQUE_AUX = tq_aux_items.substr(0, tq_aux_items.length - 1);
                                        that.oModel.refresh();
                                        that.oDialog.close();
                                        that.onSearch();
                                    }
                                });
                            }
                        }
                    });

                } else {
                    MessageBox.error(
                        errInput, {
                        icon: MessageBox.Icon.ERROR,
                        title: that.getView().getModel("i18n").getResourceBundle().getText("Attention"),
                        // @ts-ignore
                        actions: [sap.m.MessageBox.Action.OK],
                        styleClass: bCompact ? "sapUiSizeCompact" : "",
                        initialFocus: MessageBox.Action.OK
                    });
                }
            }
        },

        onValidateInputs: function (inputs) {

            // @ts-ignore
            // var dtIniProg = sap.ui.getCore().byId("inputDtIniProg"),
            //     dtFimProg = sap.ui.getCore().byId("inputDtFimProg");

            var valid = true;

            inputs.forEach(function (input) {
                // @ts-ignore
                var sInput = sap.ui.getCore().byId(input),
                    // @ts-ignore
                    isComboBox = sInput.getMetadata().getName().toLowerCase().includes("combobox");

                // @ts-ignore
                if (sInput.getRequired()) {
                    if (isComboBox) {

                        // @ts-ignore
                        if (!sInput.getSelectedKey()) {
                            valid = false;
                            // @ts-ignore
                            sInput.setValueState("Error");
                            // @ts-ignore
                            sInput.setValue("");
                            // @ts-ignore
                            sInput.focus();
                        } else {
                            // @ts-ignore
                            sInput.setValueState("None");
                        }

                    } else {
                        // @ts-ignore
                        if (!sInput.getValue()) {
                            valid = false;
                            // @ts-ignore
                            sInput.setValueState("Error");
                            // @ts-ignore
                            sInput.focus();
                        } else {
                            // @ts-ignore
                            sInput.setValueState("None");
                        }
                    }
                }
            });
            return valid;
        },

        // @ts-ignore
        onApprove: function (oEvent) {
            var that = this,
                bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length,
                oView = this.getView(),
                oTable = oView.byId("table_liquidos"),
                index = oTable.getSelectedIndices(),
                len = index.length,
                obj = {},
                registerSelected = [];

            if (len > 0) {
                index.forEach(item => {
                    if (oTable.getContextByIndex(item)) {
                        obj = {
                            "LOTE_OP": oTable.getContextByIndex(item).getObject().LOTE_OP
                        };
                    }
                    registerSelected.push(obj);
                });

                MessageBox.warning(
                    that.i18n.getResourceBundle().getText("msgApprove"), {
                    icon: MessageBox.Icon.WARNING,
                    title: that.getView().getModel("i18n").getResourceBundle().getText("Attention"),
                    // @ts-ignore
                    actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                    styleClass: bCompact ? "sapUiSizeCompact" : "",
                    initialFocus: MessageBox.Action.CANCEL,
                    onClose: function (sButton) {
                        if (sButton === MessageBox.Action.OK) {
                            that.onConfirmApprove(registerSelected);
                        }
                    }
                }
                );


            } else {
                MessageToast.show(this.i18n.getResourceBundle().getText("msgSelMin"));
            }

        },

        onConfirmApprove: function (itens) {

            // @ts-ignore
            var that = this,
                userLogged = "usuario_aprovador",
                json = JSON.stringify(itens),
                bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;


            // that.onAjaxRequest(template, paramsApprove).then(response => {

            //     that.onCreateDialogReturn(response);
            //     that.onRefresh("U");


            // }, err => {

            //     that.onRefresh("U");

            //     MessageBox.error(
            //         err, {
            //             icon: MessageBox.Icon.ERROR,
            //             title: that.i18n.getResourceBundle().getText("Attention"),
            //             actions: [sap.m.MessageBox.Action.OK],
            //             styleClass: bCompact ? "sapUiSizeCompact" : "",
            //             initialFocus: MessageBox.Action.CANCEL,
            //         }
            //     );

            // });

        },

        onAfterClose: function () {
            this.oDialog.destroy();
        },
        // @ts-ignore
        // @ts-ignore
        onExport: function (oEvent) {

            var i18n = this.getView().getModel("i18n"),
                // @ts-ignore
                // @ts-ignore
                oView = this.getView();

            var oExport = new Export({

                // Type that will be used to generate the content. Own ExportType's can be created to support other formats
                exportType: new ExportTypeCSV({
                    separatorChar: ";"
                }),

                // Pass in the model created above
                models: this.getView().getModel(),

                // binding information for the rows aggregation
                rows: {
                    path: "/Liquidos"
                },

                // column definitions with column name and binding info for the content
                columns: [{
                    name: i18n.getResourceBundle().getText("DS_PLANT"),
                    template: {
                        content: "{DS_PLANT}"
                    }
                }, {
                    name: i18n.getResourceBundle().getText("LOTE_OP"),
                    template: {
                        content: "{LOTE_OP}"
                    }
                }, {
                    name: i18n.getResourceBundle().getText("COD_PROD"),
                    template: {
                        content: "{COD_PROD}"
                    }
                }, {
                    name: i18n.getResourceBundle().getText("EXEC_POR"),
                    template: {
                        content: "{EXEC_POR}"
                    }
                }, {
                    name: i18n.getResourceBundle().getText("DT_EXEC"),
                    template: {
                        content: {
                            parts: ["DT_EXEC"],
                            formatter: function (sDate) {
                                return formatter.localeDate(sDate);

                            },
                        }
                    }
                }, {
                    name: i18n.getResourceBundle().getText("FAB_DATA"),
                    template: {
                        content: {
                            parts: ["FAB_DATA"],
                            formatter: function (sDate) {
                                return formatter.localeDate(sDate);

                            },
                        }
                    }
                }, {
                    name: i18n.getResourceBundle().getText("VAL_DATA"),
                    template: {
                        content: {
                            parts: ["VAL_DATA"],
                            formatter: function (sDate) {
                                return formatter.localeDate(sDate);

                            },
                        }
                    }
                }, {
                    name: i18n.getResourceBundle().getText("LIB_AREA_DATA"),
                    template: {
                        content: {
                            parts: ["LIB_AREA_DATA"],
                            formatter: function (sDate) {
                                return formatter.localeDate(sDate);

                            },
                        }
                    }
                }, {
                    name: i18n.getResourceBundle().getText("IDENT_AREA"),
                    template: {
                        content: {
                            parts: ["IDENT_AREA"],
                            formatter: function (sValue) {
                                return formatter.formatterSN(sValue);
                            }
                        }
                    }
                }, {
                    name: i18n.getResourceBundle().getText("LIMP_EQUIP"),
                    template: {

                        content: {
                            parts: ["LIMP_EQUIP"],
                            formatter: function (sValue) {
                                return formatter.formatterSN(sValue);
                            }
                        }
                    }
                }, {
                    name: i18n.getResourceBundle().getText("MANIP_UNI"),
                    template: {

                        content: {
                            parts: ["MANIP_UNI"],
                            formatter: function (sValue) {

                                return formatter.formatterSN(sValue);

                            }
                        }
                    }
                }, {
                    name: i18n.getResourceBundle().getText("LIM_AMB"),
                    template: {

                        content: {
                            parts: ["LIM_AMB"],
                            formatter: function (sValue) {
                                return formatter.formatterSN(sValue);
                            }
                        }
                    }
                }, {
                    name: i18n.getResourceBundle().getText("SOBRA_MAT"),
                    template: {

                        content: {
                            parts: ["SOBRA_MAT"],
                            formatter: function (sValue) {
                                return formatter.formatterSN(sValue);
                            }
                        }
                    }
                }]
            });

            // download exported file
            oExport.saveFile().catch(function (oError) {
                MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
            }).then(function () {
                oExport.destroy();
            });
        }

    });
});
