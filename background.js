chrome.runtime.onInstalled.addListener((e) => {
    chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' })
    fetch(chrome.runtime.getURL('list.csv'))
        .then((response) => response.text())
        .then((txt) => csv_parse(txt))
});

function csv_parse(txt){
    const res = {}
    let [h, ...data] = txt.split('\n')
    head = h.trim().split(',')
    for (b of data){
        now = b.split(',')
        obj = {}
        for (idx = 0; idx < head.length && idx < now.length; idx++){
            const column_name = head[idx].trim()
            if (column_name === '백준 핸들')
                obj.handle = now[idx].toLowerCase()
            else if (column_name === '이름')
                obj.name = now[idx]
            else if (column_name === '스터디 반' && now[idx] !== '')
                obj.division = now[idx]
            else if (column_name === '멘토' && now[idx] !== '' && !('division' in obj))
                obj.division = now[idx]
        }
        if (obj.division){
            if (obj.division.includes('멘토')) 
                obj.division_priority = 10
            else if (obj.division === '초급반')
                obj.division_priority = 1
            else if (obj.division === '중급반')
                obj.division_priority = 2
            else if (obj.division === '고급반')
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
