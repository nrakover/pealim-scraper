const app = require("./app.js")

var dummyResponse = {
    status: function (code) {
        return {
            send: function (payload) {
                console.log(payload)
            }
        }
    }
}

app.getConjugations({query: "ללכת"}, dummyResponse)
