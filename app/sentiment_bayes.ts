import { Bayes } from 'ts-bayes';
import * as fs from 'fs';
import * as csv from 'fast-csv';
import { Comment } from './sentiment';

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

async function learn(classifier: Bayes, comments: Comment[]) {
    comments.forEach(comment => {
        classifier.learn(comment.comment, comment.rating.toString())
    })
}

function analyse(classifier: Bayes, comments: Comment[]) {
    var match = 0;
    var matchNot = 0;
    var diffSum = 0;

    const csvStream = csv.format({ headers: true });
    var writeStream = fs.createWriteStream("outputfile_bayes.csv");
    csvStream.pipe(writeStream).on('end', process.exit);

    comments.forEach(comment => {
        // result is from -1 to 1
        const result = +classifier.categorize(comment.comment);

        const diff = Math.abs(comment.rating - result);
        if(result === comment.rating) match++;
        if(result !== comment.rating) matchNot++;
        diffSum+= diff;
        
        csvStream.write({ predicted: result, actual: comment.rating, diff: diff, comment: comment.comment });

       // console.dir(`${diff}, ${result}, ${comment.rating}`);
    })
    csvStream.end();
    console.log(`Match in ${match} cases, total ${(match/comments.length)*100}%`);
    console.log(`MatchNot in ${matchNot} cases, total ${(matchNot/comments.length)*100}%`);
    console.log(`diff avg: ${diffSum / comments.length}`);
} 



async function main() {
    const comments = await loadComments();
    const classifier = new Bayes();
    const splitIndex = Math.floor(comments.length*0.7);

    learn(classifier, comments.slice(0, splitIndex));

    analyse(classifier, comments.slice(splitIndex, comments.length));

}
main();




