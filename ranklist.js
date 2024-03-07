function get_handle_from_row(row) {
    // copied from content.js
    return row.children[1].children[0].innerText.toLowerCase()
}

chrome.storage.local.get("handle_list").then((result) => {
    handle_list = result['handle_list']
    RANKLIST = document.getElementById('ranklist')
                        .getElementsByTagName('tbody')[0]
                        .getElementsByTagName('tr')
    for (const row of RANKLIST) {
        handle = get_handle_from_row(row)
        if (handle_list.hasOwnProperty(handle)) {
            info = handle_list[handle]
            row.children[1].innerHTML += `<br><span style='color:gray;font-size:x-small;'>${info['name'] + ' / ' + info['division']}</span>`
        }
    }
})