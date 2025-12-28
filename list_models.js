import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyDzdWVThesKJ6Y7aMgv-PpqI6zuYPNgxIQ";

async function listModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("--- START MODEL LIST ---");
        if (data.models) {
            data.models.forEach(m => console.log(m.name));
        } else {
            console.log("No models found in response.");
        }
        console.log("--- END MODEL LIST ---");
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
