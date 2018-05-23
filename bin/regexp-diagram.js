#!/usr/bin/env node

const puppeteer = require('puppeteer')
// const fs = require('fs')

async function main(url, re) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    try {
        await page.goto(`${url}?re=${encodeURIComponent(re)}`)

        let svg = await page.evaluate(() => {
            return document.querySelector('svg').outerHTML
        })
//         fs.writeFileSync('output.svg', svg)
        console.info(svg)
    }
    catch (e) {
        console.error('Failed...', e)
    }
    await browser.close()
}

if (process.argv.length < 3) {
    console.error('Required arg missing...')
}
else {
    let url = `file://${__dirname}/../docs/index.html`
    let re = process.argv[2]
    main(url, re)
}
