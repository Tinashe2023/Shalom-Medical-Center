# AI Assistant Setup Guide

This guide will help you set up and configure the AI assistant feature for Shalom Medical Center.

## Prerequisites

- Windows, macOS, or Linux operating system
- At least 8GB RAM (16GB recommended)
- 5GB free disk space for model download

## Step 1: Install LMStudio

1. Visit [https://lmstudio.ai](https://lmstudio.ai)
2. Download LMStudio for your operating system
3. Install the application following the on-screen instructions
4. Launch LMStudio

## Step 2: Download the AI Model

### Option A: Using LMStudio GUI

1. Open LMStudio
2. Click on the **Search** tab (magnifying glass icon)
3. Search for: `qwen3-4b-2507`
4. Find **qwen/qwen3-4b-2507** in the results
5. Click **Download** (approximately 4GB download)
6. Wait for the download to complete

### Option B: Using Command Line

If you have LMStudio CLI installed:

```bash
lms get qwen/qwen3-4b-2507
```

## Step 3: Start LMStudio Server

1. Open LMStudio
2. Click on the **Local Server** tab (server icon)
3. Select the **qwen3-4b-2507** model from the dropdown
4. Click **Start Server**
5. Ensure the server is running on **port 1234** (default)
6. You should see "Server running" status

> **Note**: Keep LMStudio running in the background while using the AI assistant feature.

## Step 4: Configure Backend

The backend is already configured to connect to LMStudio on `localhost:1234`. No additional configuration needed!

## Step 5: Start Your Application

### Start Backend Server

```bash
cd src/backend
npm start
```

The backend should connect to LMStudio automatically.

### Start Frontend

```bash
npm run dev
```

## Step 6: Test the AI Assistant

1. Log in to your application (as patient, doctor, or admin)
2. Look for the **floating chat button** in the bottom-right corner (purple gradient with a message icon)
3. Click the button to open the AI assistant
4. Try asking a question:
   - **Patient**: "What are my upcoming appointments?"
   - **Doctor**: "What's my schedule for today?"
   - **Admin**: "How many total appointments are scheduled?"

## Troubleshooting

### Issue: "LMStudio is not running" error

**Solution:**
- Ensure LMStudio is open and the server is started
- Check that the server is running on port 1234
- Try restarting LMStudio

### Issue: "Model not found" error

**Solution:**
- Download the model using the steps in Step 2
- Ensure the model is selected in LMStudio's Local Server tab
- Verify the model name is exactly: `qwen/qwen3-4b-2507`

### Issue: Slow AI responses (>10 seconds)

**Solution:**
- This is normal on systems with limited RAM/CPU
- Consider using a smaller model if available
- Close other resource-intensive applications
- Enable GPU acceleration in LMStudio settings (if you have a compatible GPU)

### Issue: AI gives incorrect information

**Solution:**
- The AI is only as good as the data in your database
- Ensure your database has sample data populated
- Try rephrasing your question more specifically
- Clear conversation history and try again

### Issue: Chat button not appearing

**Solution:**
- Ensure you're logged in
- Check browser console for errors (F12)
- Verify the AIAssistant component is imported in your dashboard
- Try refreshing the page

## Performance Optimization

### For Better Speed:

1. **Use GPU Acceleration** (if available):
   - In LMStudio, go to Settings
   - Enable GPU acceleration
   - Restart the server

2. **Adjust Context Length**:
   - In LMStudio server settings
   - Reduce "Context Length" to 2048 or 4096
   - This uses less memory and responds faster

3. **Limit Conversation History**:
   - Click "Clear" in the chat interface periodically
   - This prevents the AI from processing too much context

### For Better Accuracy:

1. **Provide More Context**:
   - Ask specific questions with details
   - Example: Instead of "appointments", ask "my upcoming appointments this week"

2. **Use Proper Terminology**:
   - Use medical/hospital terms when appropriate
   - Be specific about dates, names, and specializations

## Features by Role

### Patient Features:
- View upcoming and past appointments
- Check medical history and records
- Find available doctors by specialization
- Get help with booking appointments
- General hospital information

### Doctor Features:
- View daily schedule
- Check appointment statistics
- Access patient information (for their patients)
- Get insights about workload
- Administrative queries

### Admin Features:
- System-wide statistics and analytics
- View all appointments, patients, and doctors
- Identify trends and patterns
- Operational insights
- Decision-making support

## Security & Privacy

✅ **All AI processing happens locally** - No data is sent to external servers  
✅ **Role-based access control** - Users only see their own data  
✅ **Read-only access** - AI cannot modify database records  
✅ **Conversation history** - Stored temporarily in memory, cleared on logout  

## Advanced Configuration

### Change LMStudio Port

If you need to use a different port:

1. In `src/backend/ai-service.js`, modify the client initialization:
```javascript
const client = new LMStudioClient({ 
  baseUrl: 'ws://localhost:YOUR_PORT' 
});
```

2. Update the port in LMStudio's Local Server settings

### Use a Different Model

To use a different model:

1. Download your preferred model in LMStudio
2. Update the model identifier in `src/backend/ai-service.js`:
```javascript
const model = await client.llm.get({ 
  identifier: 'your-model-name' 
});
```

## Getting Help

If you encounter issues not covered in this guide:

1. Check LMStudio logs in the application
2. Check backend console for error messages
3. Check browser console (F12) for frontend errors
4. Ensure all dependencies are installed (`npm install`)
5. Verify database connection is working

## Next Steps

- Experiment with different questions
- Provide feedback on AI responses
- Suggest additional features or improvements
- Consider training a custom model for medical terminology (advanced)

---

**Enjoy your AI-powered hospital management system!** 🚀
