rom groq import Groq

# Initialize Groq client
client = Groq(api_key="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")

def mentor_reply(data: dict):

    question = data.get("question")

    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": "You are an AI mentor helping students with career advice."
            },
            {
                "role": "user",
                "content": question
            }
        ]
    )

    answer = completion.choices[0].message.content

    return {"response": answer}
