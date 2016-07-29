var activities = [];

function valid_email(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function valid_credit_card(value) {
    if (/[^0-9-\s]+/.test(value)) return false;

    var nCheck = 0, nDigit = 0, bEven = false;
    value = value.replace(/\D/g, "");

    for (var n = value.length - 1; n >= 0; n--) {
        var cDigit = value.charAt(n);
        nDigit = parseInt(cDigit, 10);

        if (bEven) {
            if ((nDigit *= 2) > 9) nDigit -= 9;
        }

        nCheck += nDigit;
        bEven = !bEven;
    }
    return (nCheck % 10) === 0;
}

function parseActivityInfo(text) {
    var re = /(Tuesday|Wednesday)?[\s]?([1-9]{1,2})?(am|pm)?-?([1-9]{1,2})?(am|pm)?[,\s$]{0,3}?([0-9]{1,4})/; 
    var str = text;
    var m;
     
    if ((m = re.exec(str)) !== null) {
        if (m.index === re.lastIndex) {
            re.lastIndex++;
        }
    }

    var day, start_hour, end_hour;

    if (m[1] === "Tuesday") {
        day = 26; // assuming this is July 26, 2016
    } else if (m[1] === "Wednesday") {
        day = 27; // assuming this is July 27, 2016
    }

    if (m[3] === 'am') {
        start_hour = +m[2];
    } else if (m[3] === 'pm') {
        start_hour = +m[2] + 12;
    }

    if (m[5] === 'am') {
        end_hour = +m[4];
    } else if (m[5] === 'pm') {
        if (+m[4] !== 12) {
            end_hour = +m[4] + 12;
        } else {
            end_hour = +m[4];
        }
    }

    var start_time = new Date(2016, 06, day, start_hour);
    var end_time = new Date(2016, 06, day, end_hour);

    return {
        start_time: new Date(2016, 06, day, start_hour),
        end_time: new Date(2016, 06, day, end_hour),
        price: m[6]
    };
}

var checked_activities_indexes = [];

function testActivityConflicts() {
    var disabled_activity_indexes = [];
    for (var i = 0; i < checked_activities_indexes.length; i++) {
        var activity = activities[checked_activities_indexes[i]];
        for (var j = 0; j < activities.length; j++) {
            var start_time_conflict = ((activities[j].start_time >= activity.start_time) && (activities[j].end_time <= activity.end_time));
            var end_time_conflict = ((activities[j].end_time >= activity.start_time) && (activities[j].end_time <= activity.end_time));
            if (start_time_conflict && end_time_conflict) {
                if (disabled_activity_indexes.indexOf(j) === -1) {
                    disabled_activity_indexes.push(j);
                }
            }
        }
    }
    return disabled_activity_indexes;
}

$(document).ready(function() {
    // add focus to element
    var name = $('#name');
    name.focus();

    // add input for other title
    var other_title = $("<input type='text' id='other-title' placeholder='Your Job Role'></input>");
    $($('form').find('fieldset')[0]).append(other_title);
    other_title.hide();
    console.log($('#title'));
    $('#title').on('change', function() {
        console.log('changed');
        if ($(this).val() === 'other') {
            other_title.show();
        } else {
            other_title.hide().val("");
        }
    });

    // show only the color options for the right theme
    var color = $('#color');
    var options = color.find('option');
    options.each(function() {
        var text = $(this).text().split("(");
        if (text[1].indexOf("JS Puns") > -1) {
            $(this).attr('data-theme', 'js-puns');
            $(this).text(text[0]);
        } else {
            $(this).attr('data-theme', 'i-heart-js');
            $(this).text(text[0]);
        }
    });

    var placeholder_option = $('<option value="" data-theme="no-selection" selected><-- Please select a T-shirt theme</option>');
    var js_puns_options = $('[data-theme="js-puns"]');
    var i_heart_js_options = $('[data-theme="i-heart-js"]');

    color.prepend(placeholder_option);
    js_puns_options.hide();
    i_heart_js_options.hide();

    $('#design').on('change', function() {
        if ($(this).val() === 'js puns') {
            placeholder_option.hide().first().attr('selected', false);
            i_heart_js_options.hide().first().attr('selected', false);
            js_puns_options.show().first().attr('selected', true);
        } else if ($(this).val() === 'heart js') {
            placeholder_option.hide().first().attr('selected', false);
            i_heart_js_options.show().first().attr('selected', true);
            js_puns_options.hide().first().attr('selected', false);
        } else {
            placeholder_option.show().first().attr('selected', true);
            i_heart_js_options.hide().first().attr('selected', false);
            js_puns_options.hide().first().attr('selected', false);
        }
    });

    // disable activities that conflict with current choice, and show total price

    $('.activities').find('label').each(function(i) {
        activities.push(parseActivityInfo($(this).text()));
        $(this).find('input').attr('data-index', i);
    });

    var activity_inputs = $('.activities').find('input');

    var total_displayed = false;
    var something_checked;

    function add_or_remove_total() {
        something_checked = false;
        activity_inputs.each(function() {
            if ($(this).is(':checked')) {
                something_checked = true;
            }
        });
        if (!total_displayed && something_checked) {
            $('.activities').append($('<div id="total_container">Total: $<span id="total"></span></div>'));
            total_displayed = true;
        } else if (total_displayed && !something_checked) {
            $('#total_container').remove();
            total_displayed = false;
        }
    }

    function update_total() {
        var total = 0;
        activity_inputs.each(function() {
            if ($(this).is(':checked')) {
                var activity = activities[$(this).attr('data-index')];
                total += +activity.price;
            }
        });
        $('#total').text(total);
    }

    activity_inputs.on('change', function() {
        var activity_index = +$(this).attr('data-index');
        if ($(this).is(':checked')) {
            checked_activities_indexes.push(activity_index);
        } else {
            var index_in_list = checked_activities_indexes.indexOf(activity_index);
            checked_activities_indexes.splice(index_in_list, 1);
        }
        disableConflicts(activity_index);
        add_or_remove_total();
        update_total();
    });
    
    function disableConflicts(just_changed) {
        var disabled_activity_indexes = testActivityConflicts();
        activity_inputs.each(function() {
            var current_index = +$(this).attr('data-index');
            if (just_changed !== current_index) {
                var have_conflict = disabled_activity_indexes.indexOf(current_index) > -1;
                var currently_checked = checked_activities_indexes.indexOf(current_index) > -1;
                if (have_conflict && !currently_checked) {
                    $(this).attr('disabled', true);
                    $(this).parent().css("color", "grey");
                } else {
                    $(this).attr('disabled', false);
                    $(this).parent().css("color", "#000");
                }
            }
        });
    }

    // select credit card option by default

    $('#payment').find('option[value="credit card"]').attr('selected', 'selected');

    var credit_card_option = $('#credit-card');
    var paypal_option = $('#paypal').hide();
    var bitcoin_option = $('#bitcoin').hide();

    $('#payment').on('change', function() {
        if ($(this).val() === 'credit card') {
            credit_card_option.show();
            paypal_option.hide();
            bitcoin_option.hide();
        } else if ($(this).val() === 'paypal') {
            credit_card_option.hide();
            paypal_option.show();
            bitcoin_option.hide();
        } else if ($(this).val() === 'bitcoin') {
            credit_card_option.hide();
            paypal_option.hide();
            bitcoin_option.show();
        }
    });

    // validate form on submit

    $('button[type="submit"]').on('click', function(e) {
        e.preventDefault();

        var form_errors = false;

        // validate name field
        if ($('#name').val() === "") {
            form_errors = true;
            if ($('#name_error').length === 0) {
                $('#name').prev()
                    .append($('<span id="name_error"> (please provide your name)</span>'))
                    .css({
                        'color': '#9A3151',
                        'font-weight': 'bold'
                    });
            }

        } else {
            $('#name').prev()
                .css({
                    'color': '#000',
                    'font-weight': 'normal'
                });
            $('#name_error').remove();
        }

        // validate email field
        var email = $('#mail').val();

        if (!valid_email(email)) {
            form_errors = true;
            if ($('#email_error').length === 0) {
                $('#mail').prev()
                    .append($('<span id="email_error"> (please provide your email)</span>'))
                    .addClass('error');
            }

        } else {
            $('#mail').prev().removeClass('error');
            $('#email_error').remove();
        }

        // validate shirt field
        if (($('#design').val() === "") || ($('#color').val() === "")) {
            form_errors = true;
            if ($('#shirt_error').length === 0) {
                $('.shirt').find('legend').after($('<div id="shirt_error">Don\'t forget to pick a T-Shirt</div>'));
            }
        } else {
            $('#shirt_error').remove();
        }

        // validate activity field
        if (!something_checked) {
            form_errors = true;
            if ($('#activity_error').length === 0) {
                $('.activities').find('legend').after($('<div id="activity_error">Please select an activity</div>'));
            }
        } else {
            $('#activity_error').remove();
        }

        // validate credit card fields

        if ($('#payment').val() == 'credit card') {

            // validate credit card
            var credit_card_number = $('#cc-num').val();
            if ((valid_credit_card(credit_card_number) === false) || (credit_card_number === "")) {
                form_errors = true;
                $('#cc-num').prev().addClass('error');
            } else {
                $('#cc-num').prev().removeClass('error');
            }

            // validate zipcode
            var zip_code = $('#zip').val();
            if (parseInt(zip_code).toString().length !== 5) {
                form_errors = true;
                $('#zip').prev().addClass('error');
            } else {
                $('#zip').prev().removeClass('error');
            }

            // validated cvv
            var cvv = $('#cvv').val();
            if ((parseInt(cvv).toString().length !== 3) || (cvv === "")) {
                form_errors = true;
                $('#cvv').prev().addClass('error');
            } else {
                $('#cvv').prev().removeClass('error');
            }
        }

        if (!form_errors) {
            // send form to server....
        }
    });
});