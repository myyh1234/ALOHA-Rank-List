const essential = document.getElementById('essential')
const checkbox = document.getElementById('check_show')

chrome.storage.session.get('essential')
    .then((response) => {
        if (response['essential'])
            essential.value = response['essential']
    })

chrome.storage.session.get('show')
    .then((response) => {
        if (response['show']){
            checkbox.checked = true
        }
    })

function url_match(url){
    matches = ["https://www.acmicpc.net/group/practice/view/17099/", "https://www.acmicpc.net/group/practice/view/20229/"]
    for (u of matches){
        if (url.startsWith(u))
            return true
    }
    return false
}

async function sendMessage_to_currentTab(msg){
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
    if (url_match(tab.url))
        chrome.tabs.sendMessage(tab.id, msg)
}

essential.oninput = () => {
    chrome.storage.session.set({'essential' : essential.value})
    sendMessage_to_currentTab("[ALOHA Rank List] essential")   
}

checkbox.onchange = () => {
    chrome.storage.session.set({'show' : checkbox.value})
    sendMessage_to_currentTab("[ALOHA Rank List] show")
}