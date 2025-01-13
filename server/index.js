//final
import { createRequire } from "module";
const require = createRequire(import.meta.url);
import { createServer } from "http"
import { Server } from "socket.io"
import { GoogleGenerativeAI } from "@google/generative-ai"
const httpServer = createServer()
import dotenv from 'dotenv'
const fs = require('fs')
dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
/*const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });*/
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
})
const io = new Server(httpServer, {
    cors: {
        orgin: process.env.NODE_ENV === "production" ? false : ["http://localhost:5500", "http://127.0.0.1:5500"]
    }
})
const generationConfig= {
    "temperature": 0.1,
}

io.on('connection', async socket => {
    console.log(`User ${socket.id} connected`)
    socket.on('message', async (data, image_URL, image_file) => {
        if (data == "!!//default") {
            data = "Identify the species of this organism by only stating its in this format; Common name: (its common name) Scientific name: (its scientific name in italics) Habitat: (habitat). Mrgin of error: (%)"
        }
        var imagePart
        var img
        if (image_URL != "//none") {
            imagePart = await fetch(`${image_URL}`)
            .then((response) => response.arrayBuffer())
            img = {
            inlineData: {
                data: Buffer.from(imagePart).toString("base64"),
                mimeType: "image/*",
                },
            }
        }
        else {
            imagePart = image_file
            img = image_file
        }
        console.log(data, imagePart)
         /*
        const imageResp = await fetch(
            'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Palace_of_Westminster_from_the_dome_on_Methodist_Central_Hall.jpg/2560px-Palace_of_Westminster_from_the_dome_on_Methodist_Central_Hall.jpg'
        )
            .then((response) => response.arrayBuffer());
        
        const result = await model.generateContent([
            {
                inlineData: {
                    data: Buffer.from(imageResp).toString("base64"),
                    mimeType: "image/jpeg",
                },
            },
            'Caption this image.',
        ]);
        console.log(result.response.text()); */
        /*model
        .generateContentStream([data, img])
        .then(async (result) => {
            for await (const chunk of result.stream) {
                const chunkText = chunk.text()
                console.log(data)
                //io.emit("message", `${ data }`)
                console.log(chunkText)
                socket.emit("content", chunkText)
                io.emit("message", chunkText)
            }
            const EndLine = "\n--------------------------------------------\n"
            socket.emit("content", "end of content")
            socket.emit("message", EndLine)
        })
        .catch((err) => {
            console.error("Error generating content:", err.message)
        }) */
        //io.emit('image', image.toString('base64'))
        /*const result = await model.generateContent([data, img])
        .catch((err) => {
            console.error("Error generating content:", err.message)
        })*/
        const chatSession = model.startChat({
            generationConfig,
            history: [
            ],
        })
        const result = await chatSession.sendMessage([data, img])
        .catch((err) => {
            console.error("Error generating content:", err.message)
        })
        console.log(result.response.text())
        socket.emit("message", result.response.text())
        socket.emit("message", "\n-------------------------------------------------------\n")

    })
})

const PORT = process.env.PORT
httpServer.listen(PORT, () => console.log('Listening on port', `${PORT}`))