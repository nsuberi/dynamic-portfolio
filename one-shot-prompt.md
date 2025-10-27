Follow the instructions in the shared prompt, and create a React website and sample data that I can run locally to demonstrate this dynamic-portfolio component.

<feedback1>

This doesn't seem to be actually using an API call to OpenAI in order to make choices about what to display. The chat is brittle.

next steps:
* implement a connection to OpenAI API, I will provide an API key in a .env file
* the call to this API should do the following:
** look at the metadata for id, tags, mood, and description, and submit those along with the user request, to get OpenAI's suggestion for which pieces to show. 
** verify that the id's returned are exact matches to some data that we submitted
** only then render the dynamic portfolio

</feedback1>

<feedback2>

I do not see any button to "submit" the request to OpenAI in the main UI.
No change should happen to the rendered images until after I submit.

Create a component for displaying OpenAI API call debug information.
For debugging display in the UI both the full request that you send to OpenAI, and it's full response after receiving it.
When you print the request, make sure to obscure any API keys.
Make the debug component include the option to collapse, or view the debug info in full.

</feedback2>

<feedback3>

There should be a way to go to another page view to see all of the pieces in a vertical list, where you can see the piece of media, and all the associated metadata.

</feedback3>

<feedback4>

When switching to the All Portfolio list view, remove the chat box for requesting to filter the pieces, and the OpenAI debugging information. Both of these should only be displayed on the Gallery component.

</feedback4>



<sample-data>

This interface will be used to create portfolios for 4 different audiences:
* a radio doing public broadcasting
* film industry for a creative director fellowship
* arts and literature magazine creative direction
* communication strategist and branding creative director in a corporate setting

Generate a set of 5 sample pieces of written content, and links to videos on the internet, and audio files on the internet that would be appropriate to emphasize each of these. They can be overlapping.

Ensure that the preview photos and videos work for each of the pieces that are going to render in the portfolio.

</sample-data>



<design direction>

Use black and white design
Use palatina text for document text
Use a sans-serif caviar-dreams for the headers and descriptions and other site text.

</design direction>


<persona>

You are an expert in web development and graphic design.
You are knowledgable of all the popular layout grid libraries in React, and pick one strategically to be able to serve this particular need, of a non-regular grid of images / videos / sound clips.
You are familiar with all of the directory requirements of Create React App
You use Node.js v20.16.0 and the latest version of react, and create-react-app

</persona>

<instructions>

You are going to create a component for rendering a selection of pieces in an artist's portfolio.
You will provide an input for a user to describe what parts of their portfolio they want to emphasize.
Not the particular pieces, they are going to describe the feeling they want to convey, and the audience that they are hoping to communicate with.

Imagine that any specific call to action, i.e. to contact the artist, etc, is going to be handled by a different component.

The visual layouts should be in the style of a gallery wall, where different pieces of art are displayed in a non-regular grid - i.e. some of the pieces are larger than others. The layout should minimize the white space in between all of the pieces, while maintaining a bar of white space around all 4 edges of all pieces included in the grid.

</instructions>

<example>
</example>

<context>
You will have access to a database of documents, audio files, images and videos.
For the first version of this, generate example documents, audio files, images and videos to use as your source database.

</context>

<output>

A demo page showcasing a dynamic-portfolio component
The demo page should have a basic header and decription, and then a single dynamic-portfolio component.
This shows a text box asking a user for what they want to convey with their portfolio,
it then renders the "wall of art" view.
Each piece when rendered, and clicked on, pops up to give more details on the piece.
In the case of audio, it should just play the audio instead of a popup.

</output>

