var challenges;
var user_solves = [];
var templates = {};

window.challenge = new Object();

function loadchal(id) {
    var obj = $.grep(challenges, function (e) {
        return e.id == id;
    })[0];

    if (obj.type === 'hidden') {
        ezal({
            title: "Challenge Hidden!",
            body: "You haven't unlocked this challenge yet!",
            button: "Got it!"
        });
        return;
    }

    updateChalWindow(obj);
}

function loadchalbyname(chalname) {
    var obj = $.grep(challenges, function (e) {
        return e.name == chalname;
    })[0];

    updateChalWindow(obj);
}

function updateChalWindow(obj) {
    $.get(script_root + "/api/v1/challenges/" + obj.id, function (response) {
        var challenge_data = response.data;

        $.getScript(script_root + obj.script, function () {
            $.get(script_root + obj.template, function (template_data) {
                $('#challenge-window').empty();
                var template = nunjucks.compile(template_data);
                window.challenge.data = challenge_data;
                window.challenge.preRender();

                challenge_data['description'] = window.challenge.render(challenge_data['description']);
                challenge_data['script_root'] = script_root;

                $('#challenge-window').append(template.render(challenge_data));

                $('.challenge-solves').click(function (e) {
                    getsolves($('#challenge-id').val())
                });
                $('.nav-tabs a').click(function (e) {
                    e.preventDefault();
                    $(this).tab('show')
                });

                // Handle modal toggling
                $('#challenge-window').on('hide.uk.modal', function (event) {
                    $("#submission-input").removeClass("uk-form-danger");
                    $("#submission-input").removeClass("uk-form-success");
                    $("#incorrect-key").slideUp();
                    $("#correct-key").slideUp();
                    $("#already-solved").slideUp();
                    $("#too-fast").slideUp();
                });

                $('#submit-key').click(function (e) {
                    e.preventDefault();
                    //$('#submit-key').addClass("disabled-button");
                    $('#submit-key').prop('disabled', true);
                    window.challenge.submit(function (data) {
                        renderSubmissionResponse(data);
                        loadchals(function () {
                            marksolves();
                        });
                    });
                });

                // $("#submission-input").keyup(function (event) {
                //     if (event.keyCode == 13) {
                //         $("#submit-key").click();
                //     }
                // });

                $(".input-field").bind({
                    focus: function () {
                        $(this).parent().addClass('input--filled');
                        $label = $(this).siblings(".input-label");
                    },
                    blur: function () {
                        if ($(this).val() === '') {
                            $(this).parent().removeClass('input--filled');
                            $label = $(this).siblings(".input-label");
                            $label.removeClass('input--hide');
                        }
                    }
                });

                window.challenge.postRender();

                window.location.replace(window.location.href.split('#')[0] + '#' + obj.name);
                //$('#challenge-window').modal();
                UIkit.modal('#challenge-window', { bgclose: true, center: true }).show();
            });
        });
    });
}

$("#submission-input").keyup(function (event) {
    if (event.keyCode == 13) {
        $("#submit-key").click();
    }
});


function renderSubmissionResponse(response, cb) {
    var result = response.data;

    var result_message = $('#result-message');
    var result_notification = $('#result-notification');
    var answer_input = $("#submission-input");
    result_notification.removeClass('uk-alert-warning');
    result_notification.removeClass('uk-alert-success');
    result_notification.removeClass('uk-alert-danger');
    result_message.text(result.message);

    if (result.status === "authentication_required") {
        window.location = script_root + "/login?next=" + script_root + window.location.pathname + window.location.hash;
        return
    }
    else if (result.status === "incorrect") { // Incorrect key
        result_notification.addClass('uk-alert-danger');
        result_notification.slideDown();

        answer_input.removeClass("uk-form-success");
        answer_input.addClass("uk-form-danger");
        setTimeout(function () {
            answer_input.removeClass("uk-form-danger");
        }, 3000);
    }
    else if (result.status === "correct") { // Challenge Solved
        result_notification.addClass('uk-alert-success');
        result_notification.slideDown();

        $('.challenge-solves').text((parseInt($('.challenge-solves').text().split(" ")[0]) + 1 + " Solves"));

        answer_input.val("");
        answer_input.removeClass("uk-form-danger");
        answer_input.addClass("uk-form-success");
        setTimeout(function () { 
            UIkit.modal('#challenge-window').hide();
            update();
        }, 3000);
    }
    else if (result.status === "already_solved") { // Challenge already solved
        result_notification.addClass('uk-alert-primary');
        result_notification.slideDown();
        setTimeout(function () { 
            UIkit.modal('#challenge-window').hide();
            update();
        }, 3000);

        //answer_input.addClass("uk-form-danger");
    }
    else if (result.status === "paused") { // CTF is paused
        result_notification.addClass('uk-alert-warning');
        result_notification.slideDown();
    }
    else if (result.status === "ratelimited") { // Keys per minute too high
        result_notification.addClass('uk-alert-warning');
        result_notification.slideDown();

        answer_input.addClass("uk-form-danger");
        setTimeout(function () {
            answer_input.removeClass("uk-form-danger");
        }, 3000);
    }
    setTimeout(function () {
        $('.alert').slideUp();
        //$('#submit-key').removeClass("disabled-button");
        $('#submit-key').prop('disabled', false);
    }, 3000);

    if (cb) {
        cb(result);
    }
}

function marksolves(cb) {
    $.get(script_root + '/api/v1/' + user_mode + '/me/solves', function (response) {
        var solves = response.data;
        for (var i = solves.length - 1; i >= 0; i--) {
            var id = solves[i].challenge_id;
            var btn = $('button[value="' + id + '"]');
            btn.addClass('solved-challenge');
            btn.prepend("<i class='fas fa-check corner-button-check'></i>")
        }
        if (cb) {
            cb();
        }
    });
}

function load_user_solves(cb) {
    if (authed) {
        $.get(script_root + '/api/v1/' + user_mode + '/me/solves', function (response) {
            var solves = response.data;

            for (var i = solves.length - 1; i >= 0; i--) {
                var chal_id = solves[i].challenge_id;
                user_solves.push(chal_id);

            }
            if (cb) {
                cb();
            }
        });
    } else {
        cb();
    }
}

function getsolves(id) {
    $.get(script_root + '/api/v1/challenges/' + id + '/solves', function (response) {
        var data = response.data;
        $('.challenge-solves').text(
            (parseInt(data.length) + " Solves")
        );
        var box = $('#challenge-solves-names');
        box.empty();
        for (var i = 0; i < data.length; i++) {
            var id = data[i].account_id;
            var name = data[i].name;
            var date = moment(data[i].date).local().fromNow();
            var account_url = data[i].account_url
            box.append('<tr><td><a href="{0}">{2}</td><td>{3}</td></tr>'.format(account_url, id, htmlentities(name), date));
        }
    });
}

function loadchals(cb) {
    $.get(script_root + "/api/v1/challenges", function (response) {
        var categories = [];
        challenges = response.data;

        $('#challenges-board').empty();

        for (var i = challenges.length - 1; i >= 0; i--) {
            challenges[i].solves = 0;
            if ($.inArray(challenges[i].category, categories) == -1) {
                var category = challenges[i].category;
                categories.push(category);

                var categoryid = category.replace(/ /g, "-").hashCode();
                var categoryrow = $('' +
                    '<div id="{0}-row" class="uk-margin">'.format(categoryid) +
                    '<div class="category-header uk-margin">' +
                    '</div>' +
                    '<div class="category-challenges">' +
                    '<div class="challenges-row uk-grid-medium uk-text-center uk-child-width-1-2@s uk-child-width-1-4@m uk-grid-match" uk-grid></div>' +
                    '</div>' +
                    '</div>');
                categoryrow.find(".category-header").append($("<h1>" + category + "</h1>"));

                $('#challenges-board').append(categoryrow);
            }
        }

        for (var i = 0; i <= challenges.length - 1; i++) {
            var chalinfo = challenges[i];
            var challenge = chalinfo.category.replace(/ /g, "-").hashCode();
            var chalid = chalinfo.name.replace(/ /g, "-").hashCode();
            var catid = chalinfo.category.replace(/ /g, "-").hashCode();
            var chalwrap = $("<div id='{0}'></div>".format(chalid));

            if (user_solves.indexOf(chalinfo.id) == -1) {
                var chalbutton = $("<div class='uk-card-footer'><button class='challenge-button uk-button uk-button-text uk-button-large' value='{0}'>Open Challenge</button></div>".format(chalinfo.id));
                var chalcard = $('<div class="uk-card uk-card-hover uk-card-default uk-card-body" uk-scrollspy="cls: uk-animation-fade;"></div>');

            } else {
                var chalbutton = $("<button class='challenge-button uk-button uk-button-text uk-button-large solved-challenge' value='{0}'>Open Challenge</button>".format(chalinfo.id));
                var chalcard = $('<div class="uk-card uk-card-hover uk-card-primary uk-card-body" uk-scrollspy="cls: uk-animation-fade;"><div class="uk-card-badge uk-text-success uk-label">Solved</div></div>');
            }

            var chalheader = $("<div class='uk-card-header'><h2 class='uk-margin-remove-bottom'>{0}</h2></div>".format(chalinfo.name));
            var chalscore = $("<div class='uk-card-body'><h1>{0}</h1></div>".format(chalinfo.value));
            for (var j = 0; j < chalinfo.tags.length; j++) {
                var tag = 'tag-' + chalinfo.tags[j].value.replace(/ /g, '-');
                chalwrap.addClass(tag);
            }

            chalcard.prepend(chalheader);
            chalcard.append(chalscore);
            chalcard.append(chalbutton);
            chalwrap.append(chalcard);

            // chalbutton.append(chalheader);
            // chalbutton.append(chalscore);
            // chalwrap.append(chalbutton);

            $("#" + catid + "-row").find(".category-challenges > .challenges-row").append(chalwrap);
        }

        $('.challenge-button').click(function (e) {
            loadchal(this.value);
            getsolves(this.value);
        });

        if (cb) {
            cb();
        }
    });
}



$('#submit-key').click(function (e) {
    submitkey($('#challenge-id').val(), $('#submission-input').val(), $('#nonce').val())
});

$('.challenge-solves').click(function (e) {
    getsolves($('#challenge-id').val())
});

$('#challenge-window').on('hide.uk.modal', function (event) {
    $("#submission-input").removeClass("uk-form-danger");
    $("#submission-input").removeClass("uk-form-success");
    $("#incorrect-key").slideUp();
    $("#correct-key").slideUp();
    $("#already-solved").slideUp();
    $("#too-fast").slideUp();
});

var load_location_hash = function () {
    if (window.location.hash.length > 0) {
        loadchalbyname(decodeURIComponent(window.location.hash.substring(1)));
    }
};

function update(cb) {
    load_user_solves(function () { // Load the user's solved challenge ids
        loadchals(function () { //  Load the full list of challenges
            if (cb) {
                cb();
            }
        });
    });
}

$(function () {
    update(function () {
        load_location_hash();
    });
});

$('.nav-tabs a').click(function (e) {
    e.preventDefault();
    $(this).tab('show')
});

$('#challenge-window').on('hidden.uk.modal', function () {
    //$('.nav-tabs a:first').tab('show');
    history.replaceState('', document.title, window.location.pathname);
});

setInterval(update, 300000);
