// Client-side JavaScript for the tool page
// Handles form submission and displays responses

document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('url');
    const questionInput = document.getElementById('question');
    const askButton = document.getElementById('askButton');
    const buttonText = askButton.querySelector('.button-text');
    const buttonLoader = askButton.querySelector('.button-loader');
    const responseSection = document.getElementById('responseSection');
    const responseContent = document.getElementById('responseContent');
    const errorSection = document.getElementById('errorSection');
    const errorMessage = document.getElementById('errorMessage');

    askButton.addEventListener('click', async () => {
        // Get input values
        const url = urlInput.value.trim();
        const question = questionInput.value.trim();

        // Hide previous responses
        responseSection.style.display = 'none';
        errorSection.style.display = 'none';

        // Basic validation
        if (!url || !question) {
            showError('Please fill in both the URL and question fields');
            return;
        }

        // Show loading state
        askButton.disabled = true;
        buttonText.style.display = 'none';
        buttonLoader.style.display = 'inline-flex';

        try {
            // Call the API
            const response = await fetch('/api/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url, question })
            });

            const data = await response.json();

            if (response.ok) {
                // Show success response
                showResponse(data.answer);
            } else {
                // Show error from API
                showError(data.error || 'An error occurred');
            }

        } catch (error) {
            console.error('Request failed:', error);
            showError('Failed to connect to the server. Please try again.');
        } finally {
            // Reset button state
            askButton.disabled = false;
            buttonText.style.display = 'inline';
            buttonLoader.style.display = 'none';
        }
    });

    // Allow Enter key in question textarea (with Shift for new lines)
    questionInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            askButton.click();
        }
    });

    function showResponse(answer) {
        responseContent.textContent = answer;
        responseSection.style.display = 'block';
        responseSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorSection.style.display = 'block';
        errorSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
});
