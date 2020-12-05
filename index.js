(async function () {
  console.log('hey there')
  const { headers } = await fetch('https://api.github.com/repos/facebook/react/commits', { method: 'HEAD' })
  const lastPageLink = [...headers.get('link').matchAll(/\W<(.+?)>; rel="last"/gm)].map(link => link[1])[0]
  console.log(lastPageLink)
  const response = await fetch(lastPageLink)
  const commits = await response.json()
  const oldest = commits.sort((first, second) => (
      new Date(second.commit.author.date) - new Date(first.commit.author.date)
    )).pop()
    
  // console.log(commits.map(({ commit }) => commit.author.date));
  console.log(oldest.html_url);

  window.open(oldest.html_url)
})();
