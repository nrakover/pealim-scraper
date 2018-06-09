const app = require("./app.js")

var testResponse = {
    status: function (code) {
        return {
            send: function (payload) {
                console.log(payload)
            }
        }
    }
}

var testRequest = {
    body: {query: "ללכת"}
}

app.scrapeConjugations(testRequest, testResponse)
