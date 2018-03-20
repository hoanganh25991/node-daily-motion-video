# Installation Guide
Convert to mp3 with ffmpeg module for nodejs: [node-fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg#)

+ Note: Install ffmpeg's [prerequisites](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg#prerequisites) first

While downloading video, run convert mp3 on stream's chunk and return back to user

Really fast to convert mp3 in this stragery

Steps to run server

    1. Install dependency packages
    2. Run node server
    
### Step 1: Install dependency packages
Run
    npm install
    // Faster with yarn
    
### Step 2: Run node server
Run
    npm run start
    // Config SERVER_PORT env to config server port
    // Default: 3000
 
# API
Convert video's url to hex string

https://codebeautify.org/string-hex-converter

Call API as GET method with param: url

    HOST_SERVER/?url=[hex-string]
    
# Code structure
Under `src` folder

    src
    ├── convert.js          <-- Call ffmpeg API to convert mp3 on video stream
    ├── getVideoStream.js   <-- Get video stream from url
    ├── server.js           <-- Node server response converted chunk to customer
