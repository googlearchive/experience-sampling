
var urlHandler = {};  // Namespace

/**
 * In most cases, we don't want to display a full URL with a path.
 * @param {inputUrl} The original url.
 * @returns A more minimized version of the url.
 */
urlHandler.GetMinimalUrl = function(inputUrl) {
  var scheme = '';
  var hostport = '';
  var parser = document.createElement('a');
  parser.href = inputUrl;

  if (parser.protocol === 'chrome-extension:') {
    // The parser interprets some urls without schemes as relative to
    // chrome-extension:. If that happens, turn it into a https url instead.
    parser.href = 'https://' + inputUrl;
  }
  if (parser.protocol === ':') {
    // If the protocol is empty, it's a hopelessly mis-formatted url.
    return '';
  }

  if (parser.protocol !== 'http:' && parser.protocol !== 'https:')
    scheme = parser.protocol + '//';

  return scheme + parser.host;
};
