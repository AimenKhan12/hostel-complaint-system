require('dotenv').config();

async function detectPriority(complaintText) {
  const apiKey = process.env.GEMINI_API_KEY;

  const prompt = `You are helping a hostel complaint system decide priority.
Read this complaint and reply with ONLY one word: "Urgent" or "Normal".
Urgent = safety issues, no water, no electricity, gas leak, security issue, fire, flooding.
Normal = everything else (painting, minor furniture issues, general requests).

Complaint: "${complaintText}"`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.candidates) {
      console.error('Gemini API error:', JSON.stringify(data));
      return 'Normal';
    }

    const aiReply = data.candidates[0].content.parts[0].text.trim();
    console.log('AI raw reply:', aiReply);

    return aiReply.toLowerCase().includes('urgent') ? 'Urgent' : 'Normal';

  } catch (error) {
    console.error('AI call failed, defaulting to Normal:', error.message);
    return 'Normal';
  }
}

module.exports = { detectPriority };