"use strict";
const S3 = require("aws-sdk/apis/s3");
const puppeteer = require('puppeteer');

const getS3Configuration = (sourceBucket) => {
    return {
        accessKeyId: process.env[`KOYEB_STORE_${sourceBucket}_ACCESS_KEY`],
        secretAccessKey: process.env[`KOYEB_STORE_${sourceBucket}_SECRET_KEY`],
        region: process.env[`KOYEB_STORE_${sourceBucket}_REGION`],
        endpoint: process.env[`KOYEB_STORE_${sourceBucket}_ENDPOINT`],
    };
};

const handler = async (event) => {
    const cutoff = process.env["CUTOFF"] || 8;
    const s3Conf = getS3Configuration("out");
    const bucket = process.env[`KOYEB_STORE_out_STORE_NAME`]
    const s3Instance = new S3(s3Conf);

    const res = await s3Instance.listObjects({Bucket: bucket}).promise();
    const current = fileName();
    let f = [];
    if (res.includes(current)) {
        const resp = await s3Instance.getObject({Key: current, Bucket: bucket}).promise();
        f = JSON.parse(resp.Body.toString());
    }

    const out = merge(f, await pitch(cutoff));
    console.log(out);
    await s3Instance.putObject({body: JSON.stringify(out), Key: current, Bucket: bucket});
};

const merge = (cur, fetched) => {
    const urlSet = {};
    cur.forEach(v => urlSet[v.url] = true);

    return cur.concat(fetched.filter(v => !urlSet[v.url]));
};

const pitch = async (cutoff) => {
    const browser = await puppeteer.launch();
    const links = (await Promise.all([1, 2, 3].map(async v => {
        const page = await browser.newPage();
        await page.goto(`https://pitchfork.com/reviews/albums/?page=${v}`, {waitUntil: 'networkidle2'});
        return page.$$eval('a.review__link', nodes => nodes.map(n => n.href));
    }))).flat().slice(0, 10);
    const address = (await Promise.all(links.map(async v => {
        const page = await browser.newPage();
        await page.goto(v, {waitUntil: 'networkidle2'});
        return {
            score: await page.$eval('span.score', n => n.textContent),
            url: v,
            title: await page.$eval('.single-album-tombstone__review-title', n => n.textContent),
            artist: await page.$eval('.single-album-tombstone__artist-links', n => n.textContent)
        };
    }))).filter(n => n.score > cutoff);
    await browser.close();
    return address;
};

const fileName = () => {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth()}.json`
};
//
// pitch(8).then(v => {
//   const i = [{url: "fgewfew"}, {url: "fewfew"},   {
//     score: '8.4',
//     url: 'https://pitchfork.com/reviews/albums/coil-musick-to-play-in-the-dark/',
//     title: 'Musick to Play in the Dark',
//     artist: 'Coil'
//   }];
//
//   console.log(merge(i, v));
// });
// console.log(fileName());

module.exports.handler = handler;
