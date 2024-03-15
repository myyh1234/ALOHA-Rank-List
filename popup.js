const essential = document.getElementById('essential')
const checkbox = document.getElementById('check_show')
const csv_button = document.getElementById('getcsv')
const save_button = document.getElementById('save')
const clear_button = document.getElementById('clear')

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
    chrome.storage.session.set({'show' : checkbox.checked})
    sendMessage_to_currentTab("[ALOHA Rank List] show")
}

clear_button.onclick = () => {
    if (confirm("Would you delete ALL data?"))
        chrome.storage.local.clear().then(() => alert('Cleared'))
}

save_button.onclick = async () => {
    csv_file = await csv_button.files[0].text()
    if (csv_file.length === 0) alert('You should select .csv file to submit')
    else if (confirm('Would you update to new data? Existing data will be deleted.')){
        await csv_parse(csv_file)
        alert(`${csv_button.files[0].name} Uploaded. Refresh page to apply`)
    }
}

async function csv_parse(txt){
    chrome.storage.local.clear()
    const res = {}
    let [h, ...data] = txt.split('\n')
    head = h.trim().split(',')
    for (b of data){
        now = b.split(',')
        obj = {}
        for (idx = 0; idx < head.length && idx < now.length; idx++){
            const column_name = head[idx].trim().toLowerCase()
            if (column_name === 'boj handle')
                obj.handle = now[idx].toLowerCase()
            else if (column_name === 'name')
                obj.name = now[idx]
            else if (column_name === 'division' && now[idx] !== '')
                obj.division = now[idx]
            else if (column_name === 'mentor' && now[idx] !== '' && !('division' in obj)){
                obj.division = obj.mentor = now[idx]
            }
        }
        if (obj.division){
            console.log(obj.division, obj.division.charCodeAt(0))
            if (obj.mentor) 
                obj.division_priority = 10
            else if (obj.division === '초급반' || obj.division.charCodeAt(0) === 52488)
                obj.division_priority = 1
            else if (obj.division === '중급반' || obj.division.charCodeAt(0) === 51473)
                obj.division_priority = 2
            else if (obj.division === '고급반' || obj.division.charCodeAt(0) === 44256)
                obj.division_priority = 3
            else
                obj.division_priority = 9999
        }
        else
            obj.division_priority = 9999
        if (obj.handle)
            res[obj.handle] = obj
    }
    chrome.storage.local.set({'handle_list' : res})
}

console.log(new Date().toLocaleTimeString())