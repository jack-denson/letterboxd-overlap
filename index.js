const axios   = require('axios');
const cheerio = require('cheerio')


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getWatchlist( username ) {

    const watchlist_url = 'https://letterboxd.com/' + username + '/watchlist/';


    const { altTexts, numToSee } = await getPage( 1, watchlist_url )

    totalPages = Math.ceil( numToSee / 28 )

    allTitles = altTexts

    for( let page = 2; page <= totalPages; page++ ) {
        await sleep( (Math.random() + 0.5) * 1500 )
        const { altTexts: titles } = await getPage( page, watchlist_url )
        allTitles = allTitles.concat( titles )
    }

    return allTitles
}


async function getPage( n, watchlist_url ) {
    const watchlist_html = await axios.get(
        watchlist_url + '/page/' + n
    )

    const $ = cheerio.load(watchlist_html.data, null, false);

    altTexts = []
    
     $('li[class=poster-container]').find('div > img').each( (index, element) => {
        altTexts.push($(element).attr('alt'));
    });

    let toSee;

    $('div[id=content-nav]').find('h1').each( (i, el) => {
        toSee = el.children[ 1 ].data
    })

    const numToSee = toSee.match(/\d+/)[ 0 ]

    return { altTexts, numToSee }

}

async function getWatchlistOverlap( users ) {
    const watchlists = []
    for( user of users ) {
        const wl =  await getWatchlist( user )
        watchlists.push( wl  )
    }

    intersected = new Set(watchlists[ 0 ])
    for( watchlist of watchlists ) {
        intersected = new Set([...intersected].filter( x => new Set(watchlist).has( x ) ) )
    }

    console.log(intersected)
    return intersected


}
