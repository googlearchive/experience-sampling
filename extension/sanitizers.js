/**
 * This extension handles URLs that might be malicious. Ensures that they are
 * stripped of all special characters so that they are safe to use as URL query
 * parameters.
 */

var sanitizers = {};  // Namespace

/**
 * The url is untrusted input. Delete all non-alphanumeric characters but '.'
 * The input url should have no scheme or be HTTP(S).
 * @param {url} The untrusted url.
 * @returns A trusted version of the url.
 */
sanitizers.ReplaceUrl = function(url) {
  // Remove http:// and https://, if present. If it's a different scheme,
  // reject it as not handled.
  if (url.match(/^http:\/\//))
    url = url.substring(7, url.length);
  else if (url.match(/^https:\/\//))
    url = url.substring(8, url.length);
  else if (url.match(/:\/\//))
    return '';

  // Remove the path.
  var splitByPath = url.split('/');
  if (splitByPath && splitByPath.length >= 2)
    url = splitByPath[0];

  return url.replace(/[^\w\.]+/g, '');
};
