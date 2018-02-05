$(function() {
  var Accordion, accordion, isEmailValid, isNameValid, isPhoneValid, toggleSubmit;
  isNameValid = false;
  isPhoneValid = false;
  isEmailValid = false;
  toggleSubmit = function() {
    if (isEmailValid === true && isPhoneValid === true && isNameValid) {
      $('#submit').removeClass('disabled');
      $('#submit').prop('disabled', false);
    } else {
      $('#submit').addClass('disabled');
      $('#submit').prop('disabled', true);
    }
  };
  $('form').submit(function(e) {
    e.preventDefault();
  });
  Accordion = function(el, multiple) {
    var links;
    this.el = el || {};
    this.multiple = multiple || false;
    links = this.el.find('.link');
    links.on('click', {
      el: this.el,
      multiple: this.multiple
    }, this.dropdown);
  };
  Accordion.prototype.dropdown = function(e) {
    var $el, $next, $this;
    $el = e.data.el;
    $this = $(this);
    $next = $this.next();
    $next.slideToggle();
    $this.parent().toggleClass('open');
    if (!e.data.multiple) {
      $el.find('.submenu').not($next).slideUp().parent().removeClass('open');
    }
  };
  accordion = new Accordion($('#accordion'), false);
  $('#Name').bind('input propertychange', function(e) {
    isNameValid = e.target.validity.valid;
    toggleSubmit();
  });
  $('#Phone').bind('input propertychange', function(e) {
    isPhoneValid = e.target.validity.valid;
    toggleSubmit();
  });
  $('#Email').bind('input propertychange', function(e) {
    isEmailValid = e.target.validity.valid;
    toggleSubmit();
  });
  $('#submit').click(function(e) {
    var user_email, user_name, user_phone;
    user_name = $('#Name').val();
    user_email = $('#Email').val();
    user_phone = $('#Phone').val();
    console.log(document.getElementById('Name').checkValidity());
    console.log(document.getElementById('Email').checkValidity());
    console.log(document.getElementById('Phone').checkValidity());
    console.log(user_name, user_email, user_phone);
    $.ajax({
      type: 'POST',
      url: "http://localhost:8080/user/edit/<%= user_found._id %>",
      data: {
        name: user_name,
        phone: user_phone,
        email: user_email
      },
      dataType: 'json',
      cache: false,
      async: false
    }).done(function(data) {
      console.log(data);
      $.notify({
        icon: 'glyphicon glyphicon-warning-sign',
        title: 'Bootstrap notify<br>',
        message: 'Turning standard Bootstrap alerts into "notify" like notifications',
        url: 'https://github.com/mouse0270/bootstrap-notify',
        target: '_blank'
      }, {
        element: 'body',
        position: null,
        type: 'info',
        allow_dismiss: true,
        newest_on_top: false,
        showProgressbar: false,
        placement: {
          from: 'top',
          align: 'right'
        },
        offset: 20,
        spacing: 10,
        z_index: 1031,
        delay: 5000,
        timer: 1000,
        url_target: '_blank',
        mouse_over: null,
        animate: {
          enter: 'animated fadeInDown',
          exit: 'animated fadeOutUp'
        },
        onShow: null,
        onShown: null,
        onClose: null,
        onClosed: null,
        icon_type: 'class',
        template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0}" role="alert">' + '<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' + '<span data-notify="icon"></span> ' + '<span data-notify="title">{1}</span> ' + '<span data-notify="message">{2}</span>' + '<div class="progress" data-notify="progressbar">' + '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' + '</div>' + '<a href="{3}" target="{4}" data-notify="url"></a>' + '</div>'
      });
    });
  });
});

//# sourceMappingURL=edit.js.map
