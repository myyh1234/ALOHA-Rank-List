ranking = {}
const SCOREBOARD = document.getElementById('contest_scoreboard')
    .getElementsByTagName('tbody')[0]
    .getElementsByTagName('tr')

const table_header = document.getElementById('contest_scoreboard')
    .getElementsByTagName('thead')[0]
    .children[0]

function get_handle_from_row(row) {
    return row.children[1].children[0].innerText
}

async function essential_solved(row) {
    const result = await chrome.storage.session.get('essential')
    problems = result['essential']
    if (!problems) return true
    for (let c of problems.toLowerCase().split(' ')) {
        if ('a' <= c && c <= 'z') {
            if (!row.children[c.charCodeAt(0) - 'a'.charCodeAt(0) + 2].classList.contains('accepted'))
                return false
        }
        else if (parseInt(c) == c) {
            if (!row.children[parseInt(c) + 1].classList.contains('accepted'))
                return false;
        }
    }
    return true
}

async function init() {
    return await chrome.storage.local.get("handle_list").then(async (result) => {
        handle_list = result['handle_list']
        let idx = 0
        for (const row of SCOREBOARD) {
            handle = get_handle_from_row(row)
            ranking[handle] = idx++
            if (handle_list.hasOwnProperty(handle)) {
                info = handle_list[handle]
                row.children[1].innerHTML += `<br><span style='color:gray;font-size:x-small'>${info['name'] + ' / ' + info['division']}</span>`
            }
            if (await essential_solved(row))
                row.classList.add('solved_all_essential')
        }
    })
}

async function update_show_state() {
    const state = await chrome.storage.session.get('show')
    if (state['show'])
        document.body.classList.add('show_solved')
    else
        document.body.classList.remove('show_solved')
}

handle_list = init()
update_show_state()

// compare function returns row_a < row b

function by_ranking(row_a, row_b) {
    const handle_a = get_handle_from_row(row_a)
    const handle_b = get_handle_from_row(row_b)
    return ranking[handle_a] < ranking[handle_b]
}

function by_name(row_a, row_b) {
    const handle_a = get_handle_from_row(row_a)
    const handle_b = get_handle_from_row(row_b)
    if (!handle_list.hasOwnProperty(handle_a))
        return false;
    if (!handle_list.hasOwnProperty(handle_b))
        return true;
    return handle_list[handle_a]['name'] < handle_list[handle_b]['name']
}

function by_division(row_a, row_b) {
    const handle_a = get_handle_from_row(row_a)
    const handle_b = get_handle_from_row(row_b)
    if (!handle_list.hasOwnProperty(handle_a))
        return false;
    if (!handle_list.hasOwnProperty(handle_b))
        return true;
    const user_a = handle_list[handle_a]
    const user_b = handle_list[handle_b]
    if (user_a['division_priority'] !== user_b['division_priority'])
        return user_a['division_priority'] < user_b['division_priority']
    return by_name(row_a, row_b)
}

function by_essential_solved(row_a, row_b) {
    const handle_a = get_handle_from_row(row_a)
    const handle_b = get_handle_from_row(row_b)
    if (!handle_list.hasOwnProperty(handle_a))
        return false;
    if (!handle_list.hasOwnProperty(handle_b))
        return true;
    if (row_a.classList.contains('solved_all_essential') !== row_b.classList.contains('solved_all_essential'))
        return !row_a.classList.contains('solved_all_essential')
    return by_division(row_a, row_b)
}

async function set_essential_solved() {
    for (const row of SCOREBOARD) {
        if (await essential_solved(row))
            row.classList.add('solved_all_essential')
        else
            row.classList.remove('solved_all_essential')
    }
}

let compare_id = 0
const compare_functions = [
    by_ranking, by_essential_solved, by_division, by_name
]
const compare_function_name = [
    "연습 순위", "필수문제 안 푼", "분반", "이름 가나다"
]

function sort_table() {
    // insertion sort
    const parent = SCOREBOARD[0].parentNode
    for (let i = 1; i < SCOREBOARD.length; i++) {
        for (let j = 0; j < i; j++) {
            if (!compare_functions[compare_id](SCOREBOARD[j], SCOREBOARD[i])) {
                parent.insertBefore(SCOREBOARD[i], SCOREBOARD[j])
                break
            }
        }
    }
}

table_header.children[1].title = '연습 순위 순으로 정렬됨\n클릭하여 필수문제 안 푼 순으로 정렬하기'
table_header.children[table_header.children.length - 1].title = '연습 순위 순으로 정렬하기'

table_header.children[1].onclick = async (e) => {
    compare_id = (compare_id + 1) % compare_functions.length
    if (compare_functions[compare_id] === by_essential_solved)
        await set_essential_solved()
    sort_table()
    table_header.children[1].title =
        `${compare_function_name[compare_id]} 순으로 정렬됨\n클릭하여 ${compare_function_name[(compare_id + 1) % compare_functions.length]} 순으로 정렬하기`
}

table_header.children[table_header.children.length - 1].onclick = (e) => {
    compare_id = 0
    sort_table()
}

chrome.runtime.onMessage.addListener(async (msg, sender) => {
    if (msg === '[ALOHA Rank List] essential') {
        await set_essential_solved()
        sort_table()
    }
    else if (msg === '[ALOHA Rank List] show')
        update_show_state()
})