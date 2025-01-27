//final
const socket = io("ws://localhost:3500")

function sendMessage(e) {
    const input1 = document.querySelector('.input1')
    const input2 = document.querySelector('.input2')
    function input1_has_input() {
        if (input1.value) {
            return true
        }
        else {
            return false
        }
    }
    function input2_has_input() {
        if (input2.value) {
            return true
        }
        else {
            return false
        }
    }
    if (!(input1_has_input())) {
        input1.value = "!!//default"
    }
    if (!(input2_has_input)) {
        e.preventDefault()
    }
    if (input2.value && input1.value) {
        socket.emit('message', input1.value, input2.value)
        input1.value = ""
        input2.value = ""
    }
    input1.focus()
    input2.focus()
}

document.querySelector('form')
    .addEventListener('submit', sendMessage)

socket.on('message', (data) => {
    const li = document.createElement('li')
    /*const img = new Image()
    img.src = `data:image/*;base64,${ image }` */
    li.textContent = data
    document.querySelector('ul').appendChild(li)
})