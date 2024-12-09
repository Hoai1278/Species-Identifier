const socket = io("ws://localhost:3500")

function sendMessage(e) {
    e.preventDefault()
    const input1 = document.querySelector('.input1')
    const input2 = document.getElementById('URI')
    /*const image = document.getElementById('img').addEventListener('change', function() {
        const reader = new FileReader()
        reader.onload = function() {
            const base64 = this.result.replace(/.*base64,/, '')
            socket.emit('image', base64)
        }
    }, false)*/
    if (input1.value) {
        socket.emit('message', input1.value)
        input1.value = ""
    }
    input1.focus()
    if (input2.value) {
        socket.emit('URI', input2.value)
        input2.value = ""
    }
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