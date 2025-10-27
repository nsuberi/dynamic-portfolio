<splice-fetcher>

Write a component to search splice for information about a certain file name.
This file was downloaded from a splice Desktop app.

Use GPT-4o 
Submit the audio file, and let the model know that it can also access Splice via the internet to try to scrape information about the file, metadata like tags, descriptions, artist names, etc.
Parse the GPT-4o response, and save the info in a local json datafile, 
matching the file references with the metadata.
This metadata will be used to display and search the sound bites
in the gallery portfolio

Items from Splice are downloaded to a location like this:

/Users/nathansuberi/Splice/sounds/packs/Summer's Soul/Soul_Surplus_-_Summer_Soul/Loops/Melodic_Loops/SLS_SS_75_finally_Gmin/SLS_SS_75_music_loop_resample_finally_Bmin.wav

Use and/or extend the existing OpenAI connector in this app

The splice preview and download buttons should be functional      │
 │ - they currently do nothing. Assume all files are local.   

Add a debug section that shows the entire request and response,
Re-use the available module to redact API keys from the request

Ensure that the audio files in the preview can be listened to multiple times

The most-recent debug info should be displayed on the main Splice sounds page,
as well as in the preview cards.

The audio preview card is not able to render the debug information
it seems to be spilling out of the bottom and inaccessible.
This could be due to the type of modal being used.


</splice-fetcher>