import * as cheerio from "cheerio";
import {default as axios} from "axios";
import * as csv from 'fast-csv';
import * as fs from 'fs';
import {Comment} from './sentiment';

const ws = fs.createWriteStream("comments.csv");
const csvStream = csv.format({headers: true});
csvStream.pipe(ws);

async function getMovieCommentsLinks(): Promise<string[]> {
    const allFilmsRequest = await axios.get("https://www.csfd.cz/zebricky/nejrozporuplnejsi-filmy/?show=complete");
    const $ = cheerio.load(allFilmsRequest.data);
    const movieLinks = $('.film a').map((i, e) => $(e).attr("href")).get();
    return movieLinks.map(x => "https://www.csfd.cz" + x + "komentare/podle-datetime/?all=1");
}

async function crawlMovieComments(link: string):  Promise<"a"> {
    console.log("fetching ", link);
    const commentsRequest = await axios.get(link);
    const $ = cheerio.load(commentsRequest.data);
    const commentWrappers = $('.comments .ui-posts-list li');
    const commentData: Comment[] = commentWrappers.map((i, el) => {
        const ratingEl = $(el).find('.rating');
        const commentTextEl = $(el).find('.post')
        commentTextEl.find(".date").remove();
        const rating = ratingEl.attr('alt') ? ratingEl.attr('alt').length : 0;
        return {id: $(el).attr("id"), rating, comment: commentTextEl.text()} as Comment
    }).get();

    commentData.forEach(comment => csvStream.write(comment));
    return "a";
}


async function main() {
    const movieLinks = await getMovieCommentsLinks();
    for (const movieLink of movieLinks) {
        await wait(0.01);
        await crawlMovieComments(movieLink);
    }
    console.log("DONE!");
}

async function wait(seconds) {
    return new Promise(resolve => {
        setTimeout(resolve, seconds * 1000);
    })
}

main().then();