from transformers import pipeline, Conversation

chatbot = pipeline("conversational", model="HuggingFaceH4/zephyr-7b-beta")

conv = Conversation("Give me a tip for better sleep.")
result = chatbot(conv)

print(result)
