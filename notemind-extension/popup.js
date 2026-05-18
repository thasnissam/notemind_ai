var BASE = 'http://127.0.0.1:8000'
var selText = ''
var pgUrl   = ''

function g(id) { return document.getElementById(id) }
function setStatus(msg, cls) { g('st').textContent = msg; g('st').className = 'status ' + cls }

chrome.storage.local.get('nm_token', function(r) {
  if (r.nm_token) { g('tok').value = r.nm_token; g('tokOk').textContent = '✓ saved' }
})

g('tok').addEventListener('input', function() {
  var v = g('tok').value.trim()
  chrome.storage.local.set({ nm_token: v })
  g('tokOk').textContent = v ? '✓ saved' : ''
})

g('clrBtn').addEventListener('click', function() {
  g('tok').value = ''; g('tokOk').textContent = ''
  chrome.storage.local.remove('nm_token')
})

function fillFromResult(data, tabTitle, tabUrl) {
  pgUrl = data.url || tabUrl || ''
  g('ttl').value = data.title || tabTitle || ''
  g('cnt').value = data.content || ''

  if (data.source === 'selection' && data.content && data.content.length > 10) {
    selText = data.content
    var pre = selText.slice(0, 90) + (selText.length > 90 ? '…' : '')
    g('qpre').textContent = '"' + pre + '"'
    g('qbox').style.display = 'block'
    g('sep').style.display  = 'block'
  }
}

chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  if (!tabs || !tabs[0]) { g('cnt').placeholder = 'No tab found.'; return }

  var tab = tabs[0]
  pgUrl = tab.url || ''
  g('ttl').value = tab.title || ''

  chrome.tabs.sendMessage(tab.id, { action: 'extract' }, function(resp) {
    if (chrome.runtime.lastError || !resp || !resp.ok) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: function() {
          try {
            var sel = window.getSelection().toString().trim()
            if (sel.length > 10) {
              return { ok:true, source:'selection', content:sel, title:document.title, url:location.href }
            }
            var clone = document.body.cloneNode(true)
            var els = clone.querySelectorAll('script,style,nav,footer,header,aside,noscript,iframe')
            for (var i=0; i<els.length; i++) els[i].remove()
            var txt = (clone.innerText||clone.textContent||'')
              .replace(/\n{3,}/g,'\n\n').replace(/[ \t]{2,}/g,' ').trim().slice(0,40000)
            return { ok:true, source:'page', content:txt, title:document.title, url:location.href }
          } catch(e) {
            return { ok:false, error:e.message }
          }
        }
      }, function(results) {
        if (chrome.runtime.lastError) {
          g('cnt').placeholder = 'Cannot read this page. Try on a normal website (http/https).'
          return
        }
        if (!results || !results[0] || !results[0].result || !results[0].result.ok) {
          g('cnt').placeholder = 'Could not extract. Reload the page and try again.'
          return
        }
        fillFromResult(results[0].result, tab.title, tab.url)
      })
      return
    }
    fillFromResult(resp, tab.title, tab.url)
  })
})

function doSave(content, btnEl) {
  var token = g('tok').value.trim()
  var title = g('ttl').value.trim()
  var tag   = g('tag').value.trim() || 'web'

  if (!token)          { setStatus('Paste your auth token first.', 'err'); return }
  if (!title)          { setStatus('Please enter a title.', 'err'); return }
  if (!content.trim()) { setStatus('No content to save.', 'err'); return }

  btnEl.disabled = true
  setStatus('Saving…', 'loading')

  var body = JSON.stringify({
    title:   title,
    content: '[Clipped from: ' + pgUrl + ']\n\n' + content.trim(),
    tag:     tag,
    url:     ''
  })

  fetch(BASE + '/upload-text', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body:    body
  })
  .then(function(r) { return r.json().then(function(d) { return { ok: r.ok, data: d } }) })
  .then(function(r) {
    if (r.ok) {
      chrome.storage.local.set({ nm_token: token })
      g('tokOk').textContent = '✓ saved'
      setStatus('Saved! Now searchable in NoteMind.', 'ok')
    } else {
      setStatus((r.data.detail || 'Error saving'), 'err')
    }
  })
  .catch(function() {
    setStatus('Cannot reach backend — is it running on port 8000?', 'err')
  })
  .finally(function() { btnEl.disabled = false })
}

g('qbtn').addEventListener('click',    function() { doSave(selText,         g('qbtn'))    })
g('saveBtn').addEventListener('click', function() { doSave(g('cnt').value,  g('saveBtn')) })