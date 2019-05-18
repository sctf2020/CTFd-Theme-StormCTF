var error_template = "<div class=\"uk-alert-danger uk-animation-shake\" role=\"alert\" uk-alert>\n" +
"  <a class=\"uk-alert-close\" uk-close></a>" +
"  <p class=\"uk-text-center\"><span uk-icon=\"warning\"></span> \{0\}</p>\n" +
"</div>";


var success_template = "<div class=\"uk-alert-success\" role=\"alert\" uk-alert>\n" +
"  <a class=\"uk-alert-close\" uk-close></a>" +
"  <strong>Success!</strong>\n" +
"   Your profile has been updated\n" +
"</div>";


$(function () {
    var form = $('#user-settings-form');
    form.submit(function(e){
        e.preventDefault();
        $('#results').empty();
        var params = $('#user-settings-form').serializeJSON();

        CTFd.fetch('/api/v1/users/me', {
            method: 'PATCH',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        }).then(function (response) {
            if (response.status === 400) {
                response.json().then(function (object) {
                    if (!object.success){
                        Object.keys(object.errors).map(function(error){
                            var i = form.find('input[name={0}]'.format(error));
                            var input = $(i);
                            input.addClass('uk-form-danger');
                            input.removeClass('uk-form-success');
                            var error_msg = object.errors[error];
                            var alert = error_template.format(error_msg);
                            console.log(error_template);
                            $('#results').append(
                                alert
                            );
                        });
                    }
                });
            } else if (response.status === 200) {
                response.json().then(function (object) {
                    if (object.success) {
                        $('#results').html(
                            success_template
                        );
                    }
                });
            }
        });
    });
});