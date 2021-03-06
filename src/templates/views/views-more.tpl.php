<?php

/**
 * @file
 * Theme the more link.
 *
 * Variables:
 * - $view: The view object.
 * - $more_url: the url for the more link.
 * - $link_text: the text for the more link.
 *
 * @ingroup views_templates
 */
?>
<?php
// Sometimes we have a special url. In these cases we manually replace it.
// We strictly limit it, because this is not replacing substitutions.
$available_blocks = array('latest_block', 'block');
if ($view->name == 'announcements' && in_array($view->current_display, $available_blocks) && $view->display[$view->current_display]->handler->options['link_display'] == 'custom_url'):
  $more_url = $view->display[$view->current_display]->handler->options['link_url'];
endif;
?>
<div class="more-link">
  <a class="listing__read-more" href="<?php print $more_url ?>">
    <?php print $link_text; ?>
  </a>
</div>
