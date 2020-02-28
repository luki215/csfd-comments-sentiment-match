import * as csv from 'fast-csv';
import * as fs from 'fs';
import * as Sentiment from 'sentiment';
export interface Comment {
    rating: number;
    comment: string;
}
async function loadComments(): Promise<Comment[]> {
    return new Promise(resolve => {
        const comments: Comment[] = [];
        fs.createReadStream('comments.csv')
            .pipe(csv.parse({ headers: true }))
            .on('error', error => console.error(error))
            .on('data', row => {comments.push({...row, rating: +row.rating})})
            .on('end', (rowCount: number) => resolve(comments));
    });
}

async function loadCsAfinn(): Promise<any> {
    return new Promise(resolve => {
        const affinData = []
        fs.createReadStream('lib/afinn.cz.csv')
                .pipe(csv.parse({ headers: true }))
                .on('error', error => console.error(error))
                .on('data', row => affinData.push(row))
                .on('end', (rowCount: number) => resolve(affinData));
    })
}

function analyse(comments: Comment[], csAffin) {
    const labels = {};
    csAffin.forEach(element => {
        labels[element.word_cz] = +element.polarity
    });

    const sentiment = new Sentiment();
    sentiment.registerLanguage('cs', {labels});

    var match = 0;
    var matchNot3 = 0;
    var diffSum = 0
    comments.forEach(comment => {
        // result is from -1 to 1
        var result = sentiment.analyze(comment.comment, { language: 'cs' }).comparative;
        // from 0 to 2
        result +=1;
        //from 0 to 5
        result *= 5/2
        result = Math.round(result);
        const diff = Math.abs(comment.rating - result);
        if(result === comment.rating) match++;
        if(result === comment.rating && result !== 3) matchNot3++;
        diffSum+= diff;
        if(diff === 3) {
            console.log(comment.comment);
            console.dir(`${diff}, result: ${result}, rating: ${comment.rating}`);
        }
       // console.dir(`${diff}, ${result}, ${comment.rating}`);
    })
    console.log(`Match in ${match} cases, total ${(match/comments.length)*100}%`);
    console.log(`MatchNot3 in ${matchNot3} cases, total ${(matchNot3/comments.length)*100}%`);
    console.log(`diff avg: ${diffSum / comments.length}`);
    

} 

async function main() {
    const comments = await loadComments();
    const csAffin = await loadCsAfinn();
    analyse(comments, csAffin);

}
main();