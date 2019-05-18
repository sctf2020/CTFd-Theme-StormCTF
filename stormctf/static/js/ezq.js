var modal = '<div class="uk-modal" uk-modal>' + 
    '   <div class="uk-modal-dialog uk-background-secondary">' +
    '       <button class="uk-modal-close-default" type="button" uk-close></button>' +
    '       <div class="uk-modal-header uk-background-muted">' +
    '           <h5 class="uk-modal-title">\{0\}</h5>' +
    '       </div>' +
    '       <div class="uk-modal-body uk-background-secondary">' +
    '           <p>\{1\}</p>' +
    '       </div>' +
    '       <div class="uk-modal-footer uk-background-muted">' +
    '       </div>' +
    '   </div>' +
    '</div>';

var progress = '<progress class="uk-progress" value="\{0\}" max="100">' +
    '</progress>';

var error_template = "<div class=\"uk-alert-danger uk-animation-shake\" role=\"alert\" uk-alert>\n" +
"  <a class=\"uk-alert-close\" uk-close></a>" +
"  <p class=\"uk-text-center\"><span uk-icon=\"warning\"></span> \{0\}</p>\n" +
"</div>";


var success_template = "<div class=\"uk-alert-success\" role=\"alert\" uk-alert>\n" +
"  <a class=\"uk-alert-close\" uk-close></a>" +
"  <strong>Success!</strong>\n" +
"  \{0\}\n" +
"</div>";


function ezal(args){
    var res = modal.format(args.title, args.body);
    var obj = $(res);
    var button = '<button type="button" class="uk-modal-close uk-button uk-button-primary" data-dismiss="modal">{0}</button>'.format(args.button);

    obj.find('.uk-modal-footer').append(button);
    $('main').append(obj);

    UIkit.modal(obj).show();
    // obj.modal('show');

    $(obj).on('hidden.uk.modal', function (e) {
        // $(this).modal('dispose');
        UIkit.modal(this).hide();
    });

    return obj;
}

function ezq(args){
    var res = modal.format(args.title, args.body);
    var obj = $(res);
    var deny = '<button type="button" class="uk-modal-close uk-button uk-button-danger uk-margin-right" data-dismiss="modal">No</button>';
    var confirm = $('<button type="button" class="uk-button uk-button-primary" data-dismiss="modal">Yes</button>');

    obj.find('.uk-modal-footer').append(deny);
    obj.find('.uk-modal-footer').append(confirm);

    $('main').append(obj);

    $(obj).on('hidden.uk.modal', function (e) {
        UIkit.modal(this).hide();
       // $(this).modal('dispose');
    });

    $(confirm).click(function(){
        args.success();
    });
    UIkit.modal(obj).show();
    // obj.modal('show');

    return obj;
}

function ezpg(args){
    if (args.target){
        var obj = $(args.target);
        var pbar = obj.find('.uk-progress');
        pbar.css('width', args.width + '%');
        return obj;
    }
    var bar = progress.format(args.width);
    var res = modal.format(args.title, bar);

    var obj = $(res);
    $('main').append(obj);
    obj.modal('show');

    return obj;
}

function ezbadge(args) {
    var type = args.type;
    var body = args.body;
    var tpl = undefined;
    if (type === 'success') {
        tpl = success_template;
    } else if (type === 'error') {
        tpl = error_template;
    }

    tpl = tpl.format(body);
    var obj = $(tpl);
    return obj;
}