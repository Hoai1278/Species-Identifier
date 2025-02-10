//final
import { createRequire } from "module";
const require = createRequire(import.meta.url);
import { createServer } from "http"
import { Server } from "socket.io"
import { GoogleGenerativeAI } from "@google/generative-ai"
const httpServer = createServer()
import dotenv from 'dotenv'
const imageToBase64 = require('image-to-base64')
dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
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
    socket.on('message', async (data, image_URL) => {
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
        console.log(data, imagePart)
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