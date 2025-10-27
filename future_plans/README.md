<version-viewer>

Create multiple versions of this site using different one-shot-prompts.

Include the ability to switch rendering between multiple sites, 
in an i-frame, 
with a view of the one-shot-prompt used to create them on the left.

The site should be interact-able in the side pane, as if it were the entire web-view.
Also include a button to render that version of the site in a new tab.

</version-viewer>

<audio-processing>

There is no single open-source, Shazam-like tool that works directly with React because music recognition is a complex process that generally requires server-side processing. Instead, you will need to build an application with React that sends an audio clip to a server, where an open-source library can perform the analysis and return the result. 
Here are the primary components needed to build an open-source music recognition app with React:
1. Server-side recognition libraries
These libraries perform the heavy lifting of fingerprinting the audio and matching it against a database of songs. They are typically written in more performant languages like Python or Rust.
Vibra: A cross-platform music recognition library that uses the unofficial Shazam API to identify songs.
How it works: Vibra analyzes an audio file, creates a unique fingerprint, and queries the Shazam database.
Server-side implementation: You can set up a small web server (e.g., using Python with Flask or FastAPI) that exposes an API endpoint. Your React app would send the audio recording to this endpoint for recognition.
Dejavu: An open-source audio fingerprinting and music recognition library written in Python.
How it works: Dejavu generates audio fingerprints and can match an audio sample to a song in its own database. This requires you to first build your own database of music to match against, which can be a significant undertaking.
Essentia: An open-source C++ library for audio analysis that includes functionality for music analysis, feature extraction, and music information retrieval.
How it works: Essentia can be used to extract musical features like tempo, key, and rhythm. It's best for analyzing song characteristics rather than a simple song identification.
Server-side implementation: Like Vibra, you would use Essentia to process audio files on a server and communicate with it via an API. 
2. React components for the user interface
On the front end, a React application is needed to record the user's microphone input and send the data to your server.
MediaStream Recording API: Modern browsers provide a native MediaStream Recording API that can be used directly within a React component to capture audio from the user's microphone. The captured audio can then be sent to your server via a fetch request.
Third-party React libraries: While less common for recognition, libraries like react-mic or react-audio-recorder can provide pre-built components for recording audio in your React app. 
3. A simple architecture for a React-based app
React Frontend:
A React component uses the browser's MediaStream Recording API to record a short audio clip.
When the user stops recording, the component sends the audio blob to your server's API.
Server Backend:
The server (e.g., Node.js, Python) receives the audio blob.
The server uses a library like Vibra or Dejavu to process the audio and get the song match.
The server sends the song information (artist, title, etc.) back to the React front end.
React Frontend:
The React app receives the data from the server and displays the song information to the user. 
Important consideration: Creating a true Shazam-like system requires access to a massive database of songs. The primary challenge with open-source recognition is building or acquiring a sufficiently large song database. Solutions like Vibra that use the existing Shazam API are a good workaround but rely on a third-party service. 

</audio-processing>

<style>

Ensure contrast between text colors and backgrounds.
Use mobile responsive classes everywhere.

</style>
