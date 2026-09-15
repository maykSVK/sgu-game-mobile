$(document).ready(function() {
    console.log("SGU-Game client start");

    // funkce
    console.log("Inicializace funkcí");

    var ajax_url = '/app/ajax/index.php';

    /**
     * funkce počítá celkovou cenu surovin prodávaných na obchodní stanici
     *
     * @returns {*}
     */
    function calculateMarketResourcesPrice() {
        var limestone = $("input[name=limestone_count]").val(),
            limestonePerUnit = $("input[name=limestone_per_unit]").val(),
            food = $("input[name=food_count]").val(),
            foodPerUnit =$("input[name=food_per_unit]").val(),
            water = $("input[name=water_count]").val(),
            waterPerUnit = $("input[name=water_per_unit]").val(),
            finalPrice = 0,
            resultElement = $("#market-resources-final-price");

        if (!parseInt(limestone)) {limestone = 0;}
        if (!parseInt(limestonePerUnit)) {limestonePerUnit = 0;}
        if (!parseInt(food)) {food = 0;}
        if (!parseInt(foodPerUnit)) {foodPerUnit = 0;}
        if (!parseInt(water)) {water = 0;}
        if (!parseInt(waterPerUnit)) {waterPerUnit = 0;}

        finalPrice = (limestone * limestonePerUnit) + (food * foodPerUnit) + (water * waterPerUnit);
        return resultElement.html('Cena celkem: <i class="fas fa-money-bill-wave credits"></i> ' + finalPrice);
    }

    /**
     * funkce spočítá cenu za zvolené upgrady v laboratoři
     */
    function calculateLabResearchPointsPrice() {
        var property_1 = $("input[name=property_1]").val(),
            property_2 = $("input[name=property_2]").val(),
            property_3 = $("input[name=property_3]").val(),
            property_1_current = $("#property_1_current").text(),
            property_2_current = $("#property_2_current").text(),
            property_3_current = $("#property_3_current").text(),
            resultElement = $("#lab-rp-outcome"),
            multiplicator = 5,
            price = 0;

        if (!parseInt(property_1)) {property_1 = property_1_current;}
        if (!parseInt(property_2)) {property_2 = property_2_current;}
        if (!parseInt(property_3)) {property_3 = property_3_current;}

        price = ((property_1 - property_1_current) * multiplicator)
            + ((property_2 - property_2_current) * multiplicator)
            + ((property_3 - property_3_current) * multiplicator);

        return resultElement.text(price);
    }

    // exchange na planetách
    function calculateExchange(value) {
        var ratio = $('#ratio').text(), result;
        ratio = ratio.split(':');
        result = Math.floor(((value * ratio[1])/ratio[0]));
        $("#exchange-for").val(result);
    }

    // přepínání menu //
    var universeCard = $(".menu-universe"), marketCard = $(".menu-station"),
        upgradeCard = $(".menu-upgrade"), allianceCard = $(".menu-alliance"),
        communicationCard = $(".menu-communication");

    // vesmír
    universeCard.on('mouseenter',function(){
        $("[class*=-submenu]").hide();
        $(".universe-submenu").offset({left: universeCard.offset().left - 63}).toggle();
    });
    $(".universe-submenu").on('mouseleave',function(){
        $(".universe-submenu").hide();
    });

    // obchodní stanice
    marketCard.on('mouseenter',function(){
        $("[class*=-submenu]").hide();
        $(".station-submenu").offset({left: marketCard.offset().left - 27}).toggle();
    });
    $(".station-submenu").on('mouseleave',function(){
        $(".station-submenu").hide();
    });

    // vylepšení
    upgradeCard.on('mouseenter',function(){
        $("[class*=-submenu]").hide();
        $(".upgrade-submenu").offset({left: upgradeCard.offset().left - 52}).toggle();
    });
    $(".upgrade-submenu").on('mouseleave',function(){
        $(".upgrade-submenu").hide();
    });

    // aliance
    allianceCard.on('mouseenter',function(){
        $("[class*=-submenu]").hide();
        $(".alliance-submenu").offset({left: allianceCard.offset().left - 63}).toggle();
    });
    $(".alliance-submenu").on('mouseleave',function(){
        $(".alliance-submenu").hide();
    });

    // komunikace
    communicationCard.on('mouseenter',function(){
        $("[class*=-submenu]").hide();
        $(".communication-submenu").offset({left: communicationCard.offset().left - 40}).toggle();
    });
    $(".communication-submenu").on('mouseleave',function(){
        $(".communication-submenu").hide();
    });

    // tipped
    Tipped.create('.tooltip', function (element) {
        return '<div class="tooltip-content">' + $(this).data('tooltip') + '</div>';
    });

    // tipped nextgen design
    Tipped.create('.sgu-tooltip', function (element) {
        return '<div class="tooltip-content">' + $(this).data('sgu-tooltip') + '</div>';
    });

    // obchodní stanice - přepočet zdrojů
    $('#market-resources-form').on('input', function() {
        calculateMarketResourcesPrice();
    });

    // laboratoř - přepočet výdaje výzkumných bodů za upgrady
    $('#lab-development').on('input', function() {
        calculateLabResearchPointsPrice();
    });

    // výzkum technologií - náhled //
    Tipped.create('#technologies .research-box .tech-heading', function (element) {
        return '<div class="bold">' + $(this).data('name') + '</div>'
            + '<div class="research-img ' + $(this).data('img-class') + '"></div>'
            + '<div class="delimiter" style="max-width: 400px;">' + $(this).data('text') + '</div>'
            + '<br/>'
            + '<div>cena: <i class="fas fa-flask research-points"></i> ' + $(this).data('price') + '</div>'
            + '<div>požadované výzkumy: ' + $(this).data('required') + '</div>';
    });

    // řídící místnost - smazání výstrahy
    function ajax_post_delete_alert(id) {
        var ajaxRequest = new XMLHttpRequest(), vars = "", environment = "";
        vars = "method=updateNotification&id=" + id;

        ajaxRequest.open("POST", ajax_url, true);
        ajaxRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        ajaxRequest.send(vars);
    }

    $('.notification-remove').click(function () {
        // ajax_post_delete_alert($(this).data('id'));
        // $(this).remove();
    });

    // řídící místnost - smazání všech výstrah
    function ajax_post_delete_alerts() {
        var ajaxRequest = new XMLHttpRequest(), vars = "", environment = "";
        vars = "method=deleteAlerts";

        ajaxRequest.open("POST", ajax_url, true);
        ajaxRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        ajaxRequest.send(vars);
    }

    $('#delete-alerts').click(function () {
        ajax_post_delete_alerts();
        $('#alerts').empty();
    });


    // like/dislike fora
    function rateForumMessage(type, message) {
        var like_type = '', mark = '';
        $.ajax({
            url: ajax_url,
            type: 'post',
            data: {
                method: 'rateForumMessage',
                message: message,
                type: type
            }, success: function (result) {
                if (type == 1) {
                    like_type = 'like';
                    mark = '+';
                } else {
                    like_type = 'dislike';
                    mark = '-';
                }
                if (result == 'success') {
                    var element = $('#' + like_type + '-msg-' + message);
                    element.text(parseInt(element.text()) + 1);
                }
            }
        });
    }

    $('.like').click(function () {
        rateForumMessage(1, $(this).data('message'));
    });

    $('.dislike').click(function () {
        rateForumMessage(0, $(this).data('message'));
    });

    // forum reagovat
    $('.forum-reaction').click(function () {
        $("#forum-form-re").val('Re: ' + $(this).data('username') + ' (id: ' + $(this).data('re-id') + ')');
    });

    // forum, vyber smajliku
    $('#form-smiles-selector img').click(function () {
        $('#forum-form-message').val($('#forum-form-message').val() + $(this).data('smile-code'));
    });

    // forum, vyber funkce
    $('#form-smiles-selector svg').click(function () {
        $('#forum-form-message').val($('#forum-form-message').val() + $(this).data('smile-code'));
    });

    // zpravy, vyber smajliku
    $('#form-smiles-selector-messages img').click(function () {
        $('#messages-new-message').val($('#messages-new-message').val() + $(this).data('smile-code'));
    });

    // chat, vyber smajliku
    $('#chat-smiles-window img').click(function () {
        $('.chat-input').val($('.chat-input').val() + $(this).data('smile-code')).focus();
    });

    // scroll dole u zprav
    if ($('#contact-messages-box-scroll').length) {
        var element = document.getElementById('contact-messages-box-scroll');
        element.scrollTop = element.scrollHeight;
    }

    // nový report
    $("#newBattleReport").blink({delay: 500});

    // novinky v alianci
    $("#allianceNews").blink({delay: 500});

    // exchange
    $("#exchange-demand").on('input', function() {
        calculateExchange($(this).val());
    });

    // messages
    var textarea = $('.messages-conversation');
    if (textarea[0]) {
        textarea.scrollTop(textarea[0].scrollHeight);
    }

    // messages scroll dolu
    var objMdgWindow = document.getElementById('messages-container');
    if (objMdgWindow) {
        objMdgWindow.scrollTop = objMdgWindow.scrollHeight;
    }

    // chat scroll dolu
    var chatContainer = document.getElementById('chat-messages-container');
    if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // chat stav na zaklade cookie
    var chat = $.cookie("chat"), left_panel = $.cookie("left_panel");

    function hideChat() {
        $(".chat-box").animate({bottom: "-283px"});
        $("#chat-chevron-close").css("display", "none");
        $("#chat-chevron-open").css("display", "block");

        $.cookie("chat", 0);
    }

    function showChat() {
        $(".chat-box").animate({bottom: "0"});
        $("#chat-chevron-close").css("display", "block");
        $("#chat-chevron-open").css("display", "none");

        $.cookie("chat", 1);
    }

    if (chat && chat === '0') {
        hideChat();
    }

    // chat skryt
    $(".close-chat-icon").click(function(){
        hideChat();
    });

    // chat zobrazit
    $(".open-chat-icon").click(function(){
        showChat();
    });

    // zobrazit skryt okno se smajliky v chatu
    $("#chat-smiles-open").click(function(){
        if(!$('#chat-smiles-window').is(':visible')) {
            $("#chat-smiles-window").css('display', 'block');
        } else {
            $("#chat-smiles-window").css('display', 'none');
        }
    });

    // screenshoty - homepage
    $(".screenshot").click(function(){
        var imageSrc = $(this).attr('src');
        $("#imgBig").attr("src",imageSrc);
        $("#overlay").show();
        $("#overlayContent").show();
    });

    $("#imgBig").click(function(){
        $("#imgBig").attr("src", "");
        $("#overlay").hide();
        $("#overlayContent").hide();
    });

    // aliance založení -> switchování ras
    $('#alliance-race-select').on('input', function() {
        var selectElement = $('#alliance-race-select'),
            imgClass = selectElement.find(':selected').data('img-class'),
            textClass = selectElement.find(':selected').data('text-class');

        $('#allianceRaces > div').hide();
        $('#allianceRacesDescription > div').hide();
        $('.' + imgClass).css('display', 'block');
        $('.' + textClass).css('display', 'block');
    });

    // aliance, ZHN
    $("#alliance-wmd-form input").click(function() {
        var wmd = parseInt($(this).val());

        $('[id^=alliance-wmd-img-]').css('display', 'none');
        $('#alliance-wmd-img-' + wmd).css('display', 'initial');

        console.log(wmd);
        if (wmd === 1 || wmd === 2) {

            // planet dialog
            $('.wmd-attack-planet').css('display', 'block');
            $('.wmd-attack-star').css('display', 'none');
        }

        if (wmd === 3) {
            // star dialog
            $('.wmd-attack-planet').css('display', 'none');
            $('.wmd-attack-star').css('display', 'block');
        }
    });

    // přepínání hlavního (levého) panelu
    if (left_panel == "player") {
        $('#panelTabQuestLog').hide();
        $('#panelTabPlayer').show();
    }

    if (left_panel == "quest-log") {
        $('#panelTabPlayer').hide();
        $('#panelTabQuestLog').show();
    }

    $("#panelShowQuestLog").click(function() {
        $('#panelTabPlayer').hide();
        $('#panelTabQuestLog').show();

        $.cookie("left_panel", "quest-log");
    });
    $("#panelShowPlayer").click(function() {
        $('#panelTabQuestLog').hide();
        $('#panelTabPlayer').show();

        $.cookie("left_panel", "player");
    });

    // countdown
    $('[data-countdown]').each(function() {
        var $this = $(this), finalDate = $(this).data('countdown');
        $this.countdown(finalDate, function(event) {
            var totalHours = event.offset.totalDays * 24 + event.offset.hours;
            $(this).html(event.strftime(totalHours + ':%M:%S'));
        });
    });

});
