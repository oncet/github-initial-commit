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
  let response

  try {
    urlFragment = url.match(/github\.com\/([^\/]+\/[^\/]+)/)[1]
  } catch {
    document.querySelector('h1').innerText = 'Not in a GitHub repo :('
    return
  }

  try {
    response = await fetch(`https://api.github.com/repos/${urlFragment}/commits`)
  } catch {
    document.querySelector('h1').innerText = 'Fetch failed... no internet?'
    return
  }

  if (!response.ok) {
    document.querySelector('h1').innerText = 'Bad response... repo is private?'
    return
  }

  // Extract last page link from headers
  const links = response.headers.get('link')?.matchAll(/\W<(.+?)>; rel="last"/gm)

  const [ lastPageLink ] = links ? [...links].map(link => link[1]) : []

  const lastPageResponse = lastPageLink && await fetch(lastPageLink)
  
  const lastPageCommits = lastPageResponse ? await lastPageResponse.json() : await response.json()

  // Get oldest commit
  const oldest = lastPageCommits.sort((first, second) => (
      new Date(second.commit.author.date) - new Date(first.commit.author.date)
    )).pop()

  window.open(oldest.html_url)
})()
