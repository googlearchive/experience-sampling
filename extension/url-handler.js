
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
  if ((parser.protocol === 'file:' || parser.protocol === ':') && 
      (inputUrl.substring(0, 6).indexOf(':') == -1)) {
    // If the protocol is empty, it might be missing the scheme. Add a scheme
    // and then try again.
    inputUrl = 'http://' + inputUrl;
    parser.href = inputUrl;
  }

  if (parser.protocol !== 'http:' && parser.protocol !== 'https:')
    scheme = parser.protocol + '//';

  return scheme + parser.host;
};

/**
 * Check whether a URL corresponds to a domain known to produce a green lock.
 * @param {String} url The url of interest. Should be a valid HTTPS url.
 * @returns {bool} True if a url is from a green lock site.
 */
urlHandler.IsGreenLockSite = function(url) {
  // Reject a site unless it's a domain known to produce a green lock.
  var greenLockSites = [
    '^google\\.\\\\*',
    '^facebook\\.com',
    '^mail\\.ru',
    '^pinterest\\.com',
    '^baidu\\.com',
    '^ask\\.com',
    '^stackoverflow\\.com',
    '^twitter\\.com',
    '^linkedin\\.com',
    '^live\\.com',
    '^bing\\.com',
    '^tumblr\\.com',
    '^imgur\\.com',
    '^instagram\\.com',
    '^wordpress\\.com',
    '^yahoo\\.com',
    '^wikipedia\\.org',
    '^wikimedia\\.org',
    '^paypal\\.com',
    '^vk\\.com',
    '\\\\*\\.google\\.\\\\*',
    '\\\\*\\.facebook\\.com',
    '\\\\*\\.mail\\.ru',
    '\\\\*\\.pinterest\\.com',
    '\\\\*\\.baidu\\.com',
    '\\\\*\\.ask\\.com',
    '\\\\*\\.stackoverflow\\.com',
    '\\\\*\\.twitter\\.com',
    '\\\\*\\.linkedin\\.com',
    '\\\\*\\.live\\.com',
    '\\\\*\\.bing\\.com',
    '\\\\*\\.tumblr\\.com',
    '\\\\*\\.imgur\\.com',
    '\\\\*\\.instagram\\.com',
    '\\\\*\\.wordpress\\.com',
    '\\\\*\\.yahoo\\.com',
    '\\\\*\\.wikipedia\\.org',
    '\\\\*\\.wikimedia\\.org',
    '\\\\*\\.paypal\\.com',
    '\\\\*\\.vk\\.com',
  ];
  var shortUrl = urlHandler.GetMinimalUrl(url);
  var whitelistRe = new RegExp(greenLockSites.join('|'));
  if (!shortUrl.match(whitelistRe))
    return false;

  // Reject subdomains/directories of whitelisted sites with mixed content.
  var blacklist = [
    '^https\:\\/\\/images\\.google\\.com\\\\*',
    '^https\:\/\/www\\.bing\\.com\/images\\\\*'
  ];
  var blacklistRe = new RegExp(blacklist.join('|'));
  if (url.match(blacklistRe))
    return false;

  return true;
};