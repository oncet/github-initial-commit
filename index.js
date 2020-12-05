(async function () {
  const getCurrentTab = () => (
    new Promise((resolve, reject) => {
      try {
        chrome.tabs.query({
          active: true,
          windowId: chrome.windows.WINDOW_ID_CURRENT,
        }, tabs => resolve(tabs[0]))
      } catch(error) {
        reject(error)
      }
    })
  )

  const { url } = await getCurrentTab()

  let urlFragment

  try {
    // TODO Match owner/repo/foo also
    urlFragment = url.match(/github\.com\/(.+?\/.+?)$/)[1]
  } catch {
    document.querySelector('h1').innerText = 'Not in a GitHub repo :('
  }

  // Get response headers
  const { headers } = await fetch(`https://api.github.com/repos/${urlFragment}/commits`, {
    method: 'HEAD'
  })

  // Extract last page link from headers
  const lastPageLink = [...headers.get('link').matchAll(/\W<(.+?)>; rel="last"/gm)]
    .map(link => link[1])[0]

  // Get commits from last page
  const response = await fetch(lastPageLink)
  const commits = await response.json()

  // Get oldest commit
  const oldest = commits.sort((first, second) => (
      new Date(second.commit.author.date) - new Date(first.commit.author.date)
    )).pop()
  
  window.open(oldest.html_url)
})()
