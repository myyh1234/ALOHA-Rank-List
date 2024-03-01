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

async function sendMessage_to_currentTab(msg){
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
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