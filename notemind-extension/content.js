// content.js - NoteMind Web Clipper
// Runs on every http/https page automatically

// Listen for messages from popup.html
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'extract') {
    try {
      var selected = ''
      try { selected = window.getSelection().toString().trim() } catch(e) {}

      var title = document.title || ''
      var url   = window.location.href || ''

      if (selected.length > 10) {
        sendResponse({ ok: true, source: 'selection', content: selected, title: title, url: url })
        return true
      }

      // Extract full page text
      var content = ''
      try {
        var clone = document.body.cloneNode(true)
        var remove = clone.querySelectorAll('script,style,nav,footer,header,aside,noscript,iframe,button,input')
        for (var i = 0; i < remove.length; i++) { remove[i].remove() }
        content = (clone.innerText || clone.textContent || '').trim()
        content = content.replace(/\n{3,}/g, '\n\n').replace(/[ \t]{2,}/g, ' ').slice(0, 40000)
      } catch(e) {
        content = document.body.innerText || ''
      }

      sendResponse({ ok: true, source: 'page', content: content, title: title, url: url })
    } catch(e) {
      sendResponse({ ok: false, error: e.message })
    }
    return true
  }
})

// Signal that content script is ready
window.__notemind_ready = true