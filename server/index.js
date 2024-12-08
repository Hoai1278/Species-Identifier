import { createServer } from "http"
import { Server } from "socket.io"
import { GoogleGenerativeAI } from "@google/generative-ai"
const httpServer = createServer()
import dotenv from 'dotenv'
dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
const io = new Server(httpServer, {
    cors: {
        orgin: process.env.NODE_ENV === "production" ? false : ["http://localhost:5500", "http://127.0.0.1:5500"]
    }
})

io.on('connection', async socket => {
    console.log(`User ${socket.id} connected`)
    socket.on('message', async (data, image) => {
        const imagePart = await fetch(`https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFBgu1_jkLOO4SHkOqiOYj7f8zfraaHJ0nnA&s`)
        .then((response) => response.arrayBuffer())
        console.log(data, imagePart)
        const img = {
            inlineData: {
                data: Buffer.from(imagePart).toString("base64"),
                mimeType: "image/*",
            },
        } /*
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
        await model
        .generateContentStream([data, img])
        .then(async (result) => {
            for await (const chunk of result.stream) {
                const chunkText = chunk.text()
                console.log(data)
                //io.emit("message", `${ data }`)
                console.log(chunkText)
                //socket.emit("content", chunkText)
                io.emit("message", chunkText)
            }
            //socket.emit("content", "end of content")
        })
        .catch((err) => {
            console.error("Error generating content:", err.message)
        })
        //io.emit('image', image.toString('base64'))
    })
})

const PORT = process.env.PORT
httpServer.listen(PORT, () => console.log('Listening on port', `${PORT}`))