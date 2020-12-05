(async function () {
  // Get response headers
  const { headers } = await fetch('https://api.github.com/repos/facebook/react/commits', {
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
})();
