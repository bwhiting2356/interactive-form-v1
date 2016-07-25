$(document).ready(function() {
    // add focus to element
    var name = $('#name');
    name.focus();

    // add input for other title
    var other_title = $("<input type='text' id='other-title' placeholder='Your Title'></input>");
    $($('form').find('fieldset')[0]).append(other_title);
    other_title.hide();
    $('#title').on('change', function() {
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
            placeholder_option.hide();
            i_heart_js_options.hide();
            js_puns_options.show();
        } else if ($(this).val() === 'heart js') {
            placeholder_option.hide();
            i_heart_js_options.show();
            js_puns_options.hide();
        } else {
            placeholder_option.show();
            i_heart_js_options.hide();
            js_puns_options.hide();
        }
    });

    // disable activities that conflict with current choice

    var activities_labels = $('.activities').find('label');
    activities_labels.each(function() {
        var activity_info = $(this).text();
        var regex = new RegExp('(Tuesday|Wednesday)?[\s]?([1-9]{1,2})?(am|pm)?-?([1-9]{1,2})?(am|pm)?[,\s$]{0,3}?([0-9]{1,4})');
        console.log(regex.exec(activity_info));
    });
});

