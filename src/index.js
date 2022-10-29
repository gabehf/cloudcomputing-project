var sqrl = require('squirrelly')
const fs = require('fs')
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

const params = {
    TableName: 'MusicTable'
}

exports.handler = async (e, ctx) => {
    console.log(e)
    if (e.requestContext.http.method == "POST" && e.requestContext.http.path == "/add") {
        // handle POST /add
        let data = JSON.parse(e.body) // body content sent as JSON
        docClient.put({
            TableName: 'MusicTable',
            Item: {
                id: `${data.Title}-${data.Artist}`,
                Title: data.Title,
                Artist: data.Artist,
                File: 'notyetimplemented.mp3'
            }
        }, (err, d) => {
            if (err) {
                console.log(err)
            } else {
                console.log(d)
            }
        })
        return JSON.stringify({
            success: true
        })
    } else {
        let scan = await docClient.scan(params).promise()
        let data = {
            songs: []
        }
        do {
            scan.Items.forEach((i) => data.songs.push(i))
            params.ExclusiveStartKey = scan.LastEvaluatedKey
        } while (typeof scan.LastEvaluatedKey != 'undefined')
        return response(sqrl.render(template, data))
    }
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
        <form id="addSongForm">
            <label for="Title">Title</label>
            <input type="text" id="Title" name="Title" placeholder="Title" />
            <label for="Artist">Artist</label>
            <input type="text" id="Artist" name="Artist" placeholder="Artist" />
            <label for="File">File</label>
            <input type="File" id="File" name="File"/>
            <button id="formSubmit">Submit</button>
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
    <script>
    document.getElementById("formSubmit").addEventListener("click", formSubmit)
    async function formSubmit(e) {
        e.preventDefault()
        let title = document.getElementById("Title").value
        let artist = document.getElementById("Artist").value
    
        let resp = await fetch("/add", {
            method: 'POST',
            body: JSON.stringify({
                Artist: artist,
                Title: title
            })
        })
        // console.log({
        //         Artist: artist,
        //         Title: title
        //     })
        window.location.reload()
    }
    </script>
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
