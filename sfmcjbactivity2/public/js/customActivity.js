define([
    'postmonger'
], function(
    Postmonger
) {
    'use strict';

    var connection = new Postmonger.Session();
    var authTokens = {};
    var schema = [];
    var payload = {};
    var lastStepEnabled = false;
    var steps = [ // initialize to the same value as what's set in config.json for consistency
        { "label": "Step 1", "key": "step1" },
        { "label": "Step 2", "key": "step2" },
        { "label": "Step 3", "key": "step3" },
        { "label": "Step 4", "key": "step4", "active": false }
    ];
    var currentStep = steps[0].key;

    $(window).ready(onRender);

    connection.on('initActivity', initialize);
    connection.on('requestedTokens', onGetTokens);
    connection.on('requestedEndpoints', onGetEndpoints);

    connection.on('clickedNext', onClickedNext);
    connection.on('clickedBack', onClickedBack);
    connection.on('gotoStep', onGotoStep);

    connection.on('requestedSchema', function (data) {
        // save schema
        console.log('*** Schema ***', JSON.stringify(data['schema']));
        schema = data['schema'];
     });

    function onRender() {
        // JB will respond the first time 'ready' is called with 'initActivity'
        connection.trigger('ready');

        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');

        connection.trigger('requestSchema');

        // Disable the next button if a value isn't selected
        $('#textareamessage').change(function() {
            var message = getMessage();
            connection.trigger('updateButton', { button: 'next', enabled: Boolean(message) });

            $('#message').html(message.message);
        });

        $('#imglink').change(function() {
            var linkURL = getMessage();
            connection.trigger('updateButton', { button: 'next', enabled: Boolean(linkURL) });

            $('#imgUrltext').html(linkURL.imglink);
        });

        // Toggle step 4 active/inactive
        // If inactive, wizard hides it and skips over it during navigation
        $('#toggleLastStep').click(function() {
            lastStepEnabled = !lastStepEnabled; // toggle status
            steps[3].active = !steps[3].active; // toggle active

            connection.trigger('updateSteps', steps);
        });
    }

    function initialize (data) {
        if (data) {
            payload = data;
        }

        var message;
        var imglink;
        var hasInArguments = Boolean(
            payload['arguments'] &&
            payload['arguments'].execute &&
            payload['arguments'].execute.inArguments &&
            payload['arguments'].execute.inArguments.length > 0
        );

        var inArguments = hasInArguments ? payload['arguments'].execute.inArguments : {};

        $.each(inArguments, function(index, inArgument) {
            $.each(inArgument, function(key, val) {
                if (key === 'message') {
                    message = val;
                }
                if(key === 'imglink'){
                    imglink = val;
                }
            });
        });

        // If there is no message selected, disable the next button
        if (!message) {
            showStep(null, 1);
            connection.trigger('updateButton', { button: 'next', enabled: false });
            // If there is a message, skip to the summary step
        } else {
            $('#select1').find('option[value='+ message +']').attr('selected', 'selected');
            $('#message').html(message);
            $('#imgUrltext').html(imglink);
            showStep(null, 3);
        }
    }

    function onGetTokens (tokens) {
        // Response: tokens = { token: <legacy token>, fuel2token: <fuel api token> }
        // console.log(tokens);
    }

    function onGetEndpoints (endpoints) {
        // Response: endpoints = { restHost: <url> } i.e. "rest.s1.qa1.exacttarget.com"
        // console.log(endpoints);
    }

    function onClickedNext () {
        if (
            (currentStep.key === 'step3' && steps[3].active === false) ||
            currentStep.key === 'step4'
        ) {
            save();
        } else {
            connection.trigger('nextStep');
        }
    }

    function onClickedBack () {
        connection.trigger('prevStep');
    }

    function onGotoStep (step) {
        showStep(step);
        connection.trigger('ready');
    }

    function showStep(step, stepIndex) {
        if (stepIndex && !step) {
            step = steps[stepIndex-1];
        }

        currentStep = step;

        $('.step').hide();

        switch(currentStep.key) {
            case 'step1':
                $('#step1').show();
                connection.trigger('updateButton', {
                    button: 'next',
                    enabled: Boolean(getMessage())
                });
                connection.trigger('updateButton', {
                    button: 'back',
                    visible: false
                });
                break;
            case 'step2':
                $('#step2').show();
                connection.trigger('updateButton', {
                    button: 'back',
                    visible: true
                });
                connection.trigger('updateButton', {
                    button: 'next',
                    text: 'next',
                    visible: true
                });
                break;
            case 'step3':
                $('#step3').show();
                connection.trigger('updateButton', {
                     button: 'back',
                     visible: true
                });
                if (lastStepEnabled) {
                    connection.trigger('updateButton', {
                        button: 'next',
                        text: 'next',
                        visible: true
                    });
                } else {
                    connection.trigger('updateButton', {
                        button: 'next',
                        text: 'done',
                        visible: true
                    });
                }
                break;
            case 'step4':
                $('#step4').show();
                break;
        }
    }

    function save() {
        // Save arguments and update journey builder

        //var name = $('#select1').find('option:selected').html();
        var name = $('#textareamessage').val();
        var value = getMessage();
        var formArg = {};
        
        // 'payload' is initialized on 'initActivity' above.
        // Journey Builder sends an initial payload with defaults
        // set by this activity's config.json file.  Any property
        // may be overridden as desired.
        payload.name = name;

        console.log("schema: "+schema);
        if (schema !== "undefined" && schema.length > 0) {
            console.log("in to update argument");
            // the array is defined and has at least one element
            for (var i in schema) {
                var field = schema[i];
                var index = field.key.lastIndexOf(".");
                var keyname = field.key.substring(index + 1);
        
                if (
                field.key.indexOf("Event.APIEvent") !== -1 ||
                field.key.indexOf("Event.SalesforceObj") !== -1 ||
                field.key.indexOf("Event.DEAudience") !== -1
                )
                formArg[keyname] = "{{" + field.key + "}}";

                formArg['message'] = value.message;
                formArg['imglink'] = value.imglink;
            }
            // must be set to true for the journey to recognize
            // the activity as fully configured (required for activation)
            payload.metaData.isConfigured = true;
            payload["arguments"].execute.inArguments.push(formArg);
        }

        //payload['arguments'].execute.inArguments = [{ "message": value , "LineId": "{{Event.2C67FC2F-CB09-44BC-9A4B-BD7DCD83153B.Line_Id}}"}];

        //payload['arguments'].execute.body = "GGG";

        payload['metaData'].isConfigured = true;

        console.log("saved payload ", JSON.stringify(payload));

        connection.trigger('updateActivity', payload);
    }

    function getMessage() {
        //抓取選項清單的值
        //return $('#select1').find('option:selected').attr('value').trim();
        var textmessage = $('#textareamessage').val();
        console.log("textareamessage: " + textmessage);
        
        var imglink = $('#imglink').val();
        console.log("imglink: " + imglink);

        var valuelist = {};
        valuelist["message"] = textmessage;
        valuelist["imglink"] = imglink;
        console.log(valuelist);

        return valuelist;
    }

    function getMessage2() {
        //抓取選項清單的值
        //return $('#select1').find('option:selected').attr('value').trim();
        var textmessage = $('#message').val();
        console.log("message: " + textmessage);
        
        var imglink = $('#imgUrltext').val();
        console.log("imgUrltext: " + imglink);

        var valuelist = {};
        valuelist["message"] = textmessage;
        valuelist["imglink"] = imglink;
        console.log(valuelist);

        return valuelist;
    }
});