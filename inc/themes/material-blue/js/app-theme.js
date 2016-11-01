/*
 * sysPass
 *
 * @author nuxsmin
 * @link http://syspass.org
 * @copyright 2012-2016, Rubén Domínguez nuxsmin@$syspass.org
 *
 * This file is part of sysPass.
 *
 * sysPass is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * sysPass is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 *  along with sysPass.  If not, see <http://www.gnu.org/licenses/>.
 */

sysPass.Theme = function (Common) {
    "use strict";

    var log = Common.log;

    /**
     * Funciones a realizar en peticiones AJAX
     *
     * @type {{complete: ajax.complete}}
     */
    var ajax = {
        complete: function () {
            // Actualizar componentes de MDL cargados con AJAX
            componentHandler.upgradeDom();

            // Activar tooltips
            //activeTooltip();
        }
    };

    /**
     * Mostrar/Ocultar el spinner de carga
     *
     * @type {{show: loading.show, hide: loading.hide}}
     */
    var loading = {
        show: function () {
            $("#wrap-loading").show();
            $("#loading").addClass("is-active");
        },
        hide: function () {
            $("#wrap-loading").hide();
            $("#loading").removeClass("is-active");
        }
    };

    var activeTooltip = function ($container) {
        if (typeof $container === "undefined") {
            $container = $("body");
        }

        // Activar tooltips
        $container.find(".active-tooltip").tooltip({
            content: function () {
                return $(this).attr("title");
            },
            tooltipClass: "tooltip"
        });
    };

    // Función para generar claves aleatorias.
    // By Uzbekjon from  http://jquery-howto.blogspot.com.es
    var password = function ($target) {
        var iteration = 0,
            genPassword = "",
            randomNumber;

        while (iteration < Common.passwordData.complexity.numlength) {
            randomNumber = (Math.floor((Math.random() * 100)) % 94) + 33;
            if (!Common.passwordData.complexity.symbols) {
                if ((randomNumber >= 33) && (randomNumber <= 47)) {
                    continue;
                }
                if ((randomNumber >= 58) && (randomNumber <= 64)) {
                    continue;
                }
                if ((randomNumber >= 91) && (randomNumber <= 96)) {
                    continue;
                }
                if ((randomNumber >= 123) && (randomNumber <= 126)) {
                    continue;
                }
            }

            if (!Common.passwordData.complexity.numbers && randomNumber >= 48 && randomNumber <= 57) {
                continue;
            }

            if (!Common.passwordData.complexity.uppercase && randomNumber >= 65 && randomNumber <= 90) {
                continue;
            }

            iteration++;
            genPassword += String.fromCharCode(randomNumber);
        }

        $("#viewPass").attr("title", genPassword);

        var level = zxcvbn(genPassword);
        Common.passwordData.passLength = genPassword.length;

        if ($target) {
            var $dstParent = $target.parent();
            var $targetR = $("#" + $target.attr("id") + "R");

            Common.outputResult(level, $target);

            // Actualizar los componentes de MDL
            var mdl = new MaterialTextfield();

            // Poner la clave en los input y actualizar MDL
            $dstParent.find("input:password").val(genPassword);
            $dstParent.addClass(mdl.CssClasses_.IS_DIRTY).removeClass(mdl.CssClasses_.IS_INVALID);
            // Poner la clave en el input de repetición y encriptarla
            $targetR.val(genPassword).parent().addClass(mdl.CssClasses_.IS_DIRTY).removeClass(mdl.CssClasses_.IS_INVALID);
            Common.encryptFormValue($targetR);

            // Mostar el indicador de complejidad
            $dstParent.find("#passLevel").show(500);
        } else {
            Common.outputResult(level);
            $("input:password, input.password").val(genPassword);
            $("#passLevel").show(500);
        }
    };


    // Diálogo de configuración de complejidad de clave
    var complexityDialog = function () {
        $("<div></div>").dialog({
            modal: true,
            title: Common.config().LANG[29],
            width: "400px",
            open: function () {
                var thisDialog = $(this);

                var content =
                    "<label class=\"mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect\" for=\"checkbox-numbers\">" +
                    "<input type=\"checkbox\" id=\"checkbox-numbers\" class=\"mdl-checkbox__input\" name=\"checkbox-numbers\"/>" +
                    "<span class=\"mdl-checkbox__label\">" + Common.config().LANG[35] + "</span>" +
                    "</label>" +
                    "<label class=\"mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect\" for=\"checkbox-uppercase\">" +
                    "<input type=\"checkbox\" id=\"checkbox-uppercase\" class=\"mdl-checkbox__input\" name=\"checkbox-uppercase\"/>" +
                    "<span class=\"mdl-checkbox__label\">" + Common.config().LANG[36] + "</span>" +
                    "</label>" +
                    "<label class=\"mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect\" for=\"checkbox-symbols\">" +
                    "<input type=\"checkbox\" id=\"checkbox-symbols\" class=\"mdl-checkbox__input\" name=\"checkbox-symbols\"/>" +
                    "<span class=\"mdl-checkbox__label\">" + Common.config().LANG[37] + "</span>" +
                    "</label>" +
                    "<div class=\"mdl-textfield mdl-js-textfield textfield-passlength\">" +
                    "<input class=\"mdl-textfield__input\" type=\"number\" pattern=\"[0-9]*\" id=\"passlength\" />" +
                    "<label class=\"mdl-textfield__label\" for=\"passlength\">" + Common.config().LANG[38] + "</label>" +
                    "</div>" +
                    "<button id=\"btn-complexity\" class=\"mdl-button mdl-js-button mdl-button--raised\">Ok</button>";

                thisDialog.html(content);

                // Recentrar después de insertar el contenido
                thisDialog.dialog("option", "position", "center");


                // Actualizar componentes de MDL
                thisDialog.ready(function () {
                    $("#checkbox-numbers").prop("checked", Common.passwordData.complexity.numbers);
                    $("#checkbox-uppercase").prop("checked", Common.passwordData.complexity.uppercase);
                    $("#checkbox-symbols").prop("checked", Common.passwordData.complexity.symbols);
                    $("#passlength").val(Common.passwordData.complexity.numlength);

                    $("#btn-complexity").click(function () {
                        Common.passwordData.complexity.numbers = $(" #checkbox-numbers").is(":checked");
                        Common.passwordData.complexity.uppercase = $("#checkbox-uppercase").is(":checked");
                        Common.passwordData.complexity.symbols = $("#checkbox-symbols").is(":checked");
                        Common.passwordData.complexity.numlength = parseInt($("#passlength").val());

                        thisDialog.dialog("close");
                    });

                    // Actualizar objetos de MDL
                    componentHandler.upgradeDom();
                });
            },
            // Forzar la eliminación del objeto para que ZeroClipboard siga funcionando al abrirlo de nuevo
            close: function () {
                $(this).dialog("destroy");
            }
        });
    };

    /**
     * Detectar los campos de clave y añadir funciones
     */
    var passwordDetect = function ($container) {
        // Crear los iconos de acciones sobre claves
        $container.find(".passwordfield__input").each(function () {
            var $this = $(this);

            if ($this.attr("data-pass-upgraded") === "true") {
                return;
            }

            var $thisParent = $this.parent();
            var targetId = $this.attr("id");
            var $targetIdR = $("#" + targetId + "R");


            var btnMenu = "<button id=\"menu-speed-" + targetId + "\" class=\"mdl-button mdl-js-button mdl-button--icon\" type=\"button\" title=\"" + Common.config().LANG[27] + "\"><i class=\"material-icons\">more_vert</i></button>";

            btnMenu += "<ul class=\"mdl-menu mdl-js-menu\" for=\"menu-speed-" + targetId + "\">";
            btnMenu += "<li class=\"mdl-menu__item passGen\"><i class=\"material-icons\">settings</i>" + Common.config().LANG[28] + "</li>";
            btnMenu += "<li class=\"mdl-menu__item passComplexity\"><i class=\"material-icons\">vpn_key</i>" + Common.config().LANG[29] + "</li>";
            btnMenu += "<li class=\"mdl-menu__item reset\"><i class=\"material-icons\">refresh</i>" + Common.config().LANG[30] + "</li>";

            $thisParent.after("<div class=\"password-actions\" />");

            $thisParent.next(".password-actions")
                .prepend("<span class=\"passLevel passLevel-" + targetId + " fullround\" title=\"" + Common.config().LANG[31] + "\"></span>")
                .prepend("<i class=\"showpass material-icons\" title=\"" + Common.config().LANG[32] + "\">remove_red_eye</i>")
                .prepend(btnMenu);

            $this.on("keyup", function () {
                Common.checkPassLevel($this);
            });

            var $passwordActions = $this.parent().next();

            // Crear evento para generar clave aleatoria
            $passwordActions.find(".passGen").on("click", function () {
                password($this);
                $this.focus();
            });

            $passwordActions.find(".passComplexity").on("click", function () {
                complexityDialog();
            });

            // Crear evento para mostrar clave generada/introducida
            $passwordActions.find(".showpass").on("mouseover", function () {
                $(this).attr("title", $this.val());
            });

            // Reset de los campos de clave
            $passwordActions.find(".reset").on("click", function () {
                $this.val("");
                $targetIdR.val("");

                // Actualizar objetos de MDL
                componentHandler.upgradeDom();
            });

            $this.attr("data-pass-upgraded", "true");
        });

        // Crear los iconos de acciones sobre claves (sólo mostrar clave)
        $container.find(".passwordfield__input-show").each(function () {
            var $this = $(this);

            var thisParent = $this.parent();
            var targetId = $this.attr("id");

            thisParent
                .after("<i class=\"showpass material-icons\" title=\"" + Common.config().LANG[32] + "\" data-targetid=\"" + targetId + "\">remove_red_eye</i>");
        });
    };

    /**
     * Triggers que se ejecutan en determinadas vistas
     */
    var viewsTriggers = {
        search: function () {
            var $frmSearch = $("#frmSearch");
            var $resContent = $("#res-content");

            $frmSearch.find(".icon-searchfav").on("click", function () {
                var $icon = $(this).find("i");
                var $searchfav = $frmSearch.find("input[name='searchfav']");


                if ($searchfav.val() == 0) {
                    $icon.addClass("mdl-color-text--amber-A200");
                    $icon.attr("title", Common.config().LANG[53]);

                    $searchfav.val(1);
                } else {
                    $icon.removeClass("mdl-color-text--amber-A200");
                    $icon.attr("title", Common.config().LANG[52]);

                    $searchfav.val(0);
                }

                $frmSearch.submit();
            });

            var checkFavorite = function ($obj) {
                if ($obj.data("status") === "on") {
                    $obj.addClass("mdl-color-text--amber-A100");
                    $obj.attr("title", Common.config().LANG[50]);
                    $obj.html("star");
                } else {
                    $obj.removeClass("mdl-color-text--amber-A100");
                    $obj.attr("title", Common.config().LANG[49]);
                    $obj.html("star_border");
                }
            };

            $resContent.on("click", "#data-search-header .sort-down,#data-search-header .sort-up", function () {
                var $this = $(this);
                $this.parent().find("a").addClass("filterOn");

                Common.appActions().account.sort($this);
            }).on("click", "#search-rows i.icon-favorite", function () {
                var $this = $(this);

                Common.appActions().account.savefavorite($this, function () {
                    checkFavorite($this);
                });
            }).on("click", "#search-rows span.tag", function () {
                var tag = "tag:" + this.innerHTML;

                $("#search").val(tag).parent().addClass("is-dirty");

                Common.appActions().account.search();
            });
        },
        common: function ($container) {
            passwordDetect($container);
            activeTooltip($container);

            $container.find(".download").button({
                icons: {primary: "ui-icon-arrowthickstop-1-s"}
            });
        }
    };

    /**
     * Función para crear el menu estático al hacer scroll
     */
    var setFixedMenu = function () {
        // Stick the #nav to the top of the window
        var $actionBar = $("#actions-bar");

        if ($actionBar.length > 0) {
            var $actionBarLogo = $actionBar.find("#actions-bar-logo");
            var isFixed = false;

            var scroll = {
                on: function () {
                    $actionBar.css({
                        backgroundColor: "rgba(255, 255, 255, .75)",
                        borderBottom: "1px solid #ccc"
                    });
                    $actionBarLogo.show();
                    isFixed = true;
                },
                off: function () {
                    $actionBar.css({
                        backgroundColor: "transparent",
                        borderBottom: "none"
                    });
                    $actionBarLogo.hide();
                    isFixed = false;
                }
            };


            $(window).on("scroll", function () {
                var scrollTop = $(this).scrollTop();
                var shouldBeFixed = scrollTop > $actionBar.height();

                if (shouldBeFixed && !isFixed) {
                    scroll.on();
                } else if (!shouldBeFixed && isFixed) {
                    scroll.off();
                }
            }).on("resize", function () {
                // Detectar si al cargar la barra de iconos no está en la posición 0
                if ($actionBar.offset().top > 0) {
                    scroll.on();
                }
            });

            // Detectar si al cargar la barra de iconos no está en la posición 0
            if ($actionBar.offset().top > 0) {
                scroll.on();
            }
        }
    };

    /**
     * Inicialización
     */
    var init = function () {
        jQuery.extend(jQuery.fancybox.defaults, {
            type: "ajax",
            autoWidth: true,
            autoHeight: true,
            autoResize: true,
            autoCenter: true,
            fitToView: false,
            minHeight: 50,
            padding: 0,
            helpers: {overlay: {css: {"background": "rgba(0, 0, 0, 0.3)"}}},
            keys: {close: [27]},
            afterShow: function () {
                $("#fancyContainer").find("input[type='text']:visible:first").focus();
            }
        });

        activeTooltip();
        setFixedMenu();
    };

    init();

    return {
        activeTooltip: activeTooltip,
        passwordDetect: passwordDetect,
        password: password,
        viewsTriggers: viewsTriggers,
        loading: loading,
        ajax: ajax
    };
};