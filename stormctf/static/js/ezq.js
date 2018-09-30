/*var modal = '<div class="modal fade" tabindex="-1" role="dialog">' +
    '  <div class="modal-dialog" role="document">' +
    '    <div class="modal-content">' +
    '      <div class="modal-header">' +
    '        <h5 class="modal-title">\{0\}</h5>' +
    '        <button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
    '          <span aria-hidden="true">&times;</span>' +
    '        </button>' +
    '      </div>' +
    '      <div class="modal-body">' +
    '        <p>\{1\}</p>' +
    '      </div>' +
    '      <div class="modal-footer">' +
    '      </div>' +
    '    </div>' +
    '  </div>' +
    '</div>';*/
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
function ezal(args){
    var res = modal.format(args.title, args.body);
    var obj = $(res);
    var button = '<button type="button" class="uk-modal-close uk-button uk-button-primary" data-dismiss="modal">{0}</button>'.format(args.button);

    obj.find('.uk-modal-footer').append(button);
    $('main').append(obj);

    UIkit.modal(obj).show();
    //obj.modal('show');

    $(obj).on('hidden.uk.modal', function (e) {
        UIkit.modal(this).hide();
        //$(this).modal('dispose');
    })
}

function ezq(args){
    var res = modal.format(args.title, args.body);
    var obj = $(res);
    var deny = '<button type="button" class="uk-modal-close uk-button uk-button-danger" data-dismiss="modal">No</button>';
    var confirm = $('<button type="button" class="uk-button uk-button-primary" data-dismiss="modal">Yes</button>');

    obj.find('.uk-modal-footer').append(deny);
    obj.find('.uk-modal-footer').append(confirm);

    $('main').append(obj);

    $(obj).on('hidden.uk.modal', function (e) {
        UIkit.modal(this).hide();
        //$(this).modal('dispose');
    });

    $(confirm).click(function(){
        args.success();
    });
    UIkit.modal(obj).show();
    //obj.modal('show');
}