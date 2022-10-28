var sqrl = require('squirrelly')
const fs = require('fs')
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

// let data = {
//     songs: [
//         {
//             Title: "Well Enough",
//             Artist: "Future Teens",
//             File: "this.mp3"
//         },
//         {
//             Title: "BYOB",
//             Artist: "Future Teens",
//             File: "that.mp3"
//         },
//     ]
// }

const params = {
    TableName: 'MusicTable'
}

exports.handler = async (e, ctx) => {
    let scan = await docClient.scan(params).promise()
    let data = {
        songs: []
    }
    do {
        scan.Items.forEach((i) => data.songs.push(i))
        params.ExclusiveStartKey = scan.LastEvaluatedKey
    } while (typeof scan.LastEvaluatedKey != 'undefined')
    console.log(e)
    return response(sqrl.render(template, data))
}

function response(html){
    return {
        "statusCode": 200,
        "body": html,
        "headers": {
            "Content-Type": "text/html",
        }
    }
}

const template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test</title>
</head>
<body>
    <div class="content">
        <h1>Illegal Music Site</h1>
        <form>
            <input type="text" placeholder="Title" />
            <input type="text" placeholder="Artist" />
            <input type="File" />
        </form>
        <div>
            {{@each(it.songs) => s, i}}
            <div class="song">
                <p>{{s.Title}} - {{s.Artist}}</p>
                <audio controls>
                    <source src="{{s.File}}" type="audio/mpeg">
                </audio>
            </div>
            {{/each}}
        </div>
    </div>  
</body>
<style>
    body {
        font-family: Verdana, Geneva, Tahoma, sans-serif;
    }
    h1 {
        text-align: center;
        font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
    }
    .content {
        width: 60%;
    }
</style>
</html>
`
