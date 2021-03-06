import api from "./base-api.js"
import Body from "./classes/body.js"

export default async function GetSubreddits(redditSession, nameList = true) {
    const NOT_ALLOWED_SUBREDDITS = ["users", "popular", "all", "announcements"]
    const RX_FILTER_LINKS = /<a href="https:\/\/old.reddit.com\/(user|r)\/(.*?)\/" class="choice" >(.*?)<\/a>/gim
    const RX_REMOVE_TAGS = /(<a href="https:\/\/old.reddit.com\/(user|r)\/(.*?)\/" class="choice" >|<\/a>)/gim
    const headers = {
        'sec-ch-ua': '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Cookie': `reddit_session=${redditSession};`
    }
    const body = new Body("get", "subreddits", headers)
    const res = await api(body)

    let data = (res.data.match(RX_FILTER_LINKS)).toString().replace(RX_REMOVE_TAGS, "").split(",")
    let temp = []

    data.map((e) => {
        let found = temp.find(i => i === e)
        let notAllowedFound = NOT_ALLOWED_SUBREDDITS.find(i => i === e)

        if (!notAllowedFound && !found) {
            temp.push(e)
        }
    })

    if (nameList) {
        return temp
    }

    data = []

    for await (let i of temp) {
        let body = new Body("get", `${i.startsWith("u/") ? i : `r/${i}`}/about.json`, headers)
        let res = await api(body)

        if (i.startsWith("u/")) {
            data.push(res.data.data.subreddit.name)

        } else {
            data.push(res.data.data.name)
        }
    }

    return data
}