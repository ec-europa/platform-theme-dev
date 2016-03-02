/**
 * @file
 * Overriding some of the default ajax behaviors.
 */

 /**
  * Override Drupal's AJAX prototype beforeSend to append the throbber to pager.
  */
if (Drupal.ajax && Drupal.ajax.prototype) {
  Drupal.ajax.prototype.beforeSend = (xmlhttprequest, options) => {
    // For forms without file inputs, the jQuery Form plugin serializes the form
    // values, and then calls jQuery's jQuery.ajax() function, which invokes this
    // handler. In this circumstance, options.extraData is never used. For forms
    // with file inputs, the jQuery Form plugin uses the browser's normal form
    // submission mechanism, but captures the response in a hidden IFRAME. In this
    // circumstance, it calls this handler first, and then appends hidden fields
    // to the form to submit the values sin options.extraData. There is no simple
    // way to know which submission mechanism will be used, so we add to extraData
    // regardless, and allow it to be ignored in the former case.
    if (this.form) {
      options.extraData = options.extraData || {};

      // Let the server know when the IFRAME submission mechanism is used. The
      // server can use this information to wrap the JSON response in a TEXTAREA,
      // as per http://jquery.malsup.com/form/#file-upload.
      options.extraData.ajax_iframe_upload = '1';

      // The triggering element is about to be disabled (see below), but if it
      // contains a value (e.g., a checkbox, textfield, select, etc.), ensure that
      // value is included in the submission. As per above, submissions that use
      // jQuery.ajax() are already serialized prior to the element being disabled, so
      // this is only needed for IFRAME submissions.
      const v = jQuery.fieldValue(this.element);
      if (v !== null) {
        options.extraData[this.element.name] = v;
      }
    }

    // Disable the element that received the change to prevent user interface
    // interaction while the Ajax request is in progress. ajax.ajaxing prevents
    // the element from triggering a new request, but does not prevent the user
    // from changing its value.
    jQuery(this.element).addClass('progress-disabled').attr('disabled', true);

    // Insert progressbar or throbber.
    if (this.progress.type === 'bar') {
      const progressBar = new Drupal.progressBar(
        `ajax-progress-${this.element.id}`,
        eval(this.progress.update_callback),
        this.progress.method,
        eval(this.progress.error_callback)
      );

      if (this.progress.message) {
        progressBar.setProgress(-1, this.progress.message);
      }

      if (this.progress.url) {
        progressBar.startMonitoring(this.progress.url, this.progress.interval || 1500);
      }

      this.progress.element = jQuery(progressBar.element).addClass('ajax-progress ajax-progress-bar');
      this.progress.object = progressBar;

      jQuery(this.element).after(this.progress.element);
    } else if (this.progress.type === 'throbber') {
      this.progress.element = jQuery('<div class="ajax-progress ajax-progress-throbber"><i class="icon icon--spinner is-spinning"></i></div>');
      // If element is an input type, append after.
      if (jQuery(this.element).is('input')) {
        if (this.progress.message) {
          jQuery('.throbber', this.progress.element)
            .after(`<div class="message">${this.progress.message}</div>`);
        }
        jQuery(this.element).after(this.progress.element);
      } else {
        // Otherwise inject it inside the element.
        if (this.progress.message) {
          jQuery('.throbber', this.progress.element)
            .append(`<div class="message">${this.progress.message}</div>`);
        }
        jQuery(this.element).append(this.progress.element);
      }
    }
  };
}
