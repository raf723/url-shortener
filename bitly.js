import { Application } from 'https://deno.land/x/abc@v1.3.1/mod.ts'
import denjucks from 'https://denopkg.com/alexpeattie/denjucks/mod.js'
import { Store } from 'https://deno.land/x/store@v1.2.0/mod.ts';

const app = new Application()
const PORT = 8080
const store = new Store('shortenings')

app.renderer = { render: denjucks.render }
app
  .static('/assets', './assets')
  .get('/', (server) => {
    server.render('bitly.html')
  })
  .get('/visits/:shortcode', (server) => {
    const { shortcode } = server.params
    const visitCount = store['data'][shortcode].visits
    server.render('visits.html', { visitCount })
  })
  .get('/l/:shortcode', (server) => {
    const { shortcode } = server.params
    if (store['data'] != undefined && store['data'].hasOwnProperty(shortcode)) {
      server.redirect(store['data'][shortcode]['fullurl'])
      store['data'][shortcode]['visits'] += 1
    } else {
      server.render('404.html')
    }
  })
  .post('/shorten', async (server) => {
    const shortcode = Math.random().toString(36).substr(2, 4)
    const { fullurl } = await server.body

    await store.set(shortcode, { fullurl, visits: 0 })
    const shortURL = `http://localhost:8080/l/${shortcode}`
    server.render('bitly-s.html', { shortURL })
  })
  .start({ port: PORT })
console.log(`Server running on http://localhost:${PORT}`)
